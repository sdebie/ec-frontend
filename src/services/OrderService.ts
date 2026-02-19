import getServiceEndpoint from "../utils/HostnameResolver";
import {GraphQLService} from "./GraphQLService";
import {OrderData} from "../pages/types";
import {gql} from "graphql-request";
import { CartStore } from "../state/CartStore";

const graphQlEndpoint = getServiceEndpoint(8080) + '/api/graphql';

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

    const result = await client
        .request(mutation, {
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
    const response = await client
        .request<OrderResponse>(query, { id });

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
    const response = await client
        .request<{ orderBySessionId: OrderData }>(query, { sessionId });

    console.log("graphQL:: Order by sessionId response: ", response.orderBySessionId);
    return response.orderBySessionId;
}