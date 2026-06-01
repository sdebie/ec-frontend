import {useQuery} from '@tanstack/react-query';
import {apiGetTopBestSellers} from '@/services/graphql/product/product.service.ts';
import type {CatalogProductListItem} from '@/features/catalog/types.ts';

type UseTopBestSellersResult = {
    products: CatalogProductListItem[];
    loading: boolean;
    error: string | null;
};

export function useTopBestSellers(): UseTopBestSellersResult {
    const query = useQuery({
        queryKey: ['topBestSellers'],
        queryFn: () => apiGetTopBestSellers().then((result) => result ?? []),
    });

    return {
        products: query.data ?? [],
        loading: query.isPending,
        error: query.isError ? (query.error?.message ?? 'Failed to load featured products.') : null,
    };
}
