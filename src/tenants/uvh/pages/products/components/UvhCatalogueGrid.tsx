import {ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight} from 'lucide-react';

import {ProductCard} from '@/features/catalog/ProductCard';
import {cn} from '@/utils/cn';
import {UVH_CATALOGUE_GRID_CLASS, UVH_CATALOGUE_PAGE_SIZE_OPTIONS} from '@/tenants/uvh/pages/products/catalogue.config.ts';

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

const SIBLINGS = 2;
const ALWAYS_SHOW_THRESHOLD = 2 * SIBLINGS + 5;

function getPageRange(current: number, total: number): (number | '...')[] {
    if (total <= ALWAYS_SHOW_THRESHOLD) {
        return Array.from({length: total}, (_, i) => i + 1);
    }

    const left = Math.max(current - SIBLINGS, 1);
    const right = Math.min(current + SIBLINGS, total);
    const showLeftDots = left > 2;
    const showRightDots = right < total - 1;
    const edgeCount = 2 * SIBLINGS + 3;

    if (!showLeftDots && showRightDots) {
        return [...Array.from({length: edgeCount}, (_, i) => i + 1), '...', total];
    }
    if (showLeftDots && !showRightDots) {
        return [1, '...', ...Array.from({length: edgeCount}, (_, i) => total - edgeCount + i + 1)];
    }
    return [1, '...', ...Array.from({length: right - left + 1}, (_, i) => left + i), '...', total];
}

const navBtn =
    'inline-flex items-center justify-center w-8 h-8 rounded-md border border-(--sf-border) bg-(--sf-panel) text-(--sf-muted-text) transition-colors';
const navBtnEnabled = 'hover:text-(--sf-text) cursor-pointer';
const navBtnDisabled = 'opacity-40 cursor-not-allowed';
const navBtnActive = 'bg-(--sf-accent) text-(--sf-accent-text) border-(--sf-accent) font-semibold';

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

    const showingFrom = totalCount === 0 ? 0 : pageIndex * pageSize + 1;
    const showingTo = Math.min((pageIndex + 1) * pageSize, totalCount);

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

            {totalCount > 0 && (
                <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl border border-(--sf-border) bg-(--sf-panel) text-sm">
                    <p className="shrink-0 text-(--sf-muted-text)">
                        Showing{' '}
                        <strong className="font-semibold text-(--sf-text)">
                            {showingFrom}–{showingTo}
                        </strong>{' '}
                        of {totalCount} products
                    </p>

                    {pageCount > 1 && (
                        <nav className="flex items-center gap-1" aria-label="Product pagination">
                            <button
                                type="button"
                                disabled={pageIndex <= 0}
                                onClick={() => onPageChange(0)}
                                className={cn(navBtn, pageIndex <= 0 ? navBtnDisabled : navBtnEnabled)}
                            >
                                <ChevronsLeft className="h-3.5 w-3.5"/>
                            </button>
                            <button
                                type="button"
                                disabled={pageIndex <= 0}
                                onClick={() => onPageChange(pageIndex - 1)}
                                className={cn(navBtn, pageIndex <= 0 ? navBtnDisabled : navBtnEnabled)}
                            >
                                <ChevronLeft className="h-3.5 w-3.5"/>
                            </button>

                            {getPageRange(pageIndex + 1, pageCount).map((page, i) =>
                                page === '...' ? (
                                    <span
                                        key={`dots-${i}`}
                                        className="inline-flex w-8 items-center justify-center text-(--sf-muted-text) select-none"
                                    >
                                        ···
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => onPageChange((page as number) - 1)}
                                        className={cn(
                                            navBtn,
                                            pageIndex + 1 === page ? navBtnActive : navBtnEnabled,
                                        )}
                                    >
                                        {page}
                                    </button>
                                )
                            )}

                            <button
                                type="button"
                                disabled={!hasNextPage}
                                onClick={() => onPageChange(pageIndex + 1)}
                                className={cn(navBtn, !hasNextPage ? navBtnDisabled : navBtnEnabled)}
                            >
                                <ChevronRight className="h-3.5 w-3.5"/>
                            </button>
                            <button
                                type="button"
                                disabled={!hasNextPage}
                                onClick={() => onPageChange(pageCount - 1)}
                                className={cn(navBtn, !hasNextPage ? navBtnDisabled : navBtnEnabled)}
                            >
                                <ChevronsRight className="h-3.5 w-3.5"/>
                            </button>
                        </nav>
                    )}

                    <div className="relative shrink-0">
                        <select
                            value={pageSize}
                            onChange={e => onPageSizeChange(Number(e.target.value))}
                            className="appearance-none cursor-pointer rounded-md border border-(--sf-border) bg-(--sf-panel) py-1.5 pl-3 pr-8 text-sm text-(--sf-text) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
                        >
                            {UVH_CATALOGUE_PAGE_SIZE_OPTIONS.map(n => (
                                <option key={n} value={n}>{n} per page</option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-(--sf-muted-text)"/>
                    </div>
                </div>
            )}
        </div>
    );
}
