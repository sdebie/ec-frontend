import getServiceEndpoint from "../utils/HostnameResolver";
import { GraphQLService } from "./GraphQLService";
import { gql } from "graphql-request";

const envGraphQl = (typeof import.meta !== 'undefined' && (import.meta as any).env)
    ? ((import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL)
    : (process?.env?.VITE_API_URL || process?.env?.REACT_APP_API_URL);

const graphQlEndpoint = (envGraphQl && envGraphQl.length > 0)
    ? envGraphQl
    : getServiceEndpoint(8080) + '/api/graphql';

export type CategoryData = {
    id: number;
    name: string;
    description: string;
    parent: CategoryData;
    children: CategoryData[];
};

export type AllCategoriesResponse = {
    allCategories: CategoryData[];
}

export type CategoryResponse = {
    category: CategoryData;
}

export async function getAllCategories(): Promise<CategoryData[]> {
    const query = gql`
        query AllCategories {
            allCategories {
                id
                name
                description
            }
        }
    `;

    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const response = await client.request<AllCategoriesResponse>(query);

    return response.allCategories;
}

export async function getCategoryById(id: number): Promise<CategoryData> {
    const query = gql`
        query CategoryById($id: Int!) {
            category(id: $id) {
                id
                name
                description
                parent {
                    id
                    name
                }
                children {
                    id
                    name
                }
            }
        }
    `;

    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const response = await client.request<CategoryResponse>(query, { id });

    return response.category;
}

export async function createCategory(category: Partial<CategoryData>): Promise<CategoryData> {
    const mutation = gql`
        mutation CreateCategory($category: CategoryEntityInput!) {
            createCategory(category: $category) {
                id
                name
                description
            }
        }
    `;

    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const response = await client.request<{ createCategory: CategoryData }>(mutation, { category });

    return response.createCategory;
}

export async function updateCategory(category: Partial<CategoryData>): Promise<CategoryData> {
    const mutation = gql`
        mutation UpdateCategory($category: CategoryEntityInput!) {
            updateCategory(category: $category) {
                id
                name
                description
            }
        }
    `;

    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const response = await client.request<{ updateCategory: CategoryData }>(mutation, { category });

    return response.updateCategory;
}

export async function deleteCategory(id: number): Promise<void> {
    const mutation = gql`
        mutation DeleteCategory($id: Int!) {
            deleteCategory(id: $id)
        }
    `;

    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    await client.request(mutation, { id });
}
