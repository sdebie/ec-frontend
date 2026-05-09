
import {GraphQLService} from "@/services/graphql/GraphQLService.ts";
import {Brand} from "@/types/admin/BrandTypes.ts";
import {FilterRequest, PageRequest} from "@/types/graphql/query.types.ts";
import getServiceEndpoint from "@/utils/HostnameResolver.ts";

import {ALL_BRANDS, BRAND_COUNT, CREATE_BRAND, DELETE_BRAND, GET_BRAND, UPDATE_BRAND} from "./brand.queries.ts";

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

export async function apiGetBrand(id: string): Promise<Brand> {

    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

    const result = await client.request<{ brand: Brand }>(GET_BRAND, {id});

    return result.brand;
}

export async function apiCreateBrand(brandDto: Omit<Brand, 'id'>): Promise<void> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    await client.request(CREATE_BRAND, {brandDto});
}

export async function apiUpdateBrand(id: string, brandDto: Omit<Brand, 'id'>): Promise<void> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    await client.request(UPDATE_BRAND, {id, brandDto});
}


export async function apiDeleteBrand(id: string): Promise<void> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    await client.request(DELETE_BRAND, {id});
}
