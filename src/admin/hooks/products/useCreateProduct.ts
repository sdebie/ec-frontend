import { useMutation } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { toast } from '@/shared/ui/components/toast'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import type { ProductStatus } from '@/shared/types/enums'

export interface VariantPayload {
  id?: string
  priceId?: string
  sku: string
  price: string
  wholesalePriceId?: string
  wholesalePrice?: string
  stock: number
}

export interface ProductImagePayload {
  /** Stored storage-relative path — the image's identity in the form. */
  url: string
  altText?: string
}

export interface ProductPayload {
  name: string
  slug: string
  shortDescription: string
  description: string
  status: ProductStatus
  categoryIds: string[]
  images: ProductImagePayload[]
  imageIds?: Record<string, string>
  variants: VariantPayload[]
}

// --- GraphQL input types (hand-written per project convention) ---

interface ProductImageDtoInput {
  id?: string
  imageUrl: string
  featured: boolean
  sortOrder: number
  altText: string | null
}

interface VariantPriceDtoInput {
  id?: string
  priceType: string
  price: string
}

interface ProductVariantDtoInput {
  id?: string
  sku: string
  stockQuantity: number
  prices: VariantPriceDtoInput[]
  images?: ProductImageDtoInput[]
  status?: string
}

interface ProductDtoInput {
  id?: string
  name: string
  slug: string
  shortDescription: string
  description: string
  status: string
  categories: Array<{ id: string }>
}

interface ProductInformationDtoInput {
  product: ProductDtoInput
  variants: ProductVariantDtoInput[]
}

// --- Response types ---

interface ProductInformationResponse {
  addProductInformation: {
    product: { id: string; name: string; slug: string; status: string }
    variants: Array<{
      id: string
      sku: string
      stockQuantity: number
      prices: Array<{ id: string; priceType: string; price: string }>
      images: Array<{ id: string; imageUrl: string; featured: boolean; sortOrder: number }>
    }>
  }
}

// --- Mutation document ---

const ADD_PRODUCT_INFORMATION = gql`
  mutation AddProductInformation($input: ProductInformationDtoInput) {
    addProductInformation(input: $input) {
      product { id name slug status }
      variants { id sku stockQuantity prices { id priceType price } images { id imageUrl featured sortOrder } }
    }
  }
`

/**
 * Maps the form's flat ProductPayload to the GraphQL ProductInformationDtoInput shape.
 * - Each variant's `price` → exactly one RETAIL_PRICE entry
 * - Each variant's `stock` → `stockQuantity`
 * - Product images are carried on payload variant index 0 with featured/sortOrder
 * - The server determines the actual DB image-owner variant; we do NOT infer it client-side
 */
function toProductInformationInput(payload: ProductPayload): ProductInformationDtoInput {
  const variants: ProductVariantDtoInput[] = payload.variants.map((v, index) => {
    const variant: ProductVariantDtoInput = {
      ...(v.id ? { id: v.id } : {}),
      sku: v.sku,
      stockQuantity: v.stock,
      prices: [
        {
          ...(v.priceId ? { id: v.priceId } : {}),
          priceType: 'RETAIL_PRICE',
          price: v.price,
        },
        // A blank wholesale field sends nothing: the backend upserts only what
        // it receives and never deletes omitted price rows (sale prices ride
        // on that guarantee), so blank means "leave any existing row as-is".
        ...(v.wholesalePrice?.trim()
          ? [{
              ...(v.wholesalePriceId ? { id: v.wholesalePriceId } : {}),
              priceType: 'WHOLESALE_PRICE',
              price: v.wholesalePrice,
            }]
          : []),
      ],
    }

    // Carry the product image manifest on variant index 0
    if (index === 0 && payload.images.length > 0) {
      variant.images = payload.images.map((image, imgIndex) => ({
        ...(payload.imageIds?.[image.url] ? { id: payload.imageIds[image.url] } : {}),
        imageUrl: image.url,
        featured: imgIndex === 0,
        sortOrder: imgIndex,
        // Blank alt text is stored as NULL, matching images that never had one
        altText: image.altText?.trim() ? image.altText.trim() : null,
      }))
    }

    return variant
  })

  return {
    product: {
      name: payload.name,
      slug: payload.slug,
      shortDescription: payload.shortDescription,
      description: payload.description,
      status: payload.status,
      categories: payload.categoryIds.map((id) => ({ id })),
    },
    variants,
  }
}

export function useCreateProduct() {
  const { mutate, mutateAsync, isPending } = useMutation<ProductInformationResponse, Error, ProductPayload>({
    mutationFn: (payload: ProductPayload) => {
      const input = toProductInformationInput(payload)
      return adminGraphqlClient.request<ProductInformationResponse>(ADD_PRODUCT_INFORMATION, { input })
    },
    onError: (error) => {
      console.error('[ProductWrite] action failed:', error)
      toast.error('Failed to create product', { duration: 0 })
    },
  })

  return { mutate, mutateAsync, isLoading: isPending }
}
