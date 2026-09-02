import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { ProductStatus } from '@/shared/types/enums'
import { parseAttributesJson } from './mappers'
import type { AdminProductVariant } from '../types'

export interface AdminProductImage {
  url: string
  altText: string
}

export interface AdminProductDetail {
  id: string
  name: string
  slug: string
  shortDescription: string
  description: string
  status: ProductStatus
  categories: Array<{ id: string; name: string }>
  images: AdminProductImage[]
  imageIds: Record<string, string>
  variants: AdminProductVariant[]
}

interface VariantPriceResponse {
  id: string
  // BigDecimal in the SDL — arrives as a JSON NUMBER, not a string
  price: number | string
  priceType: string
}

interface ProductImageResponse {
  id: string
  imageUrl: string
  featured: boolean
  sortOrder: number | null
  altText: string | null
}

interface VariantResponse {
  id: string
  sku: string
  stockQuantity: number
  status: string
  attributesJson: string | null
  prices: VariantPriceResponse[]
  images: ProductImageResponse[]
}

interface ProductResponse {
  id: string
  name: string
  slug: string
  shortDescription: string
  description: string
  status: string
  categories: Array<{ id: string; name: string }> | null
}

export interface GetProductInformationResponse {
  getProductInformation: {
    product: ProductResponse
    variants: VariantResponse[]
  } | null
}

export const GET_PRODUCT_INFORMATION = gql`
  query GetProductInformation($productId: String) {
    getProductInformation(productId: $productId) {
      product {
        id
        name
        slug
        shortDescription
        description
        status
        categories {
          id
          name
        }
      }
      variants {
        id
        sku
        stockQuantity
        status
        attributesJson
        prices {
          id
          price
          priceType
        }
        images {
          id
          imageUrl
          featured
          sortOrder
          altText
        }
      }
    }
  }
`

/**
 * Maps the GraphQL ProductInformation response to the form-compatible shape.
 * Filters to active variants only, extracts the RETAIL_PRICE, and flattens
 * the image manifest from all variants into a single product-level list.
 */
export function mapToAdminProductDetail(
  data: NonNullable<GetProductInformationResponse['getProductInformation']>,
): AdminProductDetail {
  const { product, variants } = data

  // Only include active variants for the editor
  const activeVariants = variants.filter((v) => v.status !== 'DISABLED')

  const mappedVariants: AdminProductVariant[] = activeVariants.map((v) => {
    const retailPrice = v.prices.find((p) => p.priceType === 'RETAIL_PRICE')
    const wholesalePrice = v.prices.find((p) => p.priceType === 'WHOLESALE_PRICE')
    return {
      id: v.id,
      ...(retailPrice?.id ? { priceId: retailPrice.id } : {}),
      sku: v.sku,
      // The form's price fields are strings; the wire values are BigDecimal
      // numbers — coerce here or zod rejects every server-loaded variant.
      price: retailPrice?.price != null ? String(retailPrice.price) : '0',
      ...(wholesalePrice?.id ? { wholesalePriceId: wholesalePrice.id } : {}),
      ...(wholesalePrice?.price != null ? { wholesalePrice: String(wholesalePrice.price) } : {}),
      stock: v.stockQuantity ?? 0,
      attributes: parseAttributesJson(v.attributesJson),
    }
  })

  // Flatten the image manifest from all variants into one product-level list
  // sorted by sortOrder, then deduplicated by imageUrl
  const allImages = activeVariants
    .flatMap((v) => v.images)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  const seenUrls = new Set<string>()
  const images: AdminProductImage[] = []
  const imageIds: Record<string, string> = {}
  for (const img of allImages) {
    if (img.imageUrl && !seenUrls.has(img.imageUrl)) {
      seenUrls.add(img.imageUrl)
      images.push({ url: img.imageUrl, altText: img.altText ?? '' })
      imageIds[img.imageUrl] = img.id
    }
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? '',
    description: product.description ?? '',
    status: product.status as ProductStatus,
    categories: product.categories ?? [],
    images,
    imageIds,
    variants: mappedVariants,
  }
}

export function useProductDetail(productId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'products', productId],
    queryFn: async () => {
      const response = await adminGraphqlClient.request<GetProductInformationResponse>(
        GET_PRODUCT_INFORMATION,
        { productId },
      )
      return response.getProductInformation
    },
    enabled: !!productId,
  })

  const notFound = !isLoading && data === null
  const product = data ? mapToAdminProductDetail(data) : undefined

  return { data: product, isLoading, error, notFound }
}
