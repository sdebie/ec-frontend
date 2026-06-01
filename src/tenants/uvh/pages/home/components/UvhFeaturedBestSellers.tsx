import {useCallback, useRef} from 'react';
import {Link} from 'react-router-dom';
import {IMAGE_BASE_URL} from '@/constants/api.constant.ts';
import {getDisplayPrice} from '@/features/catalog/utils/pricing.ts';
import {Card} from '@/primitives/card';
import {useCustomerType, useIsWholesaler} from '@/store/customerTypeStore.ts';
import {UvhSectionHeading} from '@/tenants/uvh/components/UvhSectionHeading';

import type {ProductShoppingListItem} from '@/types/admin/ProductTypes.ts';
import formatAmount from "@/utils/formatAmount.ts";

const formatZar = (value: number): string =>
    new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 2,
    }).format(value);

const pickFeaturedImage = (product: ProductShoppingListItem): string | undefined => {
    return product.images?.find((img) => img.isFeatured)?.imageUrl ?? product.images?.[0]?.imageUrl;
};

function CartGlyph({className}: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
        </svg>
    );
}

function ChevronLeft({className}: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
        </svg>
    );
}

function ChevronRight({className}: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
        </svg>
    );
}

export type UvhFeaturedBestSellersProps = {
    products: ProductShoppingListItem[];
    loading: boolean;
    error: string | null;
};

export function UvhFeaturedBestSellers({products, loading, error}: UvhFeaturedBestSellersProps) {
    const customerType = useCustomerType();
    const isWholesaler = useIsWholesaler();
    console.log("Type " + customerType + " is Wholesaler " + isWholesaler)

    const scrollerRef = useRef<HTMLDivElement>(null);

    const scrollByDirection = useCallback((dir: -1 | 1) => {
        const el = scrollerRef.current;
        if (!el) return;
        const delta = Math.round(el.clientWidth * 0.85);
        el.scrollBy({left: dir * delta, behavior: 'smooth'});
    }, []);

    return (
        <section
            className="w-full bg-zinc-100 py-6 sm:py-8"
            aria-label="Featured and best selling products"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <UvhSectionHeading>Best Sellers</UvhSectionHeading>

                {loading && (
                    <Card elevation="none" padded={false} className="mt-8 p-8 text-sm text-(--sf-muted-text)">
                        Loading products...
                    </Card>
                )}
                {error && !loading && (
                    <Card elevation="none" padded={false}
                          className="mt-8 p-8 text-sm text-(--sf-muted-text)">Error: {error}</Card>
                )}
                {!loading && !error && products.length === 0 && (
                    <Card elevation="none" padded={false} className="mt-8 p-8 text-sm text-(--sf-muted-text)">
                        No featured products available right now.
                    </Card>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="relative mt-6">
                        <button
                            type="button"
                            onClick={() => scrollByDirection(-1)}
                            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-zinc-200/80 bg-white/85 p-2.5 text-zinc-700 shadow-md backdrop-blur-sm transition hover:bg-white md:flex md:-translate-x-2"
                            aria-label="Scroll products left"
                        >
                            <ChevronLeft className="h-5 w-5"/>
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollByDirection(1)}
                            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-zinc-200/80 bg-white/85 p-2.5 text-zinc-700 shadow-md backdrop-blur-sm transition hover:bg-white md:flex md:translate-x-2"
                            aria-label="Scroll products right"
                        >
                            <ChevronRight className="h-5 w-5"/>
                        </button>

                        <div
                            ref={scrollerRef}
                            className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:[display:none]"
                        >
                            {products.map((product) => {
                                const priceInfo = getDisplayPrice(product, customerType);
                                const wholesale = product.wholesaleSalePrice?.price ?? product.wholesalePrice?.price;
                                const showWholesaleHint =
                                    isWholesaler && wholesale != null && wholesale > 0;
                                const imgPath = pickFeaturedImage(product);
                                const imageUrl = imgPath ? `${IMAGE_BASE_URL}${imgPath}` : undefined;
                                const productTo = `/product/${product.id}`;

                                return (
                                    <article
                                        key={product.id}
                                        className="snap-start shrink-0 w-[min(80vw,220px)] sm:w-[210px] lg:w-[calc((100%-3rem)/5)]"
                                    >
                                        <div
                                            className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
                                            <div className="relative aspect-square bg-zinc-100">
                                                <Link
                                                    to={productTo}
                                                    className="absolute inset-0 flex items-center justify-center p-4"
                                                >
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={product.name}
                                                            className="max-h-full max-w-full object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-zinc-400">No image</span>
                                                    )}
                                                </Link>
                                                <span
                                                    className="absolute left-3 top-3 rounded-full bg-(--sf-accent) px-2.5 py-1 text-xs font-semibold text-(--sf-accent-text)">
                                                    Best Seller
                                                </span>
                                                <div className="absolute right-3 top-3 flex flex-col gap-2">
                                                    <Link
                                                        to={productTo}
                                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-(--sf-accent) text-(--sf-accent-text) shadow-sm transition hover:opacity-90"
                                                        aria-label={`View ${product.name} to add to cart`}
                                                    >
                                                        <CartGlyph className="h-4 w-4"/>
                                                    </Link>
                                                    <Link
                                                        to={productTo}
                                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-(--sf-accent) text-(--sf-accent-text) shadow-sm transition hover:opacity-90"
                                                        aria-label={`Save ${product.name} for later`}
                                                    >
                                                        <svg
                                                            className="h-4 w-4"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            aria-hidden
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                            />
                                                        </svg>
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="flex flex-1 flex-col gap-2 p-3">
                                                <Link
                                                    to={productTo}
                                                    className="line-clamp-2 text-left text-xs font-bold leading-snug text-zinc-900 hover:underline"
                                                >
                                                    {product.name}
                                                </Link>
                                                <div>
                                                    {showWholesaleHint && (
                                                        <p className="mt-0.5 text-xs text-zinc-800">
                                                            {/*<br />*/}
                                                            {/*showWholesaleHint: {String(showWholesaleHint)}*/}
                                                            {/*<br />*/}
                                                            {/*isWholesaler: {String(isWholesaler)}*/}
                                                            Wholesale
                                                        </p>
                                                    )}
                                                    <p className="text-sm font-bold text-(--sf-accent)">
                                                        {formatAmount(priceInfo.price)}
                                                        <span className="ml-1 text-xs font-normal text-zinc-500">
                                                            Ex. Vat
                                                        </span>
                                                    </p>
                                                    {priceInfo.originalPrice != null &&
                                                        priceInfo.originalPrice > priceInfo.price && (
                                                            <p className="mt-0.5 text-xs text-zinc-500 line-through">
                                                                {formatAmount(priceInfo.originalPrice)}
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
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}