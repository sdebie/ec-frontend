import {Link} from 'react-router-dom';
import {useProducts} from '@/features/catalog';
import type {FeaturedProductsSectionProps} from '@/types/storefront/storefrontTypes';

interface Props {
    props: FeaturedProductsSectionProps;
}

export const FeaturedProductsSection = ({props}: Props) => {
    const limit = props.limit && props.limit > 0 ? props.limit : 6;
    const {products, loading, error} = useProducts({
        categoryId: props.category || null,
        pageIndex: 0,
        pageSize: limit,
        sortBy: 'name',
    });
    const items = products.slice(0, limit);

    return (
        <section className="rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-panel)] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">{props.title}</h2>
            {loading ? (
                <p className="mt-4 text-[var(--sf-muted-text)]">Loading products...</p>
            ) : error ? (
                <p className="mt-4 text-[var(--sf-muted-text)]">{error}</p>
            ) : items.length === 0 ? (
                <p className="mt-4 text-[var(--sf-muted-text)]">No products available.</p>
            ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((product) => (
                        <Link
                            key={product.id}
                            to={`/product/${product.id}`}
                            className="rounded-lg border border-[var(--sf-border)] bg-[var(--sf-bg)] p-4 transition hover:border-[var(--sf-accent)]"
                        >
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="mt-1 text-sm text-[var(--sf-muted-text)] line-clamp-2">
                                {product.shortDescription || 'No description available'}
                            </p>
                            <p className="mt-3 text-sm font-medium text-(--sf-accent)">View details</p>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
};
