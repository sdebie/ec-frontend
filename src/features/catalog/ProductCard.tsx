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
    /** Visual size variant. `compact` is used by the home showcase scrollers. */
    size?: 'default' | 'compact';
};

const formatCurrency = (value: number): string => `R ${value.toFixed(2)}`;

const pickFeaturedImage = (product: CatalogProductListItem): string | undefined =>
    product.images?.find((img) => img.isFeatured)?.imageUrl ?? product.images?.[0]?.imageUrl;

export function ProductCard({product, className, size = 'default'}: ProductCardProps) {
    const customerType = useCustomerType();
    const image = pickFeaturedImage(product);
    const {price, originalPrice} = getDisplayPrice(product, customerType);
    // const wholesale = product.wholesaleSalePrice?.price ?? product.wholesalePrice?.price;
    // const showWholesaleHint = customerType === 'retail' && wholesale != null && wholesale > 0;

    const compact = size === 'compact';

    return (
        <article className={cn('min-w-0', className)}>
            <div
                className={cn(
                    'flex h-full flex-col overflow-hidden border border-(--sf-border) bg-(--sf-panel) shadow-sm',
                    compact ? 'rounded-xl' : 'rounded-2xl',
                )}>
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
                <div className={cn('flex flex-1 flex-col', compact ? 'p-2.5' : 'p-4')}>
                    <Link to={`/product/${product.id}`} className={cn('block', compact ? 'min-h-9' : 'min-h-11')}>
                        <h3 className={cn('line-clamp-2 font-semibold text-(--sf-text)', compact ? 'text-xs leading-snug' : 'text-sm')}>{product.name}</h3>
                    </Link>
                    <div className={cn('space-y-1', compact ? 'mt-1.5' : 'mt-3')}>
                        <p className={cn('font-bold text-(--sf-accent)', compact ? 'text-sm' : 'text-base')}>
                            {formatCurrency(price)}
                            <span className={cn('ml-1 font-semibold text-(--sf-muted-text)', compact ? 'text-[10px]' : 'text-xs')}>Ex. VAT</span>
                        </p>
                        {originalPrice != null && originalPrice > price && (
                            <p className={cn('text-(--sf-muted-text) line-through', compact ? 'text-[10px]' : 'text-xs')}>
                                {formatCurrency(originalPrice)}
                            </p>
                        )}
                        {/*{showWholesaleHint && (*/}
                        {/*    <p className="text-xs text-(--sf-muted-text)">Wholesale: {formatCurrency(wholesale!)}</p>*/}
                        {/*)}*/}
                    </div>
                    <div className={cn('flex gap-2', compact ? 'mt-2' : 'mt-4')}>
                        {/*{onAddToCart && product.variantId ? (*/}
                        {/*    <button*/}
                        {/*        type="button"*/}
                        {/*        className="flex-1 rounded-xl border border-(--sf-border) bg-(--sf-panel) py-2.5 text-sm font-semibold text-(--sf-text) transition hover:bg-(--sf-bg)"*/}
                        {/*        onClick={() => onAddToCart(product)}*/}
                        {/*    >*/}
                        {/*        Add to cart*/}
                        {/*    </button>*/}
                        {/*) : null}*/}
                        <Link
                            to={`/product/${product.id}`}
                            className={cn(
                                'flex-1 bg-(--sf-accent) text-center font-semibold text-(--sf-accent-text) transition hover:opacity-95',
                                compact ? 'rounded-lg py-1.5 text-xs' : 'rounded-xl py-2.5 text-sm',
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
