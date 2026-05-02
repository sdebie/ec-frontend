import {useCallback, useEffect, useMemo, useState} from 'react'
import {fetchStorefrontCatalogueProducts} from '@/services/storefront/catalogue/catalogue.service.ts'
import type {ProductShoppingListItem} from '@/types/admin/ProductTypes.ts'
import type {FilterRequest} from '@/types/graphql/query.types.ts'

export type ShoppingProductsResponse = ProductShoppingListItem[]

export type UseShoppingProductsResult = {
    products: ProductShoppingListItem[]
    /** True when the last fetch returned a full page (there may be another page). */
    hasNextPage: boolean
    loading: boolean
    error: string | null
    refetch: () => void
}

export type ShoppingProductsQuery = {
    categoryId?: string | null
    search?: string
    sortBy?: 'name' | 'price-asc' | 'price-desc'
    pageIndex?: number
    pageSize?: number
}

const DEFAULT_PAGE_SIZE = 15

function buildShoppingCatalogueFilterRequest(searchTerm: string): FilterRequest {
    const trimmed = searchTerm.trim()
    const filterGroups = trimmed
        ? [
              {
                  operator: 'OR' as const,
                  filters: [
                      {key: 'name', operator: 'ILIKE' as const, value: trimmed},
                      {key: 'description', operator: 'ILIKE' as const, value: trimmed},
                      {key: 'shorDescription', operator: 'ILIKE' as const, value: trimmed},
                      {key: 'category.name', operator: 'ILIKE' as const, value: trimmed},
                  ],
              },
          ]
        : []

    return {
        ...(filterGroups.length > 0 ? {filterGroups} : {}),
        sort: [{field: 'name', direction: 'ASC'}],
    }
}

function sortPageByPrice(
    items: ProductShoppingListItem[],
    sortBy: 'price-asc' | 'price-desc',
): ProductShoppingListItem[] {
    return [...items].sort((a, b) => {
        const pa = a.retailPrice?.price ?? 0
        const pb = b.retailPrice?.price ?? 0
        return sortBy === 'price-asc' ? pa - pb : pb - pa
    })
}

export const useShoppingProducts = (
    query: ShoppingProductsQuery = {},
): UseShoppingProductsResult => {
    const [pageProducts, setPageProducts] = useState<ProductShoppingListItem[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    const pageIndex = query.pageIndex ?? 0
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE
    const sortBy = query.sortBy ?? 'name'

    useEffect(() => {
        let isMounted = true

        const run = async () => {
            try {
                setLoading(true)
                setError(null)
                const filterRequest = buildShoppingCatalogueFilterRequest(query.search ?? '')
                const data = await fetchStorefrontCatalogueProducts(
                    query.categoryId ?? null,
                    {
                        pageIndex,
                        pageSize,
                    },
                    filterRequest,
                )
                if (isMounted) {
                    setPageProducts(Array.isArray(data) ? data : [])
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load products.')
                    setPageProducts([])
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        void run()

        return () => {
            isMounted = false
        }
    }, [query.categoryId, query.search, sortBy, pageIndex, pageSize, refreshKey])

    const products = useMemo(() => {
        if (sortBy === 'price-asc' || sortBy === 'price-desc') {
            return sortPageByPrice(pageProducts, sortBy)
        }
        return pageProducts
    }, [pageProducts, sortBy])

    const hasNextPage = pageProducts.length === pageSize

    const refetch = useCallback(() => {
        setRefreshKey((key) => key + 1)
    }, [])

    return {
        products,
        hasNextPage,
        loading,
        error,
        refetch,
    }
}
