import {useEffect, useState} from 'react';
import {fetchProductAndVariants} from '@/services/graphql/product/product.service.ts';
import type {CatalogProductInformation} from '@/features/catalog/types.ts';

type UseProductDetailResult = {
    product: CatalogProductInformation | null;
    loading: boolean;
    error: string | null;
};

export function useProductDetail(productId?: string): UseProductDetailResult {
    const [product, setProduct] = useState<CatalogProductInformation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;
        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                if (!productId || productId.length < 8) {
                    throw new Error('Invalid product id');
                }
                const result = await fetchProductAndVariants(productId);
                if (isCancelled) return;
                setProduct(result);
            } catch (err) {
                if (!isCancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to load product');
                    setProduct(null);
                }
            } finally {
                if (!isCancelled) setLoading(false);
            }
        };

        void run();
        return () => {
            isCancelled = true;
        };
    }, [productId]);

    return {product, loading, error};
}
