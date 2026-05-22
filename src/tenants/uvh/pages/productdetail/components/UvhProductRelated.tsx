import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ProductCard } from '@/features/catalog';

import type { CatalogProductListItem } from '@/features/catalog/types.ts';

type UvhProductRelatedProps = {
    products: CatalogProductListItem[];
    loading: boolean;
};

export function UvhProductRelated({ products, loading }: UvhProductRelatedProps) {
    if (!loading && products.length === 0) return null;

    return (
        <section className="mt-12 border-t border-(--sf-border) pt-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-(--sf-accent)">
                    You may also like
                </h2>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-(--sf-text) hover:text-(--sf-accent)"
                >
                    View all products
                    <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
            </div>

            {loading ? (
                <p className="mt-6 text-sm text-(--sf-muted-text)">Loading recommendations…</p>
            ) : (
                <div className="-mx-1 mt-6 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                    {products.map((item) => (
                        <ProductCard
                            key={item.id}
                            product={item}
                            size="dense"
                            className="w-36 shrink-0 snap-start sm:w-40"
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
