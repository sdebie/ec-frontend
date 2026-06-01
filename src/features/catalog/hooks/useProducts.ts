import {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
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
    const pageIndex = query.pageIndex ?? 0;
    const pageSize = query.pageSize ?? 25;
    const sortBy = query.sortBy ?? 'name';

    const rq = useQuery({
        queryKey: ['products', query.categoryId, query.brandId, query.search, pageIndex, pageSize],
        queryFn: async () => {
            const filterRequest = buildFilterRequest(query.search ?? '', query.brandId);
            const [pageData, count] = await Promise.all([
                apiGetShoppingProductsList(
                    query.categoryId ?? null,
                    {pageIndex, pageSize},
                    filterRequest,
                ).then((data) => (Array.isArray(data) ? data : [])),
                apiGetProductCount(filterRequest, query.categoryId ?? null, query.brandId ?? null).catch(
                    () => null,
                ),
            ]);
            return {products: pageData, totalCount: count ?? 0};
        },
    });

    const rawProducts = rq.data?.products ?? [];
    const totalCount = rq.data?.totalCount ?? 0;

    // Price sorting is client-side — not part of the query key so the cached
    // dataset is reused and only the derived order changes.
    const sortedProducts = useMemo(() => {
        if (sortBy === 'price-asc' || sortBy === 'price-desc') {
            return sortByPrice(rawProducts, sortBy);
        }
        return rawProducts;
    }, [rawProducts, sortBy]);

    return {
        products: sortedProducts,
        hasNextPage: pageIndex * pageSize + rawProducts.length < totalCount,
        totalCount,
        loading: rq.isPending,
        error: rq.isError ? (rq.error?.message ?? 'Failed to load products.') : null,
        refetch: rq.refetch,
    };
}
