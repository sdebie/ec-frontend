import { GraphQLService } from '@/services/graphql/GraphQLService.ts';
import {
    WholesaleCustomer,
    WholesaleCustomerInput,
} from '@/types/admin/WholesaleCustomerTypes.ts';
import getServiceEndpoint from '@/utils/HostnameResolver.ts';

import {
    CREATE_WHOLESALE_CUSTOMER,
    UPDATE_WHOLESALE_CUSTOMER,
} from './wholesaleCustomer.queries.ts';

const graphQLEndpoint = getServiceEndpoint(8080) + '/api/graphql';

export async function apiCreateWholesaleCustomer(
    customer: WholesaleCustomerInput
): Promise<WholesaleCustomer> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ createWholesaleCustomer: WholesaleCustomer }>(
        CREATE_WHOLESALE_CUSTOMER,
        { customer }
    );

    return result.createWholesaleCustomer;
}

export async function apiUpdateWholesaleCustomer(
    id: string,
    customer: WholesaleCustomerInput
): Promise<WholesaleCustomer> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ updateWholesaleCustomer: WholesaleCustomer }>(
        UPDATE_WHOLESALE_CUSTOMER,
        { id, customer }
    );

    return result.updateWholesaleCustomer;
}

