import { useEffect, useState } from 'react';

import { fetchProductAndVariants } from '@/services/graphql/product/product.service.ts';

import type { CatalogProductInformation } from '@/features/catalog/types.ts';


type UseProductResult = {
    product: CatalogProductInformation | null;
    loading: boolean;
    error: string | null;
};

export function useProduct(productId?: string): UseProductResult {
    const [product, setProduct] = useState<CatalogProductInformation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;
        const run = async () => {
            let startTime: number;
            try {
                startTime = performance.now(); // Record start time
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
                if (!isCancelled) {
                    setLoading(false);
                    const endTime = performance.now(); // Record end time
                    const duration = endTime - startTime; // Calculate duration
                    console.log(`Fetching products done in ${duration.toFixed(2)} ms`); // Log duration
                }
            }
        };

        void run();
        return () => {
            isCancelled = true;
        };
    }, [productId]);

    return { product, loading, error };
}