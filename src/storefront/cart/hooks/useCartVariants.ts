import {useQuery} from '@tanstack/react-query'
import {gql} from 'graphql-request'
import {graphqlClient} from '@/shared/api/graphql/graphqlClient'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {getDisplayPrice, priceTiersFromEntries} from '@/storefront/catalog/utils/pricing'
import type {ProductImage} from '@/storefront/catalog/utils/productImage'

interface VariantPrice {
    isActive: boolean | null
    id: string
    price: number | null
    priceEndDate: string | null
    priceStartDate: string | null
    priceType: string | null
    saleDaysRemaining: number | null
}

interface VariantByIdResponse {
    id: string
    sku: string | null
    status: string | null
    prices: VariantPrice[]
    stockQuantity: number | null
    images: Array<{
        imageUrl: string
        featured: boolean
        sortOrder: number
    }>
}

interface VariantsByIdsResponse {
    variantsByIds: VariantByIdResponse[]
}

export interface CartVariant {
    id: string
    sku: string | null
    /** Variant lifecycle status; anything other than ACTIVE cannot be ordered. */
    status: string | null
    stockQuantity: number | null
    /** Backend-selected display price for this shopper's tier, ex VAT. */
    displayPrice: number | null
    /** Raw catalogue images — resolved to a URL by the cart's mapper. */
    images: ProductImage[]
}

// `product` is deliberately NOT selected: ProductMapper maps variantsByIds with
// `@Mapping(target = "product", ignore = true)`, so it always resolves to null.
// The product name comes from the persisted cart line instead.
const VARIANTS_BY_IDS = gql`
    query VariantsByIds($ids: [String!]!) {
        variantsByIds(ids: $ids) {
            id
            sku
            status
            prices {
                isActive
                id
                price
                priceEndDate
                priceStartDate
                priceType
                saleDaysRemaining
            }
            stockQuantity
            images {
                imageUrl
                featured
                sortOrder
            }
        }
    }
`

export function useCartVariants(variantIds: string[]) {
    const customerType = useCustomerAuthStore((s) => s.customerType)

    const {data, isLoading, isError} = useQuery({
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
                sku: variant.sku ?? null,
                status: variant.status ?? null,
                stockQuantity: variant.stockQuantity,
                displayPrice,
                images: variant.images ?? [],
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
