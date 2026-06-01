import {useCallback, useEffect, useMemo, useState} from 'react';

import {apiGetProductCount, apiGetShoppingProductsList} from '@/services/graphql/product/product.service.ts';

import type {CatalogProductListItem, CatalogProductsQuery} from '@/features/catalog/types.ts';
import type {Filter, FilterRequest} from '@/types/graphql/query.types.ts';

type UseProductsResult = {
    products: CatalogProductListItem[];
    hasNextPage: boolean;
    totalCount: number;
    loading: boolean;
    error: string | null;
    refetch: () => void;
};

function buildFilterRequest(searchTerm: string, brandId?: string | null): FilterRequest {
    const trimmed = searchTerm.trim();
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
        : [];

    const filters: Filter[] = brandId
        ? [{key: 'brand.id', operator: 'EQUALS' as const, value: brandId}]
        : [];

    return {
        ...(filters.length > 0 ? {filters} : {}),
        ...(filterGroups.length > 0 ? {filterGroups} : {}),
        sort: [{field: 'name', direction: 'ASC'}],
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

/** Standalone page fetch — used by UvhHomeCategoryShowcases and other one-shot callers. */
export async function fetchProductsPage(params: {
    categoryId?: string | null;
    brandId?: string | null;
    search?: string;
    pageIndex?: number;
    pageSize?: number;
}): Promise<CatalogProductListItem[]> {
    const filterRequest = buildFilterRequest(params.search ?? '', params.brandId);
    const data = await apiGetShoppingProductsList(
        params.categoryId ?? null,
        {pageIndex: params.pageIndex ?? 0, pageSize: params.pageSize ?? 25},
        filterRequest,
    );
    return Array.isArray(data) ? data : [];
}

export function useProducts(query: CatalogProductsQuery = {}): UseProductsResult {
    const [products, setProducts] = useState<CatalogProductListItem[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const pageIndex = query.pageIndex ?? 0;
    const pageSize = query.pageSize ?? 25;
    const sortBy = query.sortBy ?? 'name';

    useEffect(() => {
        let isMounted = true;
        const run = async () => {
            try {
                setLoading(true);
                setError(null);

                const filterRequest = buildFilterRequest(query.search ?? '', query.brandId);

                const [pageData, count] = await Promise.all([
                    apiGetShoppingProductsList(
                        query.categoryId ?? null,
                        {pageIndex, pageSize},
                        filterRequest,
                    ).then(data => Array.isArray(data) ? data : []),
                    apiGetProductCount(filterRequest, query.categoryId ?? null, query.brandId ?? null).catch(() => null),
                ]);

                if (!isMounted) return;
                setProducts(pageData);
                setTotalCount(count ?? 0);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load products.');
                setProducts([]);
                setTotalCount(0);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        void run();
        return () => {
            isMounted = false;
        };
    }, [query.categoryId, query.brandId, query.search, pageIndex, pageSize, refreshKey]);

    const sortedProducts = useMemo(() => {
        if (sortBy === 'price-asc' || sortBy === 'price-desc') {
            return sortByPrice(products, sortBy);
        }
        return products;
    }, [products, sortBy]);

    const refetch = useCallback(() => {
        setRefreshKey(k => k + 1);
    }, []);

    return {
        products: sortedProducts,
        hasNextPage: pageIndex * pageSize + products.length < totalCount,
        totalCount,
        loading,
        error,
        refetch,
    };
}
