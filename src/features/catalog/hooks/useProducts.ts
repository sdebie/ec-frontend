import { useCallback, useEffect, useMemo, useState } from 'react';

import { apiGetShoppingProductsList } from '@/services/graphql/product/product.service.ts';

import type { CatalogProductListItem, CatalogProductsQuery } from '@/features/catalog/types.ts';
import type { FilterRequest } from '@/types/graphql/query.types.ts';


type UseProductsResult = {
    products: CatalogProductListItem[];
    hasNextPage: boolean;
    loading: boolean;
    error: string | null;
    refetch: () => void;
};

const DEFAULT_PAGE_SIZE = 15;

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
    const [pageProducts, setPageProducts] = useState<CatalogProductListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const pageIndex = query.pageIndex ?? 0;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const sortBy = query.sortBy ?? 'name';

    useEffect(() => {
        let isMounted = true;
        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchProductsPage({
                    categoryId: query.categoryId,
                    search: query.search,
                    pageIndex,
                    pageSize,
                });
                if (!isMounted) return;
                setPageProducts(data);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load products.');
                setPageProducts([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        void run();
        return () => {
            isMounted = false;
        };
    }, [query.categoryId, query.search, sortBy, pageIndex, pageSize, refreshKey]);

    const products = useMemo(() => {
        if (sortBy === 'price-asc' || sortBy === 'price-desc') {
            return sortByPrice(pageProducts, sortBy);
        }
        return pageProducts;
    }, [pageProducts, sortBy]);

    const refetch = useCallback(() => {
        setRefreshKey((current) => current + 1);
    }, []);

    return {
        products,
        hasNextPage: pageProducts.length === pageSize,
        loading,
        error,
        refetch,
    };
}
