import getServiceEndpoint from "@/utils/HostnameResolver.ts";
import {Staff} from "@/types/admin/StaffTypes.ts";
import {GraphQLService} from "@/services/graphql/GraphQLService.ts";
import {CREATE_STAFF, STAFF_BY_ID, STAFF_COUNT, STAFF_LIST, UPDATE_STAFF} from "./staff.queries.ts";
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

type StaffMutationInput = {
    email: string;
    fullName?: string | null;
    role: Staff["role"];
    active: boolean;
    resetPassword?: boolean;
    temporaryPassword?: string;
};

export async function apiGetStaff(id: string): Promise<Staff> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ staffById: Staff }>(STAFF_BY_ID, {id});
    return result.staffById;
}

export async function apiCreateStaff(staffDto: StaffMutationInput): Promise<void> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    await client.request(CREATE_STAFF, {staffDto});
}

export async function apiUpdateStaff(id: string, staffDto: StaffMutationInput): Promise<void> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    await client.request(UPDATE_STAFF, {id, staffDto});
}

