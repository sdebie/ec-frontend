import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { graphqlClient } from '@/shared/api/graphql/graphqlClient'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { getDisplayPrice, priceTiersFromEntries } from '@/storefront/catalog/utils/pricing'

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
      // Delegate all tier selection to the canonical getDisplayPrice so the
      // cart shows exactly what ProductCard/PDP show for the same customer type.
      const tiers = priceTiersFromEntries(variant.prices ?? [])
      const displayPrice = getDisplayPrice(tiers, customerType).price

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
