import {Link} from 'react-router-dom'
import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {formatAmount} from '@/shared/utils/formatAmount'
import {getDisplayPrice} from '../utils/pricing'
import {pickFeaturedImage} from '@/storefront/catalog'
import {WishlistButton} from '@/storefront/customer/account/wishlist/components/WishlistButton'
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
    /** Optional variant label rendered under the SKU line (e.g. "Size: XL, Colour: Red"). */
    variantLabel?: string
    /** Optional label rendered as an accent pill over the image (e.g. "Best Seller"). */
    badge?: string
    /** Layout mode: 'grid' (vertical card, default) or 'row' (horizontal row). */
    layout?: 'grid' | 'row'
    /** Out-of-stock action: 'disabled' shows a disabled button, 'viewProduct' renders a link to the PDP. */
    outOfStockAction?: 'disabled' | 'viewProduct'
    /**
     * Mobile image density hint. 'thumbnail' applies a compact image stage below
     * the `sm` breakpoint (pure CSS — same asset, no server resizing). At sm+ both
     * values render identically to 'default'.
     */
    mobileImage?: 'default' | 'thumbnail'
    /**
     * Image stage aspect ratio for the `grid` layout at sm and above. 'landscape'
     * (4:3) yields a shorter card than the default 'square' — useful where cards
     * sit beside other page furniture. Pure CSS; the `row` layout is unaffected.
     */
    imageAspect?: 'square' | 'landscape'
    /**
     * Delegates the add action to the consumer (see CardActions.onRequestAdd).
     * Absent: the card adds to the cart itself, as the catalogue does.
     */
    onRequestAdd?: (quantity: number) => void
    /**
     * Renders the built-in wishlist heart over the image. Default true.
     * Set false where the page provides its own remove affordance (the wishlist
     * does) so the item has exactly ONE remove control, not two.
     */
    showWishlistButton?: boolean
    /** Called when the Quick view button is clicked. If not provided, the Quick view button is not rendered. */
    onQuickView?: () => void
    /** Ref forwarded to the Quick view trigger button for focus restore. */
    quickViewRef?: React.Ref<HTMLButtonElement>
}

export function ProductCard({product, variantId, variantLabel, badge, layout = 'grid', outOfStockAction, mobileImage = 'default', imageAspect = 'square', onRequestAdd, showWishlistButton = true, onQuickView, quickViewRef}: ProductCardProps) {
    const {currency, locale} = useStorefrontConfig()
    const customerType = useCustomerAuthStore((state) => state.customerType)

    const productUrl = `/products/${product.slug}`
    const imageUrl = pickFeaturedImage(product.images)

    // Grid image stage: mobileImage governs the sub-`sm` height, imageAspect the
    // sm+ ratio. Every branch is a COMPLETE literal class string — Tailwind scans
    // source text, so an interpolated `sm:${...}` would never emit its CSS.
    // The two `square` branches reproduce the original markup byte-for-byte.
    const gridImageStageClass =
        mobileImage === 'thumbnail'
            ? imageAspect === 'landscape'
                ? 'h-28 w-full sm:aspect-[4/3] sm:h-auto'
                : 'h-28 w-full sm:aspect-square sm:h-auto'
            : imageAspect === 'landscape'
                ? 'aspect-[4/3] w-full'
                : 'aspect-square w-full'
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
            /* A grid below sm, a flex row from sm up, so ONE set of nodes reflows.
               Mobile: [image][identity] with the price and actions spanning both
               columns as a bar underneath — otherwise they stack ragged-left,
               indented past the image rail. From sm the three children lay out as
               the row always has: image | identity | price column. */
            <div
                className="group grid grid-cols-[auto_1fr] items-start rounded-lg border border-(--sf-border)/60 bg-(--sf-panel) overflow-hidden transition-all hover:shadow-md hover:border-(--sf-accent) sm:flex sm:flex-row sm:items-stretch md:hover:scale-[1.02]"
                data-layout="row"
            >
                {/* Image — left; stays a compact square rail on mobile (a full-width
                    image would turn each "row" into a ~viewport-tall card) */}
                <div
                    className={`relative ${mobileImage === 'thumbnail' ? 'w-20' : 'w-28'} sm:w-40 aspect-square shrink-0 self-start overflow-hidden bg-(--sf-surface-muted)`}>
                    <Link to={productUrl} className="block h-full w-full">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={product.name}
                                loading="lazy"
                                className="h-full w-full object-contain p-2 sm:p-3 transition-transform group-hover:scale-105"
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
                    {/* Quick-view hover treatment: a semi-transparent dark wash over the
                        image (documented overlay exception) so the revealed button and
                        card stand out. Only where quick view exists, only md+ where it
                        shows, and before the overlays below so they stack above it. */}
                    {onQuickView && (
                        <div
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 hidden md:block bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                        />
                    )}
                    {badge && (
                        <span
                            className="absolute left-2 top-2 rounded-full bg-(--sf-accent) px-2.5 py-1 text-xs font-semibold text-(--sf-accent-text) shadow-sm">
                            {badge}
                        </span>
                    )}
                    {variantId && showWishlistButton && (
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
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:inline-flex items-center justify-center rounded-md bg-(--sf-panel)/90 px-3 py-1.5 text-xs font-medium text-(--sf-text) shadow-sm backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                        >
                            Quick view
                        </button>
                    )}
                </div>

                {/* Identity — beside the image at every size */}
                <div className="flex min-w-0 flex-col p-3 sm:flex-1 sm:p-4">
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

                    {variantLabel && (
                        <p className="mt-1 text-xs text-(--sf-muted-text)">
                            {variantLabel}
                        </p>
                    )}

                    {product.inStock === true && (
                        <p className="mt-1 text-xs font-medium text-(--sf-success)">
                            In stock
                        </p>
                    )}
                    {product.inStock === false && (
                        <p className="mt-1 text-xs text-(--sf-muted-text)">
                            Out of stock
                        </p>
                    )}

                    {product.shortDescription && (
                        <p className="mt-2 text-xs text-(--sf-muted-text) line-clamp-2 sm:line-clamp-3" data-testid="short-description">
                            {product.shortDescription}
                        </p>
                    )}
                </div>

                {/* Price + actions. Mobile: a full-width bar under the image and
                    identity, divided from it — price and stepper share the first
                    line, and the full-width button wraps onto its own line
                    beneath them (CardActions `bar` mode hands its controls to
                    this flex container below sm). From sm: the right-hand column
                    the row has always had. */}
                <div
                    className="col-span-2 flex flex-wrap items-end justify-between gap-3 border-t border-(--sf-border)/60 p-3 sm:col-span-1 sm:w-48 sm:shrink-0 sm:flex-col sm:flex-nowrap sm:items-stretch sm:justify-center sm:border-t-0 sm:border-l sm:border-(--sf-border) sm:p-4">
                    <div className="min-w-0">
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
                    </div>

                    <CardActions
                        variantId={variantId ?? null}
                        productName={product.name}
                        productSlug={product.slug}
                        inStock={product.inStock ?? null}
                        hasPrice={price != null}
                        outOfStockAction={outOfStockAction}
                        variantLabel={variantLabel}
                        onRequestAdd={onRequestAdd}
                        layout="bar"
                    />
                </div>
            </div>
        )
    }

    return (
        <div
            className="group flex h-full flex-col rounded-lg border border-(--sf-border)/60 bg-(--sf-panel) overflow-hidden transition-all hover:shadow-md hover:border-(--sf-accent) md:hover:scale-[1.02]"
            data-layout="grid"
        >
            <div className={`relative ${gridImageStageClass} overflow-hidden bg-(--sf-surface-muted)`}>
                <Link to={productUrl} className="block h-full w-full">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-contain p-2 sm:p-4 transition-transform group-hover:scale-105"
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
                {/* Quick-view hover treatment — see the row-layout comment above */}
                {onQuickView && (
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 hidden md:block bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                    />
                )}
                {badge && (
                    <span
                        className="absolute left-2 top-2 rounded-full bg-(--sf-accent) px-2.5 py-1 text-xs font-semibold text-(--sf-accent-text) shadow-sm">
                        {badge}
                    </span>
                )}
                {variantId && showWishlistButton && (
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
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:inline-flex items-center justify-center rounded-md bg-(--sf-panel)/90 px-3 py-1.5 text-xs font-medium text-(--sf-text) shadow-sm backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    >
                        Quick view
                    </button>
                )}
            </div>

            <div className="flex flex-1 flex-col p-3 sm:p-4">
                <Link to={productUrl} className="hover:underline">
                    {/* min-h reserves two lines so SKU/stock/price rows align across cards */}
                    <h3 className="min-h-10 text-sm font-medium text-(--sf-text) line-clamp-2">
                        {product.name}
                    </h3>
                </Link>

                {product.sku && (
                    <p className="mt-1 text-xs text-(--sf-muted-text)">
                        SKU: {product.sku}
                    </p>
                )}

                {variantLabel && (
                    <p className="mt-1 text-xs text-(--sf-muted-text)">
                        {variantLabel}
                    </p>
                )}

                {product.inStock === true && (
                    <p className="mt-1 text-xs font-medium text-(--sf-success)">
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
                        outOfStockAction={outOfStockAction}
                        variantLabel={variantLabel}
                        onRequestAdd={onRequestAdd}
                    />
                </div>
            </div>
        </div>
    )
}
