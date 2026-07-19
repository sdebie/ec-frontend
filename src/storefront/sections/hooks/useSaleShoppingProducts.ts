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

export interface SaleProduct {
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
}

interface ShoppingProductListResponse {
    shoppingProductList: {
        content: SaleProduct[]
    }
}

// --- Query ---

const SHOPPING_PRODUCT_LIST_ON_SALE = gql`
    query ShoppingProductListOnSale(
        $pageSize: Int
        $onSale: Boolean
    ) {
        shoppingProductList(
            pageSize: $pageSize
            onSale: $onSale
        ) {
            content {
                id
                name
                slug
                shortDescription
                variantId
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
    }
`

// --- Hook ---

interface UseSaleShoppingProductsParams {
    limit?: number
    enabled?: boolean
}

export function useSaleShoppingProducts(params: UseSaleShoppingProductsParams = {}) {
    const {limit = 8, enabled = true} = params

    const {data, isLoading, isError} = useQuery({
        queryKey: ['sale-shopping-products', limit],
        queryFn: () =>
            graphqlClient.request<ShoppingProductListResponse>(
                SHOPPING_PRODUCT_LIST_ON_SALE,
                {
                    pageSize: limit,
                    onSale: true,
                },
            ),
        enabled,
    })

    return {
        products: data?.shoppingProductList.content ?? [],
        isLoading,
        isError,
    }
}
