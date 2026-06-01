import { useCallback, useEffect, useMemo, useState } from 'react';

import { apiGetAllCategories, apiGetCategoryCount } from '@/services/graphql/category/category.service.ts';

import type { CatalogCategory } from '@/features/catalog/types.ts';
import type { FilterRequest } from '@/types/graphql/query.types.ts';


type UseCategoriesResult = {
    categories: CatalogCategory[];
    isLoading: boolean;
    error: string | null;
    totalRows: number;
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    onPageChange: (newPageIndex: number) => void;
    onPageSizeChange: (newPageSize: number) => void;
    refetch: () => void;
};

export function useCategories(initialPageSize = 6000): UseCategoriesResult {
    const [categories, setCategories] = useState<CatalogCategory[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const filterRequest = useMemo<FilterRequest>(
        () => ({
            filters: [],
            filterGroups: [],
            sort: [{ field: 'name', direction: 'ASC' }],
        }),
        [],
    );

    useEffect(() => {
        let isActive = true;
        const run = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const [page, count] = await Promise.all([
                    apiGetAllCategories({ pageIndex, pageSize }, filterRequest, false),
                    apiGetCategoryCount(filterRequest),
                ]);
                if (!isActive) return;
                setCategories(page ?? []);
                setTotalRows(count ?? 0);
            } catch (err) {
                if (!isActive) return;
                setError(err instanceof Error ? err.message : 'Failed to load categories.');
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        void run();
        return () => {
            isActive = false;
        };
    }, [pageIndex, pageSize, refreshKey, filterRequest]);

    const onPageChange = useCallback((newPageIndex: number) => {
        setPageIndex(newPageIndex);
    }, []);

    const onPageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize);
        setPageIndex(0);
    }, []);

    const refetch = useCallback(() => {
        setRefreshKey((current) => current + 1);
    }, []);

    return {
        categories,
        isLoading,
        error,
        totalRows,
        pageIndex,
        pageSize,
        pageCount: Math.max(1, Math.ceil(totalRows / pageSize)),
        onPageChange,
        onPageSizeChange,
        refetch,
    };
}
