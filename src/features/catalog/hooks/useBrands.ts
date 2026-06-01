import { useEffect, useState } from 'react';

import { apiGetAllBrands } from '@/services/graphql/brand/brand.service.ts';

import type { CatalogBrand } from '@/features/catalog/types.ts';


type UseBrandsResult = {
    brands: CatalogBrand[];
    loading: boolean;
    error: string | null;
};

export function useBrands(limit = 30): UseBrandsResult {
    const [brands, setBrands] = useState<CatalogBrand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const items = await apiGetAllBrands(
                    { pageIndex: 0, pageSize: limit },
                    { filters: [], filterGroups: [], sort: [{ field: 'name', direction: 'ASC' }] },
                );
                if (!isMounted) return;
                setBrands(items ?? []);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load brands.');
                setBrands([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        void run();
        return () => {
            isMounted = false;
        };
    }, [limit]);

    return { brands, loading, error };
}
