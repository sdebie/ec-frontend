import getServiceEndpoint from "../utils/HostnameResolver";
import {GraphQLService} from "./GraphQLService";
import {OrderData} from "../pages/types";

const graphQlEndpoint = getServiceEndpoint(8080) + '/api/graphql';

export async function apiCreateOrder<U>(order: OrderData): Promise<U> {
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
    // Ensure backend non-null BigInteger! requirement for orderId by generating one when missing
    // Build the order input; do not force an orderId during creation
    const orderInput: any = {
        items: order.items ?? [],
    };

    // Map total amount from various possible caller keys to the expected GraphQL 'totalAmount'
    const mappedTotalAmount = order.totalAmount ?? order.total_amount ?? order.amount;
    if (mappedTotalAmount !== undefined && mappedTotalAmount !== null) {
        orderInput.totalAmount = mappedTotalAmount;
    }

    // Include orderId only if caller provided one
    const providedId = order.orderId ?? order.id;
    if (providedId !== undefined && providedId !== null) {
        orderInput.orderId = providedId;
    }

    const variables = {
        order: orderInput,
    };

    // Optional debug: comment out if too noisy
    // console.debug('DEBUG gql variables for createOrder:', variables);

    const result = await client.request<any>(query, variables);

    // Return only the created order payload
    return (result?.createOrder ?? result) as U;
}