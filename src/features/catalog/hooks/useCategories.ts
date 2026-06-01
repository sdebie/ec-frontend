import {useCallback, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {apiGetAllCategories, apiGetCategoryCount} from '@/services/graphql/category/category.service.ts';
import type {CatalogCategory} from '@/features/catalog/types.ts';
import type {FilterRequest} from '@/types/graphql/query.types.ts';

const CATEGORY_FILTER_REQUEST: FilterRequest = {
    filters: [],
    filterGroups: [],
    sort: [{field: 'name', direction: 'ASC'}],
};

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
    // Pagination is UI-driven state — it lives here, not in the server cache.
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const rq = useQuery({
        queryKey: ['categories', pageIndex, pageSize],
        queryFn: async () => {
            const [page, count] = await Promise.all([
                apiGetAllCategories({pageIndex, pageSize}, CATEGORY_FILTER_REQUEST, false),
                apiGetCategoryCount(CATEGORY_FILTER_REQUEST),
            ]);
            return {categories: page ?? [], totalRows: count ?? 0};
        },
    });

    const onPageChange = useCallback((newPageIndex: number) => {
        setPageIndex(newPageIndex);
    }, []);

    const onPageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize);
        setPageIndex(0);
    }, []);

    const totalRows = rq.data?.totalRows ?? 0;

    return {
        categories: rq.data?.categories ?? [],
        isLoading: rq.isPending,
        error: rq.isError ? (rq.error?.message ?? 'Failed to load categories.') : null,
        totalRows,
        pageIndex,
        pageSize,
        pageCount: Math.max(1, Math.ceil(totalRows / pageSize)),
        onPageChange,
        onPageSizeChange,
        refetch: rq.refetch,
    };
}
