import {Link} from 'react-router-dom';

import {IMAGE_THUMBNAIL_URL} from '@/constants/api.constant.ts';
import {getDisplayPrice} from '@/features/catalog/utils/pricing.ts';
import {useCustomerType} from '@/store/customerTypeStore.ts';
import {cn} from '@/utils/cn';

import type {CatalogProductListItem} from '@/features/catalog/types.ts';

type ProductCardProps = {
    product: CatalogProductListItem;
    className?: string;
    onAddToCart?: (product: CatalogProductListItem) => void;
    /** Visual size variant. `compact` for home scrollers; `dense` for catalogue grids. */
    size?: 'default' | 'compact' | 'dense';
};

const formatCurrency = (value: number): string => `R ${value.toFixed(2)}`;

const pickFeaturedImage = (product: CatalogProductListItem): string | undefined =>
    product.images?.find((img) => img.isFeatured)?.imageUrl ?? product.images?.[0]?.imageUrl;

export function ProductCard({product, className, size = 'default'}: ProductCardProps) {
    const customerType = useCustomerType();
    const image = pickFeaturedImage(product);
    const {price, originalPrice} = getDisplayPrice(product, customerType);

    const dense = size === 'dense';
    const compact = size === 'compact' || dense;

    return (
        <article className={cn('min-w-0', className)}>
            <div
                className={cn(
                    'flex h-full flex-col overflow-hidden border border-(--sf-border) bg-(--sf-panel) shadow-sm',
                    dense ? 'rounded-lg' : compact ? 'rounded-xl' : 'rounded-2xl',
                )}
            >
                <Link
                    to={`/product/${product.id}`}
                    className={cn('relative block bg-(--sf-bg)', dense ? 'aspect-[4/3]' : 'aspect-square')}
                >
                    {image ? (
                        <img
                            src={`${IMAGE_THUMBNAIL_URL}${image}`}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-(--sf-muted-text)">
                            <span className={dense ? 'text-[10px]' : 'text-xs'}>No image</span>
                        </div>
                    )}
                </Link>
                <div className={cn('flex flex-1 flex-col', dense ? 'p-2' : compact ? 'p-2.5' : 'p-4')}>
                    <Link
                        to={`/product/${product.id}`}
                        className={cn('block', dense ? 'min-h-8' : compact ? 'min-h-9' : 'min-h-11')}
                    >
                        <h3
                            className={cn(
                                'line-clamp-2 font-semibold text-(--sf-text)',
                                dense ? 'text-[10px] leading-snug' : compact ? 'text-xs leading-snug' : 'text-sm',
                            )}
                        >
                            {product.name}
                        </h3>
                    </Link>
                    <div className={cn(dense ? 'mt-1 space-y-0.5' : compact ? 'mt-1.5 space-y-1' : 'mt-3 space-y-1')}>
                        <p
                            className={cn(
                                'font-bold text-(--sf-accent)',
                                dense ? 'text-xs' : compact ? 'text-sm' : 'text-base',
                            )}
                        >
                            {formatCurrency(price)}
                            <span
                                className={cn(
                                    'font-semibold text-(--sf-muted-text)',
                                    dense ? 'ml-0.5 text-[9px]' : compact ? 'ml-1 text-[10px]' : 'ml-1 text-xs',
                                )}
                            >
                                Ex. VAT
                            </span>
                        </p>
                        {originalPrice != null && originalPrice > price && (
                            <p
                                className={cn(
                                    'text-(--sf-muted-text) line-through',
                                    dense ? 'text-[9px]' : compact ? 'text-[10px]' : 'text-xs',
                                )}
                            >
                                {formatCurrency(originalPrice)}
                            </p>
                        )}
                    </div>
                    <div className={cn('flex gap-2', dense ? 'mt-1.5' : compact ? 'mt-2' : 'mt-4')}>
                        <Link
                            to={`/product/${product.id}`}
                            className={cn(
                                'flex-1 bg-(--sf-accent) text-center font-semibold text-(--sf-accent-text) transition hover:opacity-95',
                                dense
                                    ? 'rounded-md py-1 text-[10px]'
                                    : compact
                                      ? 'rounded-lg py-1.5 text-xs'
                                      : 'rounded-xl py-2.5 text-sm',
                            )}
                        >
                            View product
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
