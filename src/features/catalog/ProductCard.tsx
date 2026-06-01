import {Link} from 'react-router-dom';
import {IMAGE_BASE_URL} from '@/constants/api.constant.ts';
import {CustomerType} from '@/constants/enums/CustomerType';
import {getDisplayPrice} from '@/features/catalog/utils/pricing.ts';
import {pickFeaturedImage} from '@/features/catalog/utils/imageUtils.ts';
import {useCustomerType} from '@/store/customerTypeStore.ts';
import {cn} from '@/utils/cn';
import {formatAmount} from '@/utils/formatAmount.ts';
import type {ProductShoppingListItem} from '@/types/shared/ProductTypes.ts';

// Re-exported as CatalogProductListItem alias in types.ts — consumers can use either.
export type {ProductShoppingListItem as ProductCardProduct};

export type ProductCardProps = {
    product: ProductShoppingListItem;
    className?: string;
    /** Optional badge chip rendered over the image (e.g. "Best Seller", "Sale"). */
    badge?: string;
    /** Show the cart-link icon button overlay on the image. Default false. */
    showCart?: boolean;
    /** Show the save/heart icon button overlay on the image. Default false. */
    showSave?: boolean;
};

export function ProductCard({product, className, badge, showCart = false, showSave = false}: ProductCardProps) {
    const customerType = useCustomerType();
    const priceInfo = getDisplayPrice(product, customerType);
    const wholesale = product.wholesaleSalePrice?.price ?? product.wholesalePrice?.price;
    const showWholesaleHint = customerType === CustomerType.RETAILER && wholesale != null && wholesale > 0 && wholesale !== priceInfo.price;
    const imgPath = pickFeaturedImage(product);
    const imageUrl = imgPath ? `${IMAGE_BASE_URL}${imgPath}` : undefined;
    const productTo = `/product/${product.id}`;

    return (
        <article className={cn('min-w-0', className)}>
            <div
                className="flex h-full flex-col overflow-hidden rounded-xl border border-(--sf-border) bg-(--sf-panel) shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                <div className="relative aspect-square bg-(--sf-bg)">
                    <Link
                        to={productTo}
                        className="absolute inset-0 flex items-center justify-center p-4"
                        tabIndex={-1}
                        aria-hidden
                    >
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={product.name}
                                className="max-h-full max-w-full object-contain"
                                loading="lazy"
                            />
                        ) : (
                            <span className="text-xs text-(--sf-muted-text)">No image</span>
                        )}
                    </Link>

                    {badge && (
                        <span
                            className="absolute left-3 top-3 rounded-full bg-(--sf-accent) px-2.5 py-1 text-xs font-semibold text-(--sf-accent-text)">
                            {badge}
                        </span>
                    )}

                    {(showCart || showSave) && (
                        <div className="absolute right-3 top-3 flex flex-col gap-2">
                            {showCart && (
                                <Link
                                    to={productTo}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-(--sf-accent) text-(--sf-accent-text) shadow-sm transition hover:opacity-90"
                                    aria-label={`View ${product.name}`}
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                         aria-hidden>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                                    </svg>
                                </Link>
                            )}
                            {showSave && (
                                <Link
                                    to={productTo}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-(--sf-accent) text-(--sf-accent-text) shadow-sm transition hover:opacity-90"
                                    aria-label={`Save ${product.name} for later`}
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                         aria-hidden>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                                    </svg>
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-3">
                    <Link
                        to={productTo}
                        className="line-clamp-2 text-xs font-bold leading-snug text-(--sf-text) hover:underline"
                    >
                        {product.name}
                    </Link>

                    <div>
                        <p className="text-sm font-bold text-(--sf-accent)">
                            {formatAmount(priceInfo.price)}
                            <span className="ml-1 text-xs font-normal text-(--sf-muted-text)">Ex. VAT</span>
                        </p>
                        {priceInfo.originalPrice != null && priceInfo.originalPrice > priceInfo.price && (
                            <p className="mt-0.5 text-xs text-(--sf-muted-text) line-through">
                                {formatAmount(priceInfo.originalPrice)}
                            </p>
                        )}
                        {showWholesaleHint && (
                            <p className="mt-0.5 text-xs text-(--sf-text)">
                                Wholesale: {formatAmount(wholesale ?? 0)}
                            </p>
                        )}
                    </div>

                    <Link
                        to={productTo}
                        className="mt-auto block w-full rounded-lg bg-(--sf-accent) py-2 text-center text-xs font-semibold text-(--sf-accent-text) transition hover:opacity-95"
                    >
                        View Product
                    </Link>
                </div>
            </div>
        </article>
    );
}
