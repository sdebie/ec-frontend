import getServiceEndpoint from "@/utils/HostnameResolver.ts";
import {Staff} from "@/types/admin/StaffTypes.ts";
import {GraphQLService} from "@/services/graphql/GraphQLService.ts";
import {STAFF_COUNT, STAFF_LIST} from "./staff.queries.ts";
import {FilterRequest, PageRequest} from "@/types/graphql/query.types.ts";

const graphQLEndpoint = getServiceEndpoint(8080) + '/api/graphql';

export async function apiGetStaffList(pageRequest: PageRequest, filterRequest: FilterRequest): Promise<Staff[]> {

    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

    const result = await client.request<{ staffList: Staff[] }>(STAFF_LIST, {
        pageRequest,
        filterRequest,
    });

    return result.staffList ?? [];
}

export async function apiGetStaffCount(filterRequest: FilterRequest): Promise<number> {

    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

    const result = await client.request<{ staffCount: number }>(STAFF_COUNT, {
        filterRequest,
    });

    return result.staffCount ?? 0;
}
