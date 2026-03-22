import getServiceEndpoint from "@/utils/HostnameResolver.ts";
import {Brand} from "@/services/graphql/admin/brand/brand.types.ts";
import {GraphQLService} from "@/services/graphql/GraphQLService.ts";
import {ALL_BRANDS, BRAND_COUNT} from "@/services/graphql/admin/brand/brand.queries.ts";
import {FilterRequest, PageRequest} from "@/types/graphql/query.types.ts";

const graphQLEndpoint = getServiceEndpoint(8080) + '/api/graphql';


export async function apiGetAllBrands(pageRequest: PageRequest, filterRequest: FilterRequest): Promise<Brand[]> {

    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

    const result = await client.request<{ allBrands: Brand[] }>(ALL_BRANDS, {
        pageRequest,
        filterRequest,
    });

    return result.allBrands ?? [];
}

export async function apiGetBrandCount(filterRequest: FilterRequest): Promise<number> {

    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

    const result = await client.request<{ brandCount: number }>(BRAND_COUNT, {
        filterRequest,
    });

    return result.brandCount ?? 0;
}
