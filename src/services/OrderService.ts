import getServiceEndpoint from "../utils/HostnameResolver";
import { GraphQLService } from "./GraphQLService";
import { OrderData, CustomerInformation } from "../pages/cart/types";
import { gql } from "graphql-request";
import { CartStore } from "../state/CartStore";

// Allow environment variable override for production deployments
const envGraphQl = (typeof import.meta !== 'undefined' && (import.meta as any).env)
    ? ((import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL)
    : (process?.env?.VITE_API_URL || process?.env?.REACT_APP_API_URL);

const graphQlEndpoint = (envGraphQl && envGraphQl.length > 0)
    ? envGraphQl
    : getServiceEndpoint(8080) + '/api/graphql';

export type OrderResponse = {
    orderById: OrderData;
}

export async function createOrder<U>(order: OrderData): Promise<U> {
    const mutation = gql`
        mutation CreateOrder($order: OrderDtoInput!) {
            createOrder(order: $order){
                id
                status
                totalAmount
                items { unitPrice quantity variant { id product { name }  } }
            }
        }
    `;

    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);

    const result = await client.request(mutation, {
        order: {
            orderId: order.id ?? undefined,
            sessionId: CartStore.getOrderSessionId() ?? undefined,
            items: order.items ?? []
        }
    });

    // Return only the created order payload from GraphQL response
    return (result?.createOrder ?? result) as U;
}

//
// export async function apiAddToCart<U>(order: OrderData): Promise<U> {
//     const mutation = gql`
//         mutation AddToCart($order: OrderDtoInput!) {
//             addToCart(order: $order){
//                 id
//                 status
//                 totalAmount
//                 items { unitPrice quantity variant { id product { name }  } }
//             }
//         }
//     `;
//
//     const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
//
//     const result = await client.request(mutation, {
//         order: {
//             orderId: order.id ?? undefined,
//             sessionId: CartStore.getOrderSessionId() ?? undefined,
//             items: order.items ?? []
//         }
//     });
//
//     // Return only the created/updated order payload from GraphQL response
//     return (result?.addToCart ?? result) as U;
// }

// Common, framework-agnostic function to add/update an order in the cart
// Refactored: only saves locally via CartStore/LocalStorage and DOES NOT persist to backend
export async function addToCart(order: OrderData): Promise<OrderData> {
    const LS_KEY = 'ec_cart_order_items';

    // Normalize incoming items
    const incoming = Array.isArray(order?.items) ? order.items! : [];

    // Read existing items from localStorage
    let existing: any[] = [];
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;
        existing = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(existing)) existing = [];
    } catch (_) {
        existing = [];
    }

    // Merge by variant.id when available; otherwise append
    const merged: any[] = [...existing];
    for (const inc of incoming) {
        const vid = (inc as any)?.variant?.id;
        if (vid == null) {
            merged.push({ ...inc });
            continue;
        }
        const idx = merged.findIndex((m) => (m?.variant?.id) === vid);
        if (idx >= 0) {
            const prev = merged[idx] || {};
            const newQty = Number(prev.quantity || 0) + Number(inc.quantity || 0) || 0;
            merged[idx] = {
                ...prev,
                ...inc,
                quantity: newQty,
                // keep the latest unitPrice if provided, else previous
                unitPrice: (typeof inc.unitPrice === 'number' ? inc.unitPrice : prev.unitPrice)
            };
        } else {
            merged.push({ ...inc });
        }
    }

    // Persist locally for cross-tab visibility and refresh
    try {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(LS_KEY, JSON.stringify(merged));
        }
    } catch (_) {}

    // Update global cart badge/state
    const localOrder: OrderData = { ...(order || {}), items: merged };
    CartStore.setFromOrder(localOrder);
    return localOrder;
}

export async function apiOrderById(id: number): Promise<OrderData> {
    console.log("graphQL:: Get Order by id request", id);
    const query = gql`
        query OrderById($id: BigInteger!) {
            orderById(id: $id) {
                id
                status
                totalAmount
                items { unitPrice quantity variant }
            }
        }
    `;

    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const response = await client.request<OrderResponse>(query, { id });

    console.log("graphQL:: Order by id response: ", response.orderById);
    return response.orderById;
}

export async function apiOrderBySessionId(sessionId: string): Promise<OrderData> {
    console.log("graphQL:: Get Order by sessionId request", sessionId);
    const query = gql`
        query OrderBySessionId($sessionId: String!) {
            orderBySessionId(sessionId: $sessionId) {
                id
                status
                totalAmount
                items { unitPrice quantity }
            }
        }
    `;

    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const response = await client.request<{ orderBySessionId: OrderData }>(query, { sessionId });

    console.log("graphQL:: Order by sessionId response: ", response.orderBySessionId);
    return response.orderBySessionId;
}

// --- New: client for updateCustomerInformation mutation ---
export async function apiUpdateCustomerInformation(
    customer: CustomerInformation,
    sessionId?: string
): Promise<CustomerInformation> {
    const sid = sessionId || CartStore.getOrderSessionId();
    if (!sid) {
        throw new Error('Missing sessionId to update customer information');
    }
    if (!customer || !customer.email) {
        throw new Error('Email is required to update customer information');
    }
    console.log("DEBUG:: Updating customer information for sessionId: ", sid, " with email: ", customer.email);
    const mutation = gql`
        mutation UpdateCustomerInformation($sessionId: String!, $customer: CustomerDtoInput!) {
            updateCustomerInformation(sessionId: $sessionId, customer: $customer) {
                email
            }
        }
    `;

    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const result = await client.request<{ updateCustomerInformation: CustomerInformation }>(mutation, {
        sessionId: sid,
        customer: { email: customer.email }
    });

    return result.updateCustomerInformation;
}

// Convenience wrapper returning only CustomerInformation; does not mutate CartStore
export async function updateCustomerInformation(
    customer: CustomerInformation,
    sessionId?: string
): Promise<CustomerInformation> {
    const updated = await apiUpdateCustomerInformation(customer, sessionId);
    return updated;
}
