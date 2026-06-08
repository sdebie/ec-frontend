import {ProductCard} from '@/features/catalog/ProductCard.tsx';
import type {CatalogProductListItem} from '@/features/catalog/types.ts';

type ProductListProps = {
    products: CatalogProductListItem[];
    emptyText?: string;
    gridClassName?: string;
    cardClassName?: string;
    badge?: string;
    showCart?: boolean;
    showSave?: boolean;
};

export function ProductList({
                                products,
                                emptyText = 'No products match your filters.',
                                gridClassName = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3',
                                cardClassName,
                                badge,
                                showCart,
                                showSave,
                            }: ProductListProps) {
    if (products.length === 0) {
        return <p className="text-sm text-(--sf-muted-text)">{emptyText}</p>;
    }

    return (
        <div className={gridClassName}>
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    className={cardClassName}
                    badge={badge}
                    showCart={showCart}
                    showSave={showSave}
                    product={product}
                />
            ))}
        </div>
    );
}
