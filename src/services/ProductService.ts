import { GraphQLService } from "./GraphQLService";
import { gql } from "graphql-request";
import { getServiceEndpoint } from "../utils/HostnameResolver";

export type ProductListItem = {
  id: string; // UUID as string
  name: string;
  description?: string | null;
  price?: number | null;
  imageUrl?: string | null;
  variantIds?: string[] | null;
  categoryName?: string | null; // Added categoryName
};

export type VariantItem = {
  id: string;
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

export async function fetchProducts(categoryName?: string | null): Promise<ProductListItem[]> {
  const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
  const query = gql`
    query Products($categoryName: String) {
      products(categoryName: $categoryName) {
        id
        name
        description
        price
        imageUrl
        variantIds
        categoryName # Fetch category name
      }
    }
  `;
  const res = await client.request<{ products: ProductListItem[] }>(query, { categoryName: categoryName === 'All' ? null : categoryName });
  return res.products || [];
}

export async function fetchVariantsByIds(ids: string[]): Promise<VariantItem[]> {
  if (!ids || ids.length === 0) return [];
  const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
  const query = gql`
    query VariantsByIds($ids: [String!]!) {
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



export type ProductVariantWithProduct = {
  id: string;
  sku?: string | null;
  price?: number | null;
  stockQuantity?: number | null;
  attributesJson?: string | null;
  product?: {
    id?: string | null; // product id is UUID string now
    name?: string | null;
    description?: string | null;
    productType?: string | null;
  } | null;
};

export async function fetchProductWithVariants(productId: string): Promise<ProductVariantWithProduct[]> {
  if (!productId) return [];
  const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
  const query = gql`
    query GetProductWithVariants($productId: String!) {
      getProductWithVariants(productId: $productId) {
        id
        sku
        price
        stockQuantity
        attributesJson
        product { id name description productType }
      }
    }
  `;
  const res = await client.request<{ getProductWithVariants: ProductVariantWithProduct[] }>(query, { productId });
  return res.getProductWithVariants || [];
}
