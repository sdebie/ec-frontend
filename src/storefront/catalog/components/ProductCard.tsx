import {Link} from 'react-router-dom'
import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {formatAmount} from '@/shared/utils/formatAmount'
import {getDisplayPrice} from '../utils/pricing'
import {pickFeaturedImage} from '../utils/productImage'
import {WishlistButton} from '@/storefront/customer/account/wishlist/WishlistButton'
import {CardActions} from './CardActions'

interface PriceTier {
    price: number | null
}

interface ProductCardProps {
    product: {
        id: string
        name: string
        slug: string
        images: Array<{
            imageUrl: string
            featured: boolean
            sortOrder: number
        }>
        retailPrice: PriceTier | null
        wholesalePrice: PriceTier | null
        retailSalePrice: PriceTier | null
        wholesaleSalePrice: PriceTier | null
        sku?: string | null
        inStock?: boolean | null
        shortDescription?: string
    }
    variantId?: string | null
    /** Optional label rendered as an accent pill over the image (e.g. "Best Seller"). */
    badge?: string
    /** Layout mode: 'grid' (vertical card, default) or 'row' (horizontal row). */
    layout?: 'grid' | 'row'
    /** Called when the Quick view button is clicked. If not provided, the Quick view button is not rendered. */
    onQuickView?: () => void
    /** Ref forwarded to the Quick view trigger button for focus restore. */
    quickViewRef?: React.Ref<HTMLButtonElement>
}

export function ProductCard({product, variantId, badge, layout = 'grid', onQuickView, quickViewRef}: ProductCardProps) {
    const {currency, locale} = useStorefrontConfig()
    const customerType = useCustomerAuthStore((state) => state.customerType)

    const productUrl = `/products/${product.slug}`
    const imageUrl = pickFeaturedImage(product.images)
    const priceTiers = {
        retailPrice: product.retailPrice?.price ?? null,
        wholesalePrice: product.wholesalePrice?.price ?? null,
        retailSalePrice: product.retailSalePrice?.price ?? null,
        wholesaleSalePrice: product.wholesaleSalePrice?.price ?? null,
    }
    const {price, originalPrice} = getDisplayPrice(priceTiers, customerType)

    // Secondary wholesale line for non-wholesale shoppers — the effective
    // wholesale price comes from the same selector (the client never calculates).
    const wholesaleDisplay =
        customerType !== 'WHOLESALE' ? getDisplayPrice(priceTiers, 'WHOLESALE').price : null

    if (layout === 'row') {
        return (
            <div
                className="group flex flex-col sm:flex-row rounded-lg border border-(--sf-border) bg-(--sf-panel) overflow-hidden transition-shadow hover:shadow-md"
                data-layout="row"
            >
                {/* Image — left */}
                <div
                    className="relative w-full sm:w-40 aspect-square sm:aspect-square shrink-0 overflow-hidden bg-(--sf-surface-muted)">
                    <Link to={productUrl} className="block h-full w-full">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={product.name}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                        ) : (
                            <div
                                className="flex h-full w-full items-center justify-center bg-(--sf-surface-muted) text-(--sf-muted-text)">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                                    />
                                </svg>
                            </div>
                        )}
                    </Link>
                    {badge && (
                        <span
                            className="absolute left-2 top-2 rounded-full bg-(--sf-accent) px-2.5 py-1 text-xs font-semibold text-(--sf-accent-text) shadow-sm">
                            {badge}
                        </span>
                    )}
                    {variantId && (
                        <WishlistButton
                            variantId={variantId}
                            className="absolute top-2 right-2 rounded-full bg-(--sf-panel)/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-(--sf-panel) cursor-pointer"
                        />
                    )}
                    {onQuickView && (
                        <button
                            ref={quickViewRef}
                            type="button"
                            onClick={onQuickView}
                            className="absolute bottom-2 left-1/2 -translate-x-1/2 hidden md:inline-flex items-center justify-center rounded-md bg-(--sf-panel)/90 px-3 py-1.5 text-xs font-medium text-(--sf-text) shadow-sm backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                        >
                            Quick view
                        </button>
                    )}
                </div>

                {/* Identity — centre */}
                <div className="flex flex-1 flex-col p-4">
                    <Link to={productUrl} className="hover:underline">
                        <h3 className="text-sm font-medium text-(--sf-text) line-clamp-2">
                            {product.name}
                        </h3>
                    </Link>

                    {product.sku && (
                        <p className="mt-1 text-xs text-(--sf-muted-text)">
                            SKU: {product.sku}
                        </p>
                    )}

                    {product.inStock === true && (
                        <p className="mt-1 text-xs font-medium text-green-600">
                            In stock
                        </p>
                    )}
                    {product.inStock === false && (
                        <p className="mt-1 text-xs text-(--sf-muted-text)">
                            Out of stock
                        </p>
                    )}

                    {product.shortDescription && (
                        <p className="mt-2 text-xs text-(--sf-muted-text) line-clamp-3" data-testid="short-description">
                            {product.shortDescription}
                        </p>
                    )}
                </div>

                {/* Price + actions — right */}
                <div className="flex shrink-0 flex-col justify-center p-4 sm:w-48 sm:border-l sm:border-(--sf-border)">
                    <div className="flex items-baseline gap-2">
                        {originalPrice != null && (
                            <span className="line-through text-(--sf-muted-text)">
                                {formatAmount(originalPrice, currency, locale)}
                            </span>
                        )}
                        <span className="font-semibold">
                            {formatAmount(price, currency, locale)}
                        </span>
                        {price != null && (
                            <span className="text-xs text-(--sf-muted-text)">ex. VAT</span>
                        )}
                    </div>
                    {wholesaleDisplay != null && (
                        <p className="mt-0.5 text-xs text-(--sf-muted-text)">
                            Wholesale: {formatAmount(wholesaleDisplay, currency, locale)} ex. VAT
                        </p>
                    )}
                    <CardActions
                        variantId={variantId ?? null}
                        productName={product.name}
                        productSlug={product.slug}
                        inStock={product.inStock ?? null}
                        hasPrice={price != null}
                    />
                </div>
            </div>
        )
    }

    return (
        <div
            className="group flex h-full flex-col rounded-lg border border-(--sf-border) bg-(--sf-panel) overflow-hidden transition-shadow hover:shadow-md"
            data-layout="grid"
        >
            <div className="relative aspect-square w-full overflow-hidden bg-(--sf-surface-muted)">
                <Link to={productUrl} className="block h-full w-full">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                    ) : (
                        <div
                            className="flex h-full w-full items-center justify-center bg-(--sf-surface-muted) text-(--sf-muted-text)">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                                />
                            </svg>
                        </div>
                    )}
                </Link>
                {badge && (
                    <span
                        className="absolute left-2 top-2 rounded-full bg-(--sf-accent) px-2.5 py-1 text-xs font-semibold text-(--sf-accent-text) shadow-sm">
                        {badge}
                    </span>
                )}
                {variantId && (
                    <WishlistButton
                        variantId={variantId}
                        className="absolute top-2 right-2 rounded-full bg-(--sf-panel)/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-(--sf-panel) cursor-pointer"
                    />
                )}
                {onQuickView && (
                    <button
                        ref={quickViewRef}
                        type="button"
                        onClick={onQuickView}
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 hidden md:inline-flex items-center justify-center rounded-md bg-(--sf-panel)/90 px-3 py-1.5 text-xs font-medium text-(--sf-text) shadow-sm backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    >
                        Quick view
                    </button>
                )}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <Link to={productUrl} className="hover:underline">
                    <h3 className="text-sm font-medium text-(--sf-text) line-clamp-2">
                        {product.name}
                    </h3>
                </Link>

                {product.sku && (
                    <p className="mt-1 text-xs text-(--sf-muted-text)">
                        SKU: {product.sku}
                    </p>
                )}

                {product.inStock === true && (
                    <p className="mt-1 text-xs font-medium text-green-600">
                        In stock
                    </p>
                )}
                {product.inStock === false && (
                    <p className="mt-1 text-xs text-(--sf-muted-text)">
                        Out of stock
                    </p>
                )}

                <div className="mt-auto pt-2">
                    <div className="flex items-baseline gap-2">
                        {originalPrice != null && (
                            <span className="line-through text-(--sf-muted-text)">
                                {formatAmount(originalPrice, currency, locale)}
                            </span>
                        )}
                        <span className="font-semibold">
                            {formatAmount(price, currency, locale)}
                        </span>
                        {price != null && (
                            <span className="text-xs text-(--sf-muted-text)">ex. VAT</span>
                        )}
                    </div>
                    {wholesaleDisplay != null && (
                        <p className="mt-0.5 text-xs text-(--sf-muted-text)">
                            Wholesale: {formatAmount(wholesaleDisplay, currency, locale)} ex. VAT
                        </p>
                    )}
                    <CardActions
                        variantId={variantId ?? null}
                        productName={product.name}
                        productSlug={product.slug}
                        inStock={product.inStock ?? null}
                        hasPrice={price != null}
                    />
                </div>
            </div>
        </div>
    )
}
