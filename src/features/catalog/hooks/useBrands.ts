import {useQuery} from '@tanstack/react-query';
import {apiGetAllBrands} from '@/services/graphql/brand/brand.service.ts';
import type {CatalogBrand} from '@/features/catalog/types.ts';

type UseBrandsResult = {
    brands: CatalogBrand[];
    loading: boolean;
    error: string | null;
};

export function useBrands(limit = 30): UseBrandsResult {
    const query = useQuery({
        queryKey: ['brands', limit],
        queryFn: () =>
            apiGetAllBrands(
                {pageIndex: 0, pageSize: limit},
                {filters: [], filterGroups: [], sort: [{field: 'name', direction: 'ASC'}]},
            ).then((items) => items ?? []),
    });

    return {
        brands: query.data ?? [],
        loading: query.isPending,
        error: query.isError ? (query.error?.message ?? 'Failed to load brands.') : null,
    };
}
