import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { graphqlClient } from '@/shared/api/graphql/graphqlClient'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'

interface VariantPrice {
  active: boolean | null
  id: string
  price: number | null
  priceEndDate: string | null
  priceStartDate: string | null
  priceType: string | null
  saleDaysRemaining: number | null
}

interface VariantByIdResponse {
  id: string
  sku: string
  status: string
  prices: VariantPrice[]
  stockQuantity: number | null
  weightKg: number | null
  attributesJson: string | null
  images: Array<{
    id: string
    imageUrl: string
    sortOrder: number
    isFeatured: boolean
  }>
  product: { name: string }
}

interface VariantsByIdsResponse {
  variantsByIds: VariantByIdResponse[]
}

export interface CartVariant {
  id: string
  stockQuantity: number | null
  status: string
  displayPrice: number | null
  product: { name: string }
}

const VARIANTS_BY_IDS = gql`
  query VariantsByIds($ids: [String!]!) {
    variantsByIds(ids: $ids) {
      id
      sku
      status
      prices {
        active
        id
        price
        priceEndDate
        priceStartDate
        priceType
        saleDaysRemaining
      }
      stockQuantity
      product {
        name
      }
    }
  }
`

export function useCartVariants(variantIds: string[]) {
  const customerType = useCustomerAuthStore((s) => s.customerType)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['cart-variants', variantIds],
    queryFn: () =>
      graphqlClient.request<VariantsByIdsResponse>(VARIANTS_BY_IDS, {
        ids: variantIds,
      }),
    enabled: variantIds.length > 0,
  })

  const variants = new Map<string, CartVariant>()

  if (data?.variantsByIds) {
    for (const variant of data.variantsByIds) {
      const prices = variant.prices ?? []

      // Price selection: prefer sale price if active, fall back to regular price for the tier
      const salePriceType =
        customerType === 'WHOLESALE' ? 'WHOLESALE_SALE_PRICE' : 'RETAIL_SALE_PRICE'
      const regularPriceType =
        customerType === 'WHOLESALE' ? 'WHOLESALE_PRICE' : 'RETAIL_PRICE'

      const activeSaleEntry = prices.find(
        (p) => p.priceType === salePriceType && p.active === true
      )
      const regularEntry = prices.find(
        (p) => p.priceType === regularPriceType && p.active === true
      )
      const regularFallback = prices.find(
        (p) => p.priceType === regularPriceType
      )

      const displayPrice =
        activeSaleEntry?.price ?? regularEntry?.price ?? regularFallback?.price ?? null

      variants.set(variant.id, {
        id: variant.id,
        stockQuantity: variant.stockQuantity,
        status: variant.status,
        displayPrice,
        product: variant.product,
      })
    }
  }

  const unavailableIds = variantIds.filter((id) => !variants.has(id))

  return {
    variants,
    unavailableIds,
    isLoading,
    isError,
  }
}
