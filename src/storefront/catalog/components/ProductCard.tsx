import {Link} from 'react-router-dom'
import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {formatAmount} from '@/shared/utils/formatAmount'
import {getDisplayPrice} from '../utils/pricing'
import {pickFeaturedImage} from '@/storefront/catalog'
import {WishlistButton, WishlistPromptLink} from '@/storefront/customer/account/wishlist/components/WishlistButton'
import {CardActions} from './CardActions'
import {SF_FOCUS_RING} from '@/storefront/sections/shared/focusRing'

/**
 * Card outline weight. 'thick' is for decks sitting on a saturated client colour
 * band, where the default hairline at 60% opacity disappears into the gradient.
 *
 * A real border, not an inset outline: an inset outline is painted beneath the
 * card's own children, so the full-bleed image stage covered it along the top
 * edge and that side read thinner than the other three. A border is drawn on
 * the box itself and is never occluded.
 *
 * It costs 1px of content width per side, which is safe only because the lines
 * that could reflow can't: the name is `line-clamp-2` and the SKU truncates. If
 * a future line is allowed to wrap, re-check that decks still align.
 *
 * Each branch is a COMPLETE literal class string — Tailwind scans source text,
 * so a composed `border-${n}` would emit no CSS.
 */
const CARD_BORDER_CLASS: Record<'default' | 'thick', string> = {
    default: 'border border-(--sf-border)/60',
    thick: 'border-2 border-(--sf-border)',
}

/**
 * Overlay placement for the card's heart; appearance belongs to the component.
 *
 * `z-10` puts it above the stretched product link (see STRETCHED_LINK) — without
 * it the link's full-card pseudo-element would swallow every heart click and
 * navigate instead of saving.
 */
const WISHLIST_OVERLAY_CLASS = 'absolute top-2 right-2 z-10'

/**
 * Turns the product-name link into the card's click target: an empty
 * pseudo-element stretched over the whole card.
 *
 * The card already advertised itself as clickable — accent border, shadow and
 * `hover:scale-[1.02]` on the root — while only the image and the name actually
 * navigated, so a click on the body, the price or the padding did nothing.
 *
 * Done with the EXISTING name link rather than a second overlay anchor: the card
 * gains no extra tab stop and no second accessible name, and the destination
 * stays defined in exactly one place. Anything the shopper must be able to click
 * on its own — the heart, quick view, the add controls — carries `z-10` to sit
 * above it.
 */
const STRETCHED_LINK = 'after:absolute after:inset-0 after:content-[""]'

/**
 * The row layout's image rail is a positioning context only from `sm`.
 *
 * That one switch is what moves the heart. The heart is a child of the rail, so
 * it resolves `top-2 right-2` against whichever ancestor is positioned: below
 * `sm` the rail is `static`, so the heart falls through to the card root and
 * lands in the CARD's top-right corner (where the wishlist's remove chip already
 * sits); from `sm` the rail is `relative` again and the heart returns to the
 * image, which is where it belongs once the rail is 160px wide.
 *
 * Chosen over positioning the heart on the card root with a breakpoint-specific
 * offset: that offset would have to be the rail's width minus the chip, i.e. a
 * second copy of `sm:w-40` that nothing keeps in sync. Here the rail's geometry
 * stays the single source of truth.
 *
 * The rail's `overflow-hidden` does not clip the escaped heart — an absolutely
 * positioned box is only clipped by ancestors in its containing-block chain, and
 * below `sm` the static rail is not in it.
 */
const ROW_IMAGE_RAIL_POSITION = 'static sm:relative'

/**
 * Right-hand padding on the block sitting under the card's top-right corner, so
 * text cannot run beneath the overlay chip (32px chip + 8px inset). Needed only
 * below `sm`, where the heart escapes onto the card; from `sm` the identity block
 * gets its normal padding back.
 *
 * COMPLETE literal class strings — Tailwind scans source text, so a composed
 * `sm:${…}` would emit no CSS.
 */
const OVERLAY_LANE = 'pr-10 sm:pr-4'

/** Picks the affordance the card's data can actually support. */
function WishlistSlot({variantId, productUrl}: { variantId: string | null; productUrl: string }) {
    return variantId ? (
        <WishlistButton variantId={variantId} className={WISHLIST_OVERLAY_CLASS}/>
    ) : (
        <WishlistPromptLink productUrl={productUrl} className={WISHLIST_OVERLAY_CLASS}/>
    )
}

interface PriceTier {
    price: number | null
}

interface TierLine {
    label: string
    price: number | null
    originalPrice: number | null
    /** True for the tier this shopper is actually charged. */
    isOwn: boolean
}

/**
 * Both price tiers, each named (owner directive 2026-08-03). Both are public on
 * every surface, so a shopper can see the wholesale rate without holding a
 * wholesale account, and a wholesale customer can see what retail pays.
 *
 * The shopper's OWN tier leads and carries the weight — it is what checkout will
 * charge, and the backend picks it from the signed JWT regardless of what the
 * card shows. Sale pricing strikes through on whichever line it belongs to.
 *
 * Selection only: every figure comes from getDisplayPrice, never arithmetic here.
 */
function TierPrices({lines, currency, locale}: { lines: TierLine[]; currency: string; locale: string }) {
    return (
        <div>
            {lines.map((line) => (
                <div
                    key={line.label}
                    // flex-wrap + nowrap on the suffix: a flex item can shrink
                    // below its content and break INSIDE, which split "ex. VAT"
                    // across two lines in a two-up mobile grid. The parts now stay
                    // whole and move to the next line together.
                    className={`flex flex-wrap items-baseline gap-x-1.5 ${line.isOwn ? '' : 'mt-0.5'}`}
                >
                    <span className="text-xs text-(--sf-muted-text)">{line.label}</span>
                    {line.originalPrice != null && (
                        <span className="text-xs line-through text-(--sf-muted-text)">
                            {formatAmount(line.originalPrice, currency, locale)}
                        </span>
                    )}
                    <span className={line.isOwn ? 'font-semibold' : 'text-xs text-(--sf-muted-text)'}>
                        {formatAmount(line.price, currency, locale)}
                    </span>
                    {line.isOwn && (
                        <span className="whitespace-nowrap text-xs text-(--sf-muted-text)">ex. VAT</span>
                    )}
                </div>
            ))}
        </div>
    )
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
     * Card outline weight. 'thick' suits a deck on a saturated colour band where
     * the default hairline vanishes. Default preserves every existing consumer.
     */
    borderWeight?: 'default' | 'thick'
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

export function ProductCard({product, variantId, variantLabel, badge, layout = 'grid', outOfStockAction, mobileImage = 'default', imageAspect = 'square', borderWeight = 'default', onRequestAdd, showWishlistButton = true, onQuickView, quickViewRef}: ProductCardProps) {
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
    // The shopper's own tier — still the single source for `hasPrice`, which
    // decides whether the card can transact at all.
    const {price} = getDisplayPrice(priceTiers, customerType)

    // Both tiers, own-first. A tier with no price at all is dropped rather than
    // rendered as a blank row.
    //
    // ⚠️ These two figures are IDENTICAL for the entire live catalogue (verified
    // 2026-08-03: 0 of 5,590 variants have a wholesale price differing from
    // retail), so both lines currently show the same number. That is a seed-data
    // gap, not a display bug — the card will show a real spread the moment
    // differentiated wholesale pricing is imported.
    const isWholesaleShopper = customerType === 'WHOLESALE'
    const retailTier = getDisplayPrice(priceTiers, 'RETAIL')
    const wholesaleTier = getDisplayPrice(priceTiers, 'WHOLESALE')
    const tierLines: TierLine[] = [
        isWholesaleShopper
            ? {label: 'Wholesale', ...wholesaleTier, isOwn: true}
            : {label: 'Retail', ...retailTier, isOwn: true},
        isWholesaleShopper
            ? {label: 'Retail', ...retailTier, isOwn: false}
            : {label: 'Wholesale', ...wholesaleTier, isOwn: false},
    ].filter((line) => line.price != null)

    if (layout === 'row') {
        return (
            /* A grid below sm, a flex row from sm up, so ONE set of nodes reflows.
               Mobile: [image][identity] with the price and actions spanning both
               columns as a bar underneath — otherwise they stack ragged-left,
               indented past the image rail. From sm the three children lay out as
               the row always has: image | identity | price column. */
            <div
                className={`group relative grid grid-cols-[auto_1fr] items-start rounded-lg ${CARD_BORDER_CLASS[borderWeight]} bg-(--sf-panel) overflow-hidden transition-all hover:shadow-md hover:border-(--sf-accent) sm:flex sm:flex-row sm:items-stretch md:hover:scale-[1.02]`}
                data-layout="row"
            >
                {/* Image — left; stays a compact square rail on mobile (a full-width
                    image would turn each "row" into a ~viewport-tall card) */}
                <div
                    className={`${ROW_IMAGE_RAIL_POSITION} ${mobileImage === 'thumbnail' ? 'w-20' : 'w-28'} sm:w-40 aspect-square shrink-0 self-start overflow-hidden bg-(--sf-surface-muted)`}>
                    <Link to={productUrl} className={`block h-full w-full ${SF_FOCUS_RING.page} rounded-sm`}>
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
                    {showWishlistButton && (
                        <WishlistSlot variantId={variantId ?? null} productUrl={productUrl}/>
                    )}
                    {onQuickView && (
                        <button
                            ref={quickViewRef}
                            type="button"
                            onClick={onQuickView}
                            className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 hidden md:inline-flex items-center justify-center rounded-md bg-(--sf-panel)/90 px-3 py-1.5 text-xs font-medium text-(--sf-text) shadow-sm backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                        >
                            Quick view
                        </button>
                    )}
                </div>

                {/* Identity — beside the image at every size. Below `sm` the heart
                    escapes the rail onto the card's top-right corner, which is over
                    this block, so it reserves the chip's lane there. */}
                <div className={`flex min-w-0 flex-col p-3 ${OVERLAY_LANE} sm:flex-1 sm:p-4`}>
                    <Link to={productUrl} className={`hover:underline ${STRETCHED_LINK} ${SF_FOCUS_RING.page} rounded-sm`}>
                        <h3 className="text-sm font-medium text-(--sf-text) line-clamp-2">
                            {product.name}
                        </h3>
                    </Link>

                    {product.sku && (
                        <p className="mt-1 truncate text-xs text-(--sf-muted-text)" title={product.sku}>
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
                        <TierPrices lines={tierLines} currency={currency} locale={locale}/>
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
            className={`group relative flex h-full flex-col rounded-lg ${CARD_BORDER_CLASS[borderWeight]} bg-(--sf-panel) overflow-hidden transition-all hover:shadow-md hover:border-(--sf-accent) md:hover:scale-[1.02]`}
            data-layout="grid"
        >
            <div className={`relative ${gridImageStageClass} overflow-hidden bg-(--sf-surface-muted)`}>
                <Link to={productUrl} className={`block h-full w-full ${SF_FOCUS_RING.page} rounded-sm`}>
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
                {showWishlistButton && (
                    <WishlistSlot variantId={variantId ?? null} productUrl={productUrl}/>
                )}
                {onQuickView && (
                    <button
                        ref={quickViewRef}
                        type="button"
                        onClick={onQuickView}
                        className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 hidden md:inline-flex items-center justify-center rounded-md bg-(--sf-panel)/90 px-3 py-1.5 text-xs font-medium text-(--sf-text) shadow-sm backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    >
                        Quick view
                    </button>
                )}
            </div>

            <div className="flex flex-1 flex-col p-3 sm:p-4">
                <Link to={productUrl} className={`hover:underline ${STRETCHED_LINK} ${SF_FOCUS_RING.page} rounded-sm`}>
                    {/* min-h reserves two lines so SKU/stock/price rows align across cards */}
                    <h3 className="min-h-10 text-sm font-medium text-(--sf-text) line-clamp-2">
                        {product.name}
                    </h3>
                </Link>

                {/* A variable product has no single SKU. Reserve the line anyway so
                    the stock/price/action rows below stay on the same baseline as a
                    simple product's — same rationale as the min-h name row above. */}
                {product.sku ? (
                    // truncate: a SKU that wraps to a second line makes this card
                    // taller than its neighbours, which desynchronises decks that
                    // are held to a common height. The full value stays in `title`.
                    <p className="mt-1 truncate text-xs text-(--sf-muted-text)" title={product.sku}>
                        SKU: {product.sku}
                    </p>
                ) : (
                    <p className="mt-1 text-xs text-(--sf-muted-text)" aria-hidden="true">
                        &nbsp;
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
                    <TierPrices lines={tierLines} currency={currency} locale={locale}/>
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
