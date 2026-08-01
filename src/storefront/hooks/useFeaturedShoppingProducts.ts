import {useQuery} from '@tanstack/react-query'
import {gql} from 'graphql-request'
import {graphqlClient} from '@/shared/api/graphql/graphqlClient'

// --- Types ---

interface ProductImage {
    id: string
    imageUrl: string
    featured: boolean
    sortOrder: number
}

interface PriceTier {
    price: number | null
}

export interface FeaturedProduct {
    id: string
    name: string
    slug: string
    shortDescription: string
    images: ProductImage[]
    retailPrice: PriceTier | null
    wholesalePrice: PriceTier | null
    retailSalePrice: PriceTier | null
    wholesaleSalePrice: PriceTier | null
    variantId: string | null
    sku?: string | null
    inStock?: boolean | null
}

interface ShoppingFeaturedProductListResponse {
    shoppingFeaturedProductList: FeaturedProduct[]
}

// --- Query ---

const SHOPPING_FEATURED_PRODUCT_LIST = gql`
    query ShoppingFeaturedProductList($limit: Int, $categorySlug: String) {
        shoppingFeaturedProductList(limit: $limit, categorySlug: $categorySlug) {
            id
            name
            slug
            shortDescription
            variantId
            sku
            inStock
            images {
                id
                imageUrl
                featured
                sortOrder
            }
            retailPrice { price }
            wholesalePrice { price }
            retailSalePrice { price }
            wholesaleSalePrice { price }
        }
    }
`

// --- Hook ---

interface UseFeaturedShoppingProductsParams {
    limit?: number
    categorySlug?: string
    enabled?: boolean
}

export function useFeaturedShoppingProducts(params: UseFeaturedShoppingProductsParams = {}) {
    const {limit, categorySlug, enabled = true} = params

    const {data, isLoading, isError, refetch} = useQuery({
        queryKey: ['featured-shopping-products', limit, categorySlug],
        queryFn: () =>
            graphqlClient.request<ShoppingFeaturedProductListResponse>(
                SHOPPING_FEATURED_PRODUCT_LIST,
                {
                    ...(limit != null ? {limit} : {}),
                    ...(categorySlug ? {categorySlug} : {}),
                },
            ),
        enabled,
    })

    return {
        products: data?.shoppingFeaturedProductList ?? [],
        isLoading,
        isError,
        refetch,
    }
}
