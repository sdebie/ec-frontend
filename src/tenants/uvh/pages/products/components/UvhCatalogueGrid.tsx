import {CataloguePagination} from '@/features/catalog/CataloguePagination';
import {ProductCard} from '@/features/catalog/ProductCard';
import {
    UVH_CATALOGUE_GRID_CLASS,
    UVH_CATALOGUE_PAGE_SIZE_OPTIONS
} from '@/tenants/uvh/pages/products/catalogue.config.ts';
import type {ProductShoppingListItem} from '@/types/shared/ProductTypes.ts';

type UvhCatalogueGridProps = {
    products: ProductShoppingListItem[];
    loading: boolean;
    error: string | null;
    pageIndex: number;
    pageCount: number;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
    onPageChange: (index: number) => void;
    onPageSizeChange: (size: number) => void;
};

export function UvhCatalogueGrid({
                                     products,
                                     loading,
                                     error,
                                     pageIndex,
                                     pageCount,
                                     pageSize,
                                     totalCount,
                                     hasNextPage,
                                     onPageChange,
                                     onPageSizeChange,
                                 }: UvhCatalogueGridProps) {
    if (loading) {
        return <p className="py-12 text-center text-sm text-(--sf-muted-text)">Loading products…</p>;
    }

    if (error) {
        return <p className="py-12 text-center text-sm text-red-600">Error: {error}</p>;
    }

    return (
        <div className="space-y-6">
            {products.length === 0 ? (
                <p className="text-sm text-(--sf-muted-text)">No products match your filters.</p>
            ) : (
                <div className={UVH_CATALOGUE_GRID_CLASS}>
                    {products.map(product => (
                        <ProductCard key={product.id} product={product}/>
                    ))}
                </div>
            )}

            <CataloguePagination
                pageIndex={pageIndex}
                pageCount={pageCount}
                pageSize={pageSize}
                totalCount={totalCount}
                hasNextPage={hasNextPage}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                pageSizeOptions={UVH_CATALOGUE_PAGE_SIZE_OPTIONS}
            />
        </div>
    );
}
