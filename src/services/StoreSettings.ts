import getServiceEndpoint from "../utils/HostnameResolver";
import { GraphQLService } from "./GraphQLService";
import { gql } from "graphql-request";

// Allow environment variable override for production deployments (fallback compatible with existing services)
const envGraphQl = (typeof import.meta !== 'undefined' && (import.meta as any).env)
    ? (((import.meta as any).env.VITE_GRAPHQL_ENDPOINT)
        || ((import.meta as any).env.VITE_API_URL)
        || ((import.meta as any).env.REACT_APP_API_URL))
    : (process?.env?.VITE_GRAPHQL_ENDPOINT || process?.env?.VITE_API_URL || process?.env?.REACT_APP_API_URL);

const graphQlEndpoint = (envGraphQl && envGraphQl.length > 0)
    ? envGraphQl
    : getServiceEndpoint(8080) + '/api/graphql';

// Types mirrored from backend entities
export type StoreSetting = {
    key: string;
    value: string;
    description?: string | null;
};

export type ShippingMethod = {
    id?: number | null;
    name?: string | null;
    isActive?: boolean | null;
    baseFee?: number | null;
    estimatedDays?: string | null;
};

export async function fetchAllSettings(): Promise<StoreSetting[]> {
    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const query = gql`
        query AllSettings {
            allSettings {
                key
                value
                description
            }
        }
    `;
    const res = await client.request<{ allSettings: StoreSetting[] }>(query);
    return res.allSettings || [];
}

export async function fetchShippingMethods(): Promise<ShippingMethod[]> {
    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const query = gql`
        query ShippingMethods {
            shippingMethods {
                id
                name
                isActive
                baseFee
                estimatedDays
            }
        }
    `;
    const res = await client.request<{ shippingMethods: ShippingMethod[] }>(query);
    return res.shippingMethods || [];
}

export async function updateSetting(key: string, value: string): Promise<StoreSetting> {
    if (!key) throw new Error("Setting key is required");
    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const mutation = gql`
        mutation UpdateSetting($key: String!, $value: String!) {
            updateSetting(key: $key, value: $value) {
                key
                value
                description
            }
        }
    `;
    const res = await client.request<{ updateSetting: StoreSetting }>(mutation, { key, value });
    return res.updateSetting;
}

export async function saveShippingMethod(method: ShippingMethod): Promise<ShippingMethod> {
    const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
    const mutation = gql`
        mutation SaveShippingMethod($method: ShippingMethodEntityInput!) {
            saveShippingMethod(method: $method) {
                id
                name
                isActive
                baseFee
                estimatedDays
            }
        }
    `;
    const res = await client.request<{ saveShippingMethod: ShippingMethod }>(mutation, { method });
    return res.saveShippingMethod;
}

