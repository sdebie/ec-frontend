import getServiceEndpoint from "@/utils/HostnameResolver.ts";
import {Brand} from "@/types/admin/brand.types.ts";
import {GraphQLService} from "@/services/graphql/GraphQLService.ts";
import {
    ALL_BRANDS,
    BRAND_COUNT,
    CREATE_BRAND,
    DELETE_BRAND,
    UPDATE_BRAND
} from "@/services/graphql/admin/brand/BrandQueries.ts";
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
