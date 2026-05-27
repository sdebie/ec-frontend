import { useEffect, useState } from 'react';

import { apiGetTopBestSellers } from '@/services/graphql/product/product.service.ts';

import type { CatalogProductListItem } from '@/features/catalog/types.ts';


type UseTopBestSellersResult = {
    products: CatalogProductListItem[];
    loading: boolean;
    error: string | null;
};

export function useTopBestSellers(): UseTopBestSellersResult {
    const [products, setProducts] = useState<CatalogProductListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const result = await apiGetTopBestSellers();
                if (!isMounted) return;
                setProducts(result ?? []);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load featured products.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        void run();
        return () => {
            isMounted = false;
        };
    }, []);

    return { products, loading, error };
}
