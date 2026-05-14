import { GraphQLService } from '@/services/graphql/GraphQLService.ts';
import {
    WholesaleApplicationDetails,
    WholesaleApplicationListItem,
    WholesaleCustomer,
    WholesaleCustomerInput,
} from '@/types/admin/WholesaleCustomerTypes.ts';
import { FilterRequest, PageRequest } from '@/types/graphql/query.types.ts';
import getServiceEndpoint from '@/utils/HostnameResolver.ts';

import {
    ALL_WHOLESALE_APPLICATIONS,
    CREATE_WHOLESALE_APPLICATION,
    CREATE_WHOLESALE_CUSTOMER_FROM_APPLICATION,
    GET_WHOLESALE_APPLICATION,
    WHOLESALE_APPLICATION_COUNT,
} from './wholesaleCustomer.queries.ts';

const graphQLEndpoint = getServiceEndpoint(8080) + '/api/graphql';

/**
 * Converts a wholesale application to a wholesale customer account.
 *
 * @param applicationId - Existing wholesale application id
 * @returns Promise resolving to the created WholesaleCustomer
 */
export async function createWholesaleCustomerFromApplication(
    applicationId: string
): Promise<WholesaleCustomer> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ createWholesaleCustomer: WholesaleCustomer }>(
        CREATE_WHOLESALE_CUSTOMER_FROM_APPLICATION,
        { applicationId }
    );

    return result.createWholesaleCustomer;
}

/**
 * Creates a wholesale application record via GraphQL.
 */
export async function createWholesaleApplication(
    customer: WholesaleCustomerInput
): Promise<WholesaleCustomer> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ createWholesaleApplication: WholesaleCustomer }>(
        CREATE_WHOLESALE_APPLICATION,
        { customer }
    );

    return result.createWholesaleApplication;
}

export async function apiGetAllWholesaleApplications(
    pageRequest: PageRequest,
    filterRequest: FilterRequest
): Promise<WholesaleApplicationListItem[]> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ allWholesaleApplications: WholesaleApplicationListItem[] }>(
        ALL_WHOLESALE_APPLICATIONS,
        {
            pageRequest,
            filterRequest,
        }
    );

    return result.allWholesaleApplications ?? [];
}

export async function apiGetWholesaleApplicationCount(filterRequest: FilterRequest): Promise<number> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ wholesaleApplicationCount: number }>(
        WHOLESALE_APPLICATION_COUNT,
        { filterRequest }
    );

    return result.wholesaleApplicationCount ?? 0;
}

export async function apiGetWholesaleApplication(id: string): Promise<WholesaleApplicationDetails> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ wholesaleApplication: WholesaleApplicationDetails }>(
        GET_WHOLESALE_APPLICATION,
        { id }
    );

    return result.wholesaleApplication;
}

