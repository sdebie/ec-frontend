import {ProductList} from '@/features/catalog';
import {Button} from '@/primitives/button';
import {UVH_CATALOGUE_GRID_CLASS} from '@/tenants/uvh/pages/products/catalogue.config.ts';

import type {CatalogProductListItem} from '@/features/catalog/types.ts';

type UvhCatalogueResultsProps = {
    products: CatalogProductListItem[];
    loading: boolean;
    error: string | null;
    pageIndex: number;
    pageCount: number;
    hasNextPage: boolean;
    onPageChange: (index: number) => void;
};

export function UvhCatalogueResults({
    products,
    loading,
    error,
    pageIndex,
    pageCount,
    hasNextPage,
    onPageChange,
}: UvhCatalogueResultsProps) {
    if (loading) {
        return <p className="py-12 text-center text-sm text-(--sf-muted-text)">Loading products…</p>;
    }

    if (error) {
        return <p className="py-12 text-center text-sm text-red-600">Error: {error}</p>;
    }

    return (
        <div className="space-y-6">
            <ProductList
                products={products}
                emptyText="No products match your filters."
                gridClassName={UVH_CATALOGUE_GRID_CLASS}
                cardSize="dense"
            />

            {pageCount > 1 ? (
                <nav
                    className="flex flex-wrap items-center justify-center gap-3 border-t border-(--sf-border) pt-6"
                    aria-label="Product pagination"
                >
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pageIndex <= 0}
                        onClick={() => onPageChange(pageIndex - 1)}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-(--sf-muted-text)">
                        Page {pageIndex + 1} of {pageCount}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!hasNextPage}
                        onClick={() => onPageChange(pageIndex + 1)}
                    >
                        Next
                    </Button>
                </nav>
            ) : null}
        </div>
    );
}
