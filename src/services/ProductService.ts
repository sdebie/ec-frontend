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
  retailPrice?: number | null;            // Price for the selected category
  retailSalesPrice?: number | null;
  wholesalePrice?: number | null;            // Price for the selected category
  wholesaleSalesPrice?: number | null;// Sale price for the selected category
  productImages?: ProductImage[] | null;
  variantIds?: string[] | null;
  categoryName?: string | null;
};

export type VariantPrice = {
  id: string;
  priceType: string;                // RETAIL_PRICE, RETAIL_SALE_PRICE, WHOLESALE_PRICE, WHOLESALE_SALE_PRICE
  price: string | number;           // BigDecimal as string or number
  priceStartDate?: string | null;   // ISO datetime
  priceEndDate?: string | null;     // ISO datetime
  isActive?: boolean | null;        // Currently valid?
};

export type VariantItem = {
  id: string;
  sku?: string | null;
  retailPrice?: number | null;
  retailSalesPrice?: number | null;
  wholesalePrice?: number | null;
  wholesaleSalesPrice?: number | null;
  variantPrices?: VariantPrice[] | null;   // NEW: Multiple prices per variant
  stockQuantity?: number | null;
  weightKg?: string | null;         // BigDecimal
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
  console.log("DEBUG:: Get Product List")
  const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
  const query = gql`
    query getProductsList($categoryName: String) {
      productList(categoryName: $categoryName) {
        id
        name
        description
        retailPrice
        retailSalesPrice
        wholesalePrice
        wholesaleSalesPrice
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
  const res = await client.request<{ productList: ProductListItem[] }>(query, { categoryName });
  return res.productList || [];
}

export async function fetchVariantsByIds(ids: string[]): Promise<VariantItem[]> {
  if (!ids || ids.length === 0) return [];
  const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
  const query = gql`
    query VariantsByIds($ids: [String!]!) {
      variantsByIds(ids: $ids) {
        id
        sku
        retailPrice
        retailSalesPrice
        wholesalePrice
        wholesaleSalesPrice
#        variantPrices {
#          id
#          priceType
#          price
#          priceStartDate
#          priceEndDate
#          isActive
#        }
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
  retailPrice?: number | null;
  retailSalesPrice?: number | null;
  wholesalePrice?: number | null;
  wholesaleSalesPrice?: number | null;
//  variantPrices?: VariantPrice[] | null;
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
          stockQuantity
          attributesJson
          weightKg
          retailPrice
          retailSalesPrice
          wholesalePrice
          wholesaleSalesPrice
#          variantPrices {
#            id
#            priceType
#            price
#            priceStartDate
#            priceEndDate
#            isActive
#          }
        }
      }
    }
  `;
  const res = await client.request<{ getProductWithVariants: ProductWithVariants }>(query, { productId });
  return res.getProductWithVariants || null;
}
