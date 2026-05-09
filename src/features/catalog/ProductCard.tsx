import { Link } from 'react-router-dom';


import { IMAGE_THUMBNAIL_URL } from '@/constants/api.constant.ts';
import { getDisplayPrice } from '@/features/catalog/utils/pricing.ts';
import { useCustomerType } from '@/store/customerTypeStore.ts';
import { cn } from '@/utils/cn';

import type { CatalogProductListItem } from '@/features/catalog/types.ts';

type ProductCardProps = {
    product: CatalogProductListItem;
    className?: string;
    onAddToCart?: (product: CatalogProductListItem) => void;
};

const formatCurrency = (value: number): string => `R ${value.toFixed(2)}`;

const pickFeaturedImage = (product: CatalogProductListItem): string | undefined =>
    product.images?.find((img) => img.isFeatured)?.imageUrl ?? product.images?.[0]?.imageUrl;

export function ProductCard({ product, className, onAddToCart }: ProductCardProps) {
    const customerType = useCustomerType();
    const image = pickFeaturedImage(product);
    const { price, originalPrice } = getDisplayPrice(product, customerType);
    const wholesale = product.wholesaleSalePrice?.price ?? product.wholesalePrice?.price;
    const showWholesaleHint = customerType === 'retail' && wholesale != null && wholesale > 0;

    return (
        <article className={cn('min-w-0', className)}>
            <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-(--sf-border) bg-(--sf-panel) shadow-sm">
                <Link to={`/product/${product.id}`} className="relative block aspect-square bg-(--sf-bg)">
                    {image ? (
                        <img
                            src={`${IMAGE_THUMBNAIL_URL}${image}`}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-(--sf-muted-text)">
                            <span className="text-xs">No image</span>
                        </div>
                    )}
                </Link>
                <div className="flex flex-1 flex-col p-4">
                    <Link to={`/product/${product.id}`} className="block min-h-[2.75rem]">
                        <h3 className="line-clamp-2 text-sm font-semibold text-(--sf-text)">{product.name}</h3>
                    </Link>
                    <div className="mt-3 space-y-1">
                        <p className="text-base font-bold text-(--sf-accent)">
                            {formatCurrency(price)}
                            <span className="ml-1 text-xs font-semibold text-(--sf-muted-text)">Ex. VAT</span>
                        </p>
                        {originalPrice != null && originalPrice > price && (
                            <p className="text-xs text-(--sf-muted-text) line-through">
                                {formatCurrency(originalPrice)}
                            </p>
                        )}
                        {showWholesaleHint && (
                            <p className="text-xs text-(--sf-muted-text)">Wholesale: {formatCurrency(wholesale!)}</p>
                        )}
                    </div>
                    <div className="mt-4 flex gap-2">
                        {onAddToCart && product.variantId ? (
                            <button
                                type="button"
                                className="flex-1 rounded-xl border border-(--sf-border) bg-(--sf-panel) py-2.5 text-sm font-semibold text-(--sf-text) transition hover:bg-(--sf-bg)"
                                onClick={() => onAddToCart(product)}
                            >
                                Add to cart
                            </button>
                        ) : null}
                        <Link
                            to={`/product/${product.id}`}
                            className="flex-1 rounded-xl bg-(--sf-accent) py-2.5 text-center text-sm font-semibold text-(--sf-accent-text) transition hover:opacity-95"
                        >
                            View product
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
