import getServiceEndpoint from "../utils/HostnameResolver";
import { GraphQLService } from "./GraphQLService";
import { OrderData, CustomerInformation } from "../pages/types";
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

export async function apiAddToCart<U>(order: OrderData): Promise<U> {
    const mutation = gql`
        mutation AddToCart($order: OrderDtoInput!) {
            addToCart(order: $order){
                id
                status
                totalAmount
                items { unitPrice quantity }
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

    // Return only the created/updated order payload from GraphQL response
    return (result?.addToCart ?? result) as U;
}

// Common, framework-agnostic function to add/update an order in the cart
// Accepts OrderData and updates the global CartStore, returning the created order
export async function addToCart(order: OrderData): Promise<OrderData> {
    const created = await apiAddToCart<OrderData>(order);
    // Update global cart state (badge count + last order id) in one place
    CartStore.setFromOrder(created);
    return created;
}

export async function apiOrderById(id: number): Promise<OrderData> {
    console.log("graphQL:: Get Order by id request", id);
    const query = gql`
        query OrderById($id: BigInteger!) {
            orderById(id: $id) {
                id
                status
                totalAmount
                items { unitPrice quantity }
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
export async function apiUpdateCustomerInformation<U>(
    customer: CustomerInformation,
    sessionId?: string
): Promise<U> {
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
                id
                status
                totalAmount
                items { unitPrice quantity }
            }
        }
    `;

    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const result = await client.request(mutation, {
        sessionId: sid,
        customer: { email: customer.email }
    });

    return (result?.updateCustomerInformation ?? result) as U;
}

// Convenience wrapper returning OrderData and updating CartStore
export async function updateCustomerInformation(
    customer: CustomerInformation,
    sessionId?: string
): Promise<OrderData> {
    const updated = await apiUpdateCustomerInformation<OrderData>(customer, sessionId);
    CartStore.setFromOrder(updated);
    return updated;
}
