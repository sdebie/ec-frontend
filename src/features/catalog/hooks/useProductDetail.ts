import {useQuery} from '@tanstack/react-query';
import {fetchProductAndVariants} from '@/services/graphql/product/product.service.ts';
import type {CatalogProductInformation} from '@/features/catalog/types.ts';

type UseProductDetailResult = {
    product: CatalogProductInformation | null;
    loading: boolean;
    error: string | null;
};

const isValidId = (id?: string): id is string => !!id && id.length >= 8;

export function useProductDetail(productId?: string): UseProductDetailResult {
    const query = useQuery({
        queryKey: ['productDetail', productId],
        queryFn: () => fetchProductAndVariants(productId!),
        // Skip the request entirely when the ID is absent or obviously invalid.
        enabled: isValidId(productId),
    });

    return {
        product: query.data ?? null,
        // When `enabled` is false, isPending is true but fetchStatus is 'idle'.
        // Treat that as not-loading so callers don't show a spinner for an invalid ID.
        loading: query.isPending && query.fetchStatus !== 'idle',
        error: query.isError ? (query.error?.message ?? 'Failed to load product') : null,
    };
}
