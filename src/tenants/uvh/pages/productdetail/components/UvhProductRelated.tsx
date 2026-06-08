import {ChevronRight} from 'lucide-react';
import {Link} from 'react-router-dom';
import {ProductCard} from '@/features/catalog/ProductCard';
import {UvhSectionHeading} from '@/tenants/uvh/components/UvhSectionHeading';
import type {ProductShoppingListItem} from '@/types/shared/ProductTypes.ts';

type UvhProductRelatedProps = {
    products: ProductShoppingListItem[];
    loading: boolean;
};

export function UvhProductRelated({products, loading}: UvhProductRelatedProps) {
    if (!loading && products.length === 0) return null;

    return (
        <section className="mt-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <UvhSectionHeading eyebrow="You May Also Like">Related Products</UvhSectionHeading>
                </div>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-(--sf-text) hover:text-(--sf-accent) transition-colors"
                >
                    View all products
                    <ChevronRight className="h-4 w-4" aria-hidden/>
                </Link>
            </div>

            {loading ? (
                <p className="mt-6 text-sm text-(--sf-muted-text)">Loading recommendations…</p>
            ) : (
                <div
                    className="mt-6 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {products.map((item) => (
                        <ProductCard
                            key={item.id}
                            product={item}
                            className="w-44 shrink-0 snap-start sm:w-52"
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
