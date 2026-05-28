import { useCallback, useEffect, useMemo, useState } from 'react';

import { apiGetShoppingProductsList } from '@/services/graphql/product/product.service.ts';

import type { CatalogProductListItem, CatalogProductsQuery } from '@/features/catalog/types.ts';
import type { FilterRequest } from '@/types/graphql/query.types.ts';


type UseProductsResult = {
    products: CatalogProductListItem[];
    hasNextPage: boolean;
    totalCount: number;
    loading: boolean;
    error: string | null;
    refetch: () => void;
};

const DEFAULT_PAGE_SIZE = 25;
/**
 * Fetch ceiling for category / all-products mode. We load every matching
 * product in one shot and paginate client-side so we always know the total
 * page count (the backend has no count endpoint scoped to category).
 */
const CLIENT_PAGINATION_FETCH_SIZE = 10;

function buildFilterRequest(searchTerm: string): FilterRequest {
    const trimmed = searchTerm.trim();
    const filterGroups = trimmed
        ? [
              {
                  operator: 'OR' as const,
                  filters: [
                      { key: 'name', operator: 'ILIKE' as const, value: trimmed },
                      { key: 'description', operator: 'ILIKE' as const, value: trimmed },
                      { key: 'shorDescription', operator: 'ILIKE' as const, value: trimmed },
                      { key: 'category.name', operator: 'ILIKE' as const, value: trimmed },
                  ],
              },
          ]
        : [];

    return {
        ...(filterGroups.length > 0 ? { filterGroups } : {}),
        sort: [{ field: 'name', direction: 'ASC' }],
    };
}

function sortByPrice(
    items: CatalogProductListItem[],
    sortBy: 'price-asc' | 'price-desc',
): CatalogProductListItem[] {
    return [...items].sort((a, b) => {
        const left = a.retailPrice?.price ?? 0;
        const right = b.retailPrice?.price ?? 0;
        return sortBy === 'price-asc' ? left - right : right - left;
    });
}

export async function fetchProductsPage(params: {
    categoryId?: string | null;
    search?: string;
    pageIndex?: number;
    pageSize?: number;
}): Promise<CatalogProductListItem[]> {
    const pageIndex = params.pageIndex ?? 0;
    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const filterRequest = buildFilterRequest(params.search ?? '');
    const data = await apiGetShoppingProductsList(
        params.categoryId ?? null,
        { pageIndex, pageSize },
        filterRequest,
    );
    return Array.isArray(data) ? data : [];
}

export function useProducts(query: CatalogProductsQuery = {}): UseProductsResult {
    const [allProducts, setAllProducts] = useState<CatalogProductListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const pageIndex = query.pageIndex ?? 0;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const sortBy = query.sortBy ?? 'name';
    const mode = query.mode ?? 'full';

    useEffect(() => {
        let isMounted = true;
        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                // Fetch the full matching set once (search + category) so we can
                // paginate client-side and expose an accurate totalCount.
                const data = await fetchProductsPage({
                    categoryId: query.categoryId,
                    search: query.search,
                    pageIndex: mode === 'full' ? 0 : pageIndex,
                    pageSize: mode === 'full' ? CLIENT_PAGINATION_FETCH_SIZE : pageSize,
                });
                if (!isMounted) return;
                setAllProducts(data);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load products.');
                setAllProducts([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        void run();
        return () => {
            isMounted = false;
        };
    }, [query.categoryId, query.search, pageIndex, pageSize, mode, refreshKey]);

    const sortedAll = useMemo(() => {
        if (sortBy === 'price-asc' || sortBy === 'price-desc') {
            return sortByPrice(allProducts, sortBy);
        }
        return allProducts;
    }, [allProducts, sortBy]);

    const products = useMemo(() => {
        if (mode === 'page') {
            return sortedAll;
        }
        const start = pageIndex * pageSize;
        return sortedAll.slice(start, start + pageSize);
    }, [sortedAll, pageIndex, pageSize, mode]);

    const refetch = useCallback(() => {
        setRefreshKey((current) => current + 1);
    }, []);

    const totalCount = sortedAll.length;
    const hasNextPage = totalCount > (pageIndex + 1) * pageSize;

    return {
        products,
        hasNextPage,
        totalCount,
        loading,
        error,
        refetch,
    };
}
