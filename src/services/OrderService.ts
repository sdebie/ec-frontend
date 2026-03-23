import getServiceEndpoint from "../utils/HostnameResolver";
import { GraphQLService } from "./graphql/GraphQLService.ts";
import { OrderData } from "@/pages/shop/cart/types";
import { gql } from "graphql-request";
import { CartStore } from "../store/CartStore.ts";
import { OrderStatus } from "@/constants/enums/OrderStatus";

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
                items { unitPrice quantity variant { id product { name } stockQuantity attributesJson weightKg } }
            }
        }
    `;

    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);

    const result = await client.request(mutation, {
        order: {
            orderId: order.id ?? undefined,
            sessionId: (order.sessionId ?? CartStore.getOrderSessionId()) ?? undefined,
            items: order.items ?? []
        }
    });

    // Return only the created order payload from GraphQL response
    return (result?.createOrder ?? result) as U;
}


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
        // Handle both object variant (with .id) and string variant (ID itself)
        const vid = (typeof inc.variant === 'string') 
            ? inc.variant 
            : (inc.variant as any)?.id;

        if (vid == null) {
            merged.push({ ...inc });
            continue;
        }
        
        // Find existing item with same variant ID
        const idx = merged.findIndex((m) => {
            const mVid = (typeof m.variant === 'string') 
                ? m.variant 
                : (m.variant as any)?.id;
            return mVid === vid;
        });

        if (idx >= 0) {
            const prev = merged[idx] || {};
            const newQty = Number(prev.quantity || 0) + Number(inc.quantity || 0) || 0;
            merged[idx] = {
                ...prev,
                ...inc,
                quantity: newQty,
                // keep the latest unitPrice if provided, else previous
                unitPrice: (typeof inc.unitPrice === 'number' ? inc.unitPrice : prev.unitPrice),
                // Ensure we preserve the variant structure if we have a better one (object vs string)
                variant: (typeof inc.variant === 'object' && inc.variant !== null) ? inc.variant : prev.variant
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

export async function apiOrderById(id: string): Promise<OrderData> {
    console.log("graphQL:: Get Order by id request", id);
    const query = gql`
        query OrderById($id: String!) {
            orderById(id: $id) {
                id
                status
                totalAmount
                items { unitPrice quantity variant { id product { name } stockQuantity attributesJson weightKg } }
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
                items { unitPrice quantity variant { id product { name } stockQuantity attributesJson weightKg } }
            }
        }
    `;

    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const response = await client.request<{ orderBySessionId: OrderData }>(query, { sessionId });

    console.log("graphQL:: Order by sessionId response: ", response.orderBySessionId);
    return response.orderBySessionId;
}


// --- New: client for updateOrderStatus mutation ---
export async function apiUpdateOrderStatus(
    status: OrderStatus,
    sessionId?: string
): Promise<{ id: string; status: string } | null> {
    const sid = sessionId || CartStore.getOrderSessionId();
    if (!sid) {
        throw new Error('Missing sessionId to update order status');
    }
    const mutation = gql`
        mutation UpdateOrderStatus($sessionId: String!, $status: String!) {
            updateOrderStatus(sessionId: $sessionId, status: $status) {
                id
                status
            }
        }
    `;
    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const result = await client.request<{ updateOrderStatus: { id: string; status: string } }>(mutation, {
        sessionId: sid,
        status
    });
    return result?.updateOrderStatus ?? null;
}
