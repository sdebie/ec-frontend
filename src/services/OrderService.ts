import getServiceEndpoint from "../utils/HostnameResolver";
import {GraphQLService} from "./GraphQLService";
import {OrderData} from "../pages/types";
import {gql} from "graphql-request";

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
                items: order.items ?? []
            }
        });

    // Return only the created/updated order payload from GraphQL response
    return (result?.addToCart ?? result) as U;
}

export async function apiOrderById(id: string): Promise<OrderData> {
    console.log("graphQL:: Get Order by id request", id);
    const query = gql`
        query OrderById($id: String!) {
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