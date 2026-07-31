import {useQuery} from '@tanstack/react-query'
import {gql} from 'graphql-request'
import {graphqlClient} from '@/shared/api/graphql/graphqlClient'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {priceBasisFor} from '../utils/pricing'

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

interface FilterRequest {
    filters?: FilterItem[]
    filterGroups?: FilterGroup[]
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
        $categoryId: String
        $pageIndex: Int
        $pageSize: Int
        $onSale: Boolean
        $sortBy: CatalogueSortEn
        $priceBasis: PriceBasisEn
    ) {
        shoppingProductList(
            filterRequest: $filterRequest
            categoryId: $categoryId
            pageIndex: $pageIndex
            pageSize: $pageSize
            onSale: $onSale
            sortBy: $sortBy
            priceBasis: $priceBasis
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

/** Stable-identity empty array so consumers don't re-render on referential inequality. */
const EMPTY_PRODUCTS: Product[] = []

// --- SortOption → GraphQL enum mapping ---

function toGraphQLSort(sort: SortOption): 'NAME_ASC' | 'PRICE_ASC' | 'PRICE_DESC' {
    switch (sort) {
        case 'price-asc':
            return 'PRICE_ASC'
        case 'price-desc':
            return 'PRICE_DESC'
        default:
            return 'NAME_ASC'
    }
}

// --- FilterRequest builder ---

function buildFilterRequest(params: UseProductsParams): FilterRequest {
    const {search, brandId} = params

    const filterRequest: FilterRequest = {}

    // Build top-level EQUALS filters for brand
    const filters: FilterItem[] = []
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

    return filterRequest
}

// --- Hook ---

export function useProducts(params: UseProductsParams = {}) {
    const {sort = 'name', page = 1, enabled = true, onSale} = params
    const customerType = useCustomerAuthStore((state) => state.customerType)

    const priceBasis = priceBasisFor(customerType)
    const sortBy = toGraphQLSort(sort)
    const filterRequest = buildFilterRequest(params)
    const pageIndex = page - 1

    const {data, isLoading, isError, refetch} = useQuery({
        queryKey: [
            'catalog-products',
            params.search,
            params.categoryId,
            params.brandId,
            sortBy,
            priceBasis,
            page,
            onSale,
        ],
        queryFn: () =>
            graphqlClient.request<ShoppingProductListResponse>(SHOPPING_PRODUCT_LIST, {
                filterRequest,
                categoryId: params.categoryId || null,
                pageIndex,
                pageSize: PAGE_SIZE,
                onSale,
                sortBy,
                priceBasis,
            }),
        enabled,
    })

    const products = data?.shoppingProductList.content ?? EMPTY_PRODUCTS

    return {
        products,
        totalElements: data?.shoppingProductList.totalElements ?? 0,
        totalPages: data?.shoppingProductList.totalPages ?? 0,
        isLoading,
        isError,
        refetch,
    }
}
