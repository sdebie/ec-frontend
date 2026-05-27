import { useMemo } from 'react';

import { useProduct, useProducts } from '@/features/catalog';
import { mapUvhProductDetail } from '@/tenants/uvh/pages/productdetail/mapUvhProductDetail.ts';
import { useUvhProductDetailConfig } from '@/tenants/uvh/pages/productdetail/useUvhProductDetailConfig.ts';

import type { CatalogProductListItem } from '@/features/catalog/types.ts';
import type { UvhDetailProduct } from '@/tenants/uvh/pages/productdetail/mapUvhProductDetail.ts';
import type { UvhProductDetailConfig } from '@/tenants/uvh/pages/productdetail/useUvhProductDetailConfig.ts';

const RELATED_PAGE_SIZE = 12;

type UseUvhProductDetailResult = {
    product: UvhDetailProduct | null;
    relatedProducts: CatalogProductListItem[];
    config: UvhProductDetailConfig;
    loading: boolean;
    relatedLoading: boolean;
    error: string | null;
};

export function useUvhProductDetail(productId?: string): UseUvhProductDetailResult {
    const { product: rawProduct, loading, error } = useProduct(productId);
    const product = useMemo(() => mapUvhProductDetail(rawProduct), [rawProduct]);
    const categoryId = product?.categoryId ?? null;
    const config = useUvhProductDetailConfig();

    const { products: categoryProducts, loading: relatedLoading } = useProducts({
        categoryId,
        pageSize: RELATED_PAGE_SIZE,
    });

    const relatedProducts = useMemo(() => {
        if (!productId) return [];
        return categoryProducts.filter((item) => item.id !== productId).slice(0, 8);
    }, [categoryProducts, productId]);

    return {
        product,
        relatedProducts,
        config,
        loading,
        relatedLoading,
        error,
    };
}
