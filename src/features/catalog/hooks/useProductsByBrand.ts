import { useEffect, useMemo, useState } from 'react';

import { apiGetProductListByBrand } from '@/services/graphql/product/product.service.ts';

import type { CatalogProductListItem } from '@/features/catalog/types.ts';
import type { ProductListItem } from '@/types/admin/ProductTypes.ts';

type UseProductsByBrandQuery = {
    brandId: string | null;
    search?: string;
    sortBy?: 'name' | 'price-asc' | 'price-desc';
    pageIndex?: number;
    pageSize?: number;
};

type UseProductsByBrandResult = {
    products: CatalogProductListItem[];
    hasNextPage: boolean;
    totalCount: number;
    loading: boolean;
    error: string | null;
};

const DEFAULT_PAGE_SIZE = 10;

/**
 * Adapt the leaner `ProductListItem` (brand list) to the richer
 * `ProductShoppingListItem`-shaped item the storefront cards expect.
 * Image comes from `imageName`; price fields are null until shopping data is
 * available for this endpoint.
 */
function adaptToCatalogItem(item: ProductListItem): CatalogProductListItem {
    return {
        id: item.id,
        name: item.name,
        shortDescription: item.description ?? null,
        variantCount: item.variantIds?.length ?? null,
        variantId: item.variantIds?.[0] ?? null,
        images: item.imageName
            ? [{ id: item.id, imageUrl: item.imageName, isFeatured: true }]
            : null,
        retailPrice: null,
        wholesalePrice: null,
        retailSalePrice: null,
        wholesaleSalePrice: null,
    };
}

function searchMatches(item: ProductListItem, search: string): boolean {
    if (!search) return true;
    const needle = search.toLowerCase();
    return (
        item.name.toLowerCase().includes(needle) ||
        (item.description?.toLowerCase().includes(needle) ?? false) ||
        (item.categoryNames?.some((name) => name.toLowerCase().includes(needle)) ?? false)
    );
}

export function useProductsByBrand({
    brandId,
    search = '',
    sortBy = 'name',
    pageIndex = 0,
    pageSize = DEFAULT_PAGE_SIZE,
}: UseProductsByBrandQuery): UseProductsByBrandResult {
    const [allBrandProducts, setAllBrandProducts] = useState<ProductListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        if (!brandId) {
            setAllBrandProducts([]);
            setLoading(false);
            setError(null);
            return () => {
                isMounted = false;
            };
        }

        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await apiGetProductListByBrand(
                    brandId,
                    { pageIndex: 0, pageSize: 500 },
                    {
                        filters: [],
                        filterGroups: [],
                        sort: [{ field: 'name', direction: 'ASC' }],
                    },
                );
                if (!isMounted) return;
                setAllBrandProducts(data ?? []);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load brand products.');
                setAllBrandProducts([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        void run();
        return () => {
            isMounted = false;
        };
    }, [brandId]);

    const filtered = useMemo(
        () => allBrandProducts.filter((item) => searchMatches(item, search.trim())),
        [allBrandProducts, search],
    );

    const sorted = useMemo(() => {
        const copy = [...filtered];
        if (sortBy === 'name') {
            copy.sort((a, b) => a.name.localeCompare(b.name));
        }
        return copy;
    }, [filtered, sortBy]);

    const pageStart = pageIndex * pageSize;
    const pageEnd = pageStart + pageSize;
    const pageItems = sorted.slice(pageStart, pageEnd);

    const products = useMemo(() => pageItems.map(adaptToCatalogItem), [pageItems]);
    const hasNextPage = sorted.length > pageEnd;
    const totalCount = sorted.length;

    return { products, hasNextPage, totalCount, loading, error };
}
