import { GraphQLService } from "./graphql/GraphQLService.ts";
import { gql } from "graphql-request";
import { getServiceEndpoint } from "../utils/HostnameResolver";
import {ProductImportValidationStatus} from "@/constants/enums/ProductImportValidationStatus.ts";

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

export type ProductUploadStaged = {
  stagedId: string;
  sku: string;
  categorySlug?: string | null;
  brandSlug?: string | null;
  proposedStock?: number | null;
  currentStock?: number | null;
  proposedImages?: string | null;
  currentImages?: string | null;
  proposedAttributes?: string | null;
  currentAttributes?: string | null;
  validationErrors?: string | null;
  validationStatus?: ProductImportValidationStatus | null;
  imageErrors?: string | null;
  currentName: string;
  proposedName: string;
  currentDescription: string;
  proposedDescription: string;
  currentShortDescription: string;
  proposedShortDescription: string;
  currentRetailPrice?: number | null;
  proposedRetailPrice?: number | null;
  currentWholesalePrice?: number | null;
  proposedWholesalePrice?: number | null;
  currentRetailSalePrice?: number | null;
  proposedRetailSalePrice?: number | null;
  currentWholesaleSalePrice?: number | null;
  proposedWholesaleSalePrice?: number | null;
  isValidCategory?: boolean | null;
  isValidBrand?: boolean | null;
  isNewProduct?: boolean | null;
  isNewVariant?: boolean | null;
  hasChanges?: boolean | null;
}

export type ProductUploadBatch = {
  id: string;
  filename: string;
  status: string;
  totalRows: number;
  createdAt: string;
  uploadedByUsername: string | null;
  stagedRows?: number | null;
  processedRows?: number | null;
  skippedRows?: number | null;
  validationErrorCount?: number | null;
  completed?: boolean | null;
}

export type ProductUploadBatchProcessStatus = {
  batchId: string;
  status: string;
  totalRows: number;
  stagedRows: number;
  processedRows: number;
  skippedRows: number;
  validationErrorCount?: number | null;
  completed: boolean;
}

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
        }
      }
    }
  `;
  const res = await client.request<{ getProductWithVariants: ProductWithVariants }>(query, { productId });
  return res.getProductWithVariants || null;
}

export async function getProductImportRows(batchId: string): Promise<ProductUploadStaged[]> {
  const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
  const query = gql`
    query GetImportRows($batchId: String!) {
      importRows(batchId: $batchId) {
        stagedId
        sku
        categorySlug
        brandSlug
        proposedStock
        currentStock
        proposedImages
        currentImages
        proposedAttributes
        currentAttributes
        validationErrors
        validationStatus
        imageErrors
        currentName
        proposedName
        currentDescription
        proposedDescription
        currentShortDescription
        proposedShortDescription
        currentRetailPrice
        proposedRetailPrice
        currentRetailSalePrice
        proposedRetailSalePrice
        currentWholesalePrice
        proposedWholesalePrice
        currentWholesaleSalePrice
        proposedWholesaleSalePrice
        isValidCategory
        isValidBrand
        isNewProduct
        isNewVariant
        hasChanges
      }
    }
  `;
  const res = await client.request<{ importRows: ProductUploadStaged[] }>(query, { batchId });
  return res.importRows || [];
}

export async function getProductUploadBatches(): Promise<ProductUploadBatch[]> {
  const client = await GraphQLService.getGraphQLClient(graphQlEndpoint);
  const query = gql`
    query GetProductUploadBatches {
      productUploadBatches {
        id
        filename
        status
        totalRows
        processedRows
        skippedRows
        validationErrorCount
        createdAt
        uploadedByUsername
      }
    }
  `;
  const res = await client.request<{ productUploadBatches: ProductUploadBatch[] }>(query);
  return res.productUploadBatches || [];
}

