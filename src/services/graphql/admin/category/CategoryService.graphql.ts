import getServiceEndpoint from "@/utils/HostnameResolver.ts";
import {FilterRequest, PageRequest} from "@/types/graphql/query.types.ts";
import {Category} from "@/types/admin/CategoryTypes.ts";
import {GraphQLService} from "@/services/graphql/GraphQLService.ts";
import {
    ALL_CATEGORY,
    CATEGORY_COUNT,
    CREATE_CATEGORY,
    DELETE_CATEGORY,
    GET_CATEGORY,
    UPDATE_CATEGORY
} from "./category.queries.ts";

const graphQLEndpoint = getServiceEndpoint(8080) + '/api/graphql';

export async function apiGetAllCategories(pageRequest: PageRequest, filterRequest: FilterRequest): Promise<Category[]> {

    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

    const result = await client.request<{ allCategories: Category[] }>(ALL_CATEGORY, {
        pageRequest,
        filterRequest,
    });

    return result.allCategories ?? [];
}

export async function apiGetCategoryCount(filterRequest: FilterRequest): Promise<number> {

    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

    const result = await client.request<{ categoryCount: number }>(CATEGORY_COUNT, {
        filterRequest,
    });

    return result.categoryCount ?? 0;
}

export async function apiGetCategory(id: string): Promise<Category> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

    const result = await client.request<{ category: Category }>(GET_CATEGORY, {id});

    return result.category;
}

export async function apiCreateCategory(categoryDto: Omit<Category, 'id'>): Promise<void> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    await client.request(CREATE_CATEGORY, {categoryDto});
}

export async function apiUpdateCategory(id: string, categoryDto: Omit<Category, 'id'>): Promise<void> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    await client.request(UPDATE_CATEGORY, {id, categoryDto});
}

export async function apiDeleteCategory(id: string): Promise<void> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    await client.request(DELETE_CATEGORY, {id});
}
