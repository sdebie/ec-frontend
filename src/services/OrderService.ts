import getServiceEndpoint from "../utils/HostnameResolver";
import {GraphQLService} from "./GraphQLService";

export interface OrderData {
    id: string;
    createdAt: string;
    updatedAt: string;
    amount: number;
    status: string;
}

const graphQlEndpoint = getServiceEndpoint(8109) + '/api/ordering/graphql';

export async function apiCreateOrder<U>(order: any): Promise<U> {
    // Build a GraphQL query for the backend's createOrder query
    const query = `
        query CreateOrder($order: OrderDtoInput!) {
            createOrder(order: $order) {
                id
                status
            }
        }
    `;

    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);

    // Map the incoming order to the expected DTO shape
    const variables = {
        order: {
            orderId: order.orderId ?? order.id ?? null,
            items: order.items ?? [],
        }
    };

    const result = await client.request<any>(query, variables);

    // Return only the created order payload
    return (result?.createOrder ?? result) as U;
}