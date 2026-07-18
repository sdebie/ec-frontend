import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { ProductStatus } from '@/shared/types/enums'

export interface AdminProductVariant {
  id: string
  priceId?: string
  sku: string
  price: string
  stock: number
}

export interface AdminProductDetail {
  id: string
  name: string
  slug: string
  shortDescription: string
  description: string
  status: ProductStatus
  category: { id: string; name: string }
  images: string[]
  imageIds: Record<string, string>
  variants: AdminProductVariant[]
}

interface VariantPriceResponse {
  id: string
  price: string
  priceType: string
}

interface ProductImageResponse {
  id: string
  imageUrl: string
  featured: boolean
  sortOrder: number | null
}

interface VariantResponse {
  id: string
  sku: string
  stockQuantity: number
  status: string
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
  category: { id: string; name: string } | null
}

interface GetProductInformationResponse {
  getProductInformation: {
    product: ProductResponse
    variants: VariantResponse[]
  } | null
}

const GET_PRODUCT_INFORMATION = gql`
  query GetProductInformation($productId: String) {
    getProductInformation(productId: $productId) {
      product {
        id
        name
        slug
        shortDescription
        description
        status
        category {
          id
          name
        }
      }
      variants {
        id
        sku
        stockQuantity
        status
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
function mapToAdminProductDetail(
  data: NonNullable<GetProductInformationResponse['getProductInformation']>,
): AdminProductDetail {
  const { product, variants } = data

  // Only include active variants for the editor
  const activeVariants = variants.filter((v) => v.status !== 'DISABLED')

  const mappedVariants: AdminProductVariant[] = activeVariants.map((v) => {
    const retailPrice = v.prices.find((p) => p.priceType === 'RETAIL_PRICE')
    return {
      id: v.id,
      ...(retailPrice?.id ? { priceId: retailPrice.id } : {}),
      sku: v.sku,
      price: retailPrice?.price ?? '0',
      stock: v.stockQuantity ?? 0,
    }
  })

  // Flatten the image manifest from all variants into one product-level list
  // sorted by sortOrder, then deduplicated by imageUrl
  const allImages = activeVariants
    .flatMap((v) => v.images)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  const seenUrls = new Set<string>()
  const images: string[] = []
  const imageIds: Record<string, string> = {}
  for (const img of allImages) {
    if (img.imageUrl && !seenUrls.has(img.imageUrl)) {
      seenUrls.add(img.imageUrl)
      images.push(img.imageUrl)
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
    category: product.category ?? { id: '', name: '' },
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
