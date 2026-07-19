import {useQuery} from '@tanstack/react-query'
import {gql} from 'graphql-request'
import {useMemo} from 'react'
import {graphqlClient} from '@/shared/api/graphql/graphqlClient'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {getDisplayPrice} from '../utils/pricing'

// --- Types ---

interface FilterItem {
    key: string
    value: string
    operator: 'EQUALS' | 'ILIKE'
}

interface FilterGroup {
    filters: FilterItem[]
    operator: 'OR' | 'AND'
}

interface SortItem {
    field: string
    direction: 'ASC' | 'DESC'
}

interface FilterRequest {
    filters?: FilterItem[]
    filterGroups?: FilterGroup[]
    sort?: SortItem[]
}

interface ProductImage {
    id: string
    imageUrl: string
    featured: boolean
    sortOrder: number
}

interface PriceTier {
    price: number | null
}

export interface Product {
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
        content: Product[]
        totalElements: number
        totalPages: number
        pageSize: number
        pageIndex: number
    }
}

export type SortOption = 'name' | 'price-asc' | 'price-desc'

interface UseProductsParams {
    search?: string
    categoryId?: string | null
    brandId?: string | null
    sort?: SortOption
    page?: number
    onSale?: boolean
    enabled?: boolean
}

// --- Query ---

const SHOPPING_PRODUCT_LIST = gql`
    query ShoppingProductList(
        $filterRequest: FilterRequestInput
        $pageIndex: Int
        $pageSize: Int
        $onSale: Boolean
    ) {
        shoppingProductList(
            filterRequest: $filterRequest
            pageIndex: $pageIndex
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
            totalElements
            totalPages
            pageSize
            pageIndex
        }
    }
`

const PAGE_SIZE = 20

// --- FilterRequest builder ---

function buildFilterRequest(params: UseProductsParams): FilterRequest {
    const {search, categoryId, brandId, sort} = params

    const filterRequest: FilterRequest = {}

    // Build top-level EQUALS filters for category and brand
    const filters: FilterItem[] = []
    if (categoryId) {
        filters.push({key: 'category.id', value: categoryId, operator: 'EQUALS'})
    }
    if (brandId) {
        filters.push({key: 'brand.id', value: brandId, operator: 'EQUALS'})
    }
    if (filters.length > 0) {
        filterRequest.filters = filters
    }

    // Build OR filter group for search
    if (search && search.trim()) {
        const searchValue = `%${search.trim()}%`
        filterRequest.filterGroups = [
            {
                filters: [
                    {key: 'name', value: searchValue, operator: 'ILIKE'},
                ],
                operator: 'OR',
            },
        ]
    }

    // Server-side sort for 'name' only; price sorts are client-side
    if (!sort || sort === 'name') {
        filterRequest.sort = [{field: 'name', direction: 'ASC'}]
    }

    return filterRequest
}

// --- Hook ---

export function useProducts(params: UseProductsParams = {}) {
    const {sort = 'name', page = 1, enabled = true, onSale} = params
    const customerType = useCustomerAuthStore((state) => state.customerType)

    const filterRequest = buildFilterRequest(params)
    const pageIndex = page - 1

    const {data, isLoading, isError, refetch} = useQuery({
        queryKey: [
            'catalog-products',
            params.search,
            params.categoryId,
            params.brandId,
            sort,
            page,
            onSale,
        ],
        queryFn: () =>
            graphqlClient.request<ShoppingProductListResponse>(SHOPPING_PRODUCT_LIST, {
                filterRequest,
                pageIndex,
                pageSize: PAGE_SIZE,
                onSale,
            }),
        enabled,
    })

    // Apply client-side price sort when needed
    const products = useMemo(() => {
        const content = data?.shoppingProductList.content ?? []

        if (sort === 'price-asc' || sort === 'price-desc') {
            const sorted = [...content].sort((a, b) => {
                const priceA = getDisplayPrice(
                    {
                        retailPrice: a.retailPrice?.price ?? null,
                        wholesalePrice: a.wholesalePrice?.price ?? null,
                        retailSalePrice: a.retailSalePrice?.price ?? null,
                        wholesaleSalePrice: a.wholesaleSalePrice?.price ?? null,
                    },
                    customerType,
                ).price
                const priceB = getDisplayPrice(
                    {
                        retailPrice: b.retailPrice?.price ?? null,
                        wholesalePrice: b.wholesalePrice?.price ?? null,
                        retailSalePrice: b.retailSalePrice?.price ?? null,
                        wholesaleSalePrice: b.wholesaleSalePrice?.price ?? null,
                    },
                    customerType,
                ).price

                // Null prices sort to the end
                if (priceA == null && priceB == null) return 0
                if (priceA == null) return 1
                if (priceB == null) return -1

                return sort === 'price-asc' ? priceA - priceB : priceB - priceA
            })
            return sorted
        }

        return content
    }, [data, sort, customerType])

    return {
        products,
        totalElements: data?.shoppingProductList.totalElements ?? 0,
        totalPages: data?.shoppingProductList.totalPages ?? 0,
        isLoading,
        isError,
        refetch,
    }
}
