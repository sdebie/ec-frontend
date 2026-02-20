import { GraphQLService } from "./GraphQLService";
import { gql } from "graphql-request";
import { getServiceEndpoint } from "../utils/HostnameResolver";

export type ProductListItem = {
  id: number;
  name: string;
  description?: string | null;
  price?: number | null;
  imageUrl?: string | null;
  variantIds?: number[] | null;
};

export type VariantItem = {
  id: number;
  stockQuantity?: number | null;
  weightKg?: number | null;
  attributesJson?: string | null;
  product?: { name?: string | null } | null;
};

const envGraphQl = (typeof import.meta !== 'undefined' && (import.meta as any).env)
  ? (import.meta as any).env.VITE_GRAPHQL_ENDPOINT
  : undefined;

const graphQlEndpoint = (envGraphQl && envGraphQl.length > 0)
  ? envGraphQl
  : getServiceEndpoint(8080) + '/api/graphql';

export async function fetchProducts(): Promise<ProductListItem[]> {
  const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
  const query = gql`
    query Products {
      products {
        id
        name
        description
        price
        imageUrl
        variantIds
      }
    }
  `;
  const res = await client.request<{ products: ProductListItem[] }>(query);
  return res.products || [];
}

export async function fetchVariantsByIds(ids: number[]): Promise<VariantItem[]> {
  if (!ids || ids.length === 0) return [];
  const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
  const query = gql`
    query VariantsByIds($ids: [BigInteger!]!) {
      variantsByIds(ids: $ids) {
        id
        stockQuantity
        weightKg
        attributesJson
        product { name }
      }
    }
  `;
  const res = await client.request<{ variantsByIds: VariantItem[] }>(query, { ids });
  return res.variantsByIds || [];
}
