export { ProductCard } from '@/features/catalog/ProductCard.tsx';
export { ProductList } from '@/features/catalog/ProductList.tsx';
export { ProductDetail } from '@/features/catalog/ProductDetail.tsx';

export { useProducts } from '@/features/catalog/hooks/useProducts.ts';
export { useProduct } from '@/features/catalog/hooks/useProduct.ts';
export { useCategories } from '@/features/catalog/hooks/useCategories.ts';
export { useBrands } from '@/features/catalog/hooks/useBrands.ts';
export { useTopBestSellers } from '@/features/catalog/hooks/useTopBestSellers.ts';
export { fetchProductsPage } from '@/features/catalog/hooks/useProducts.ts';

export type {
    CatalogProductListItem,
    CatalogProductInformation,
    CatalogCategory,
    CatalogBrand,
    CatalogProductsQuery,
    CatalogRequest,
} from '@/features/catalog/types.ts';
