import { GraphQLService } from "./GraphQLService";
import { gql } from "graphql-request";
import { getServiceEndpoint } from "../utils/HostnameResolver";

export type ProductImage = {
  id: string;
  imageUrl: string;
  sortOrder?: number | null;
  isFeatured?: boolean | null;
};

export type ProductListItem = {
  id: string; // UUID as string
  name: string;
  description?: string | null;
  price?: number | null;
  productImages?: ProductImage[] | null;
  variantIds?: string[] | null;
  categoryName?: string | null;
};

export type VariantItem = {
  id: string;
  stockQuantity?: number | null;
  weightKg?: string | null; // changed from number to string to map BigDecimal
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
        productImages {
          id
          imageUrl
          sortOrder
        }
        variantIds
        categoryName
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

export type ProductVariant = {
  id: string;
  sku?: string | null;
  price?: string | null; // BigDecimal mapped to string
  stockQuantity?: number | null;
  attributesJson?: string | null;
  weightKg?: string | null;
};

export type ProductWithVariants = {
  productId: string;
  productName?: string | null;
  productDescription?: string | null;
  productImages?: ProductImage[] | null;
  variants?: ProductVariant[] | null;
};

export async function fetchProductWithVariants(productId: string): Promise<ProductWithVariants | null> {
  if (!productId) return null;
  const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
  const query = gql`
    query GetProductWithVariants($productId: String!) {
      getProductWithVariants(productId: $productId) {
        productId
        productName
        productDescription
        productImages {
          id
          imageUrl
          sortOrder
        }
        variants {
          id
          sku
          price
          stockQuantity
          attributesJson
          weightKg
        }
      }
    }
  `;
  const res = await client.request<{ getProductWithVariants: ProductWithVariants }>(query, { productId });
  return res.getProductWithVariants || null;
}
