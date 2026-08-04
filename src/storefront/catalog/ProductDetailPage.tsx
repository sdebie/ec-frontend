import {useEffect, useMemo, useRef, useState} from 'react'
import {Link, useLocation, useParams} from 'react-router-dom'
import {ACCENT_BUTTON_HOVER, PageDivider, SF_FOCUS_RING_PAGE, Section, SectionHeading} from '@/storefront/sections/shared'
import {useProductDetail} from './hooks/useProductDetail'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {useCartStore} from '@/storefront/cart/store/cartStore'
import {formatAmount} from '@/shared/utils/formatAmount'
import {getDisplayPrice} from './utils/pricing'
import {parseAttributes} from './utils/variantAttributes'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import {ChevronDown} from 'lucide-react'
import {ImageGallery} from './components/ImageGallery'
import {VariantSelector} from './components/VariantSelector'
import {ProductDetailSkeleton} from './components/ProductDetailSkeleton'
import {WishlistButton} from '@/storefront/customer/account/wishlist/components/WishlistButton'

/**
 * Treats a blank string as absent. The import writes `short_description` as ''
 * rather than NULL for every live product, so `??` would hand back an empty
 * string and render an empty paragraph.
 */
function textOrNull(value: string | null | undefined): string | null {
    const trimmed = value?.trim()
    return trimmed ? trimmed : null
}

/** Add-to-cart geometry: fills the row beside the heart, shorter than before. */
const ACTION_BUTTON_BASE =
    'flex-1 rounded-lg px-6 py-2 text-sm font-medium text-center'

/**
 * Availability for the selected variant. Uses the semantic status tokens
 * (a documented law-2 exception — there is no `--sf-*` token for "in stock").
 * `null` stock is UNKNOWN, not out of stock: stock is import-derived and
 * checkout does not enforce it, so an unknown must never read as unavailable.
 */
function StockBadge({stockQuantity}: { stockQuantity: number | null | undefined }) {
    if (stockQuantity == null) return null

    const inStock = stockQuantity > 0
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                inStock
                    ? 'bg-(--sf-success)/10 text-(--sf-success)'
                    : 'bg-(--sf-error-surface) text-(--sf-error)'
            }`}
        >
            <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${inStock ? 'bg-(--sf-success)' : 'bg-(--sf-error)'}`}
            />
            {inStock ? 'In stock' : 'Out of stock'}
        </span>
    )
}

function ProductNotFound() {
    return (
        <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-(--sf-text) mb-2">Product not found</h2>
            <p className="text-(--sf-muted-text) mb-4">
                The product you&#39;re looking for doesn&#39;t exist or has been removed.
            </p>
            <Link to="/products" className="text-sm font-medium underline">
                Browse all products
            </Link>
        </div>
    )
}

export function ProductDetailPage() {
    const {slug} = useParams<{ slug: string }>()
    const location = useLocation()
    const {product, isLoading, isError} = useProductDetail(slug!)

    const customerType = useCustomerAuthStore((state) => state.customerType)
    const {currency, locale} = useStorefrontConfig()

    const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({})
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [descriptionOpen, setDescriptionOpen] = useState(true)
    const [brandLogoFailed, setBrandLogoFailed] = useState(false)
    const confirmationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        return () => {
            if (confirmationTimeoutRef.current) clearTimeout(confirmationTimeoutRef.current)
        }
    }, [])

    const selectedVariant = useMemo(() => {
        if (!product) return null
        return (
            product.variants.find((v) => {
                const attrs = parseAttributes(v.attributesJson)
                return Object.entries(selectedAttrs).every(([k, val]) => attrs[k] === val)
            }) ?? null
        )
    }, [product, selectedAttrs])

    const {price, originalPrice} = selectedVariant
        ? getDisplayPrice(selectedVariant, customerType)
        : {price: null, originalPrice: null}

    const isOutOfStock = selectedVariant?.stockQuantity === 0

    function handleAddToCart() {
        if (!selectedVariant || price == null) return

        const attrs = parseAttributes(selectedVariant.attributesJson)
        const variantLabel = Object.values(attrs).join(' / ')

        useCartStore.getState().addItem({
            variantId: selectedVariant.id,
            productName: product!.name,
            variantLabel,
            quantity: 1,
        })

        setShowConfirmation(true)
        if (confirmationTimeoutRef.current) clearTimeout(confirmationTimeoutRef.current)
        confirmationTimeoutRef.current = setTimeout(() => setShowConfirmation(false), 4000)
    }

    if (isLoading) return <ProductDetailSkeleton/>
    if (isError || !product) return <ProductNotFound/>

    // Every category the product belongs to; the breadcrumb still shows one.
    const categories = product.categories ?? []

    // The panel carries the summary when there is one, else the long text.
    const shortDescription = textOrNull(product.shortDescription)
    const longDescription = textOrNull(product.description)
    const panelDescription = shortDescription ?? longDescription

    // Not every brand has artwork (25 of 28 live brands do), so the name is the
    // fallback rather than the logo being required.
    const brandLogo = !brandLogoFailed ? resolveImageUrl(product.brand?.logoUrl ?? null) : null

    // Best-effort category from location state or product data
    const categoryName =
        (location.state as { categoryName?: string } | null)?.categoryName ??
        product.category?.name ??
        null

    return (
        <Section as="div" className="pt-6">
            {/* Page title with the accent rule every storefront page carries. */}
            <SectionHeading as="h1" title="Product Detail" className="mb-4"/>

            <PageDivider/>

            {/* Breadcrumb — desktop only. At 375px the trail wraps into a ragged
                three-line block, and the heading plus the panel already name the
                product; the header's back paths serve navigation on a phone. */}
            <nav aria-label="Breadcrumb" className="mb-4 hidden sm:block">
                <ol className="flex items-center gap-2 text-sm text-(--sf-muted-text)">
                    <li>
                        <Link to="/products" className="hover:text-(--sf-text)">
                            Products
                        </Link>
                    </li>
                    {categoryName && (
                        <>
                            <li aria-hidden="true">/</li>
                            <li className="text-(--sf-muted-text)">{categoryName}</li>
                        </>
                    )}
                    <li aria-hidden="true">/</li>
                    <li className="min-w-0 truncate font-medium text-(--sf-text)">{product.name}</li>
                </ol>
            </nav>

            {/* ONE container holding both columns, split by a vertical rule at
                md+ — two separate boxes left a dead gutter between the image and
                the information. Below md the rule becomes horizontal, so the
                same markup reflows without a second layout. */}
            <div className="overflow-hidden rounded-lg border border-(--sf-border) bg-(--sf-panel)">
                {/* The rule is its own grid CELL rather than a `divide-x` border,
                    so it can be inset from the container's edges — a border runs
                    the full height and cannot carry margins. */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr]">
                    <div className="p-5 lg:p-6">
                        <ImageGallery images={product.images} productName={product.name}/>
                    </div>

                    <div
                        aria-hidden="true"
                        className="mx-5 h-px bg-(--sf-border) md:mx-0 md:my-6 md:h-auto md:w-px"
                    />

                    {/* Right: purchase information */}
                    <div aria-labelledby="product-purchase-heading" className="space-y-5 p-5 lg:p-6">
                        {/* Header: name + availability on the left, price with the
                            brand beneath it on the right. Stacks below `sm` — beside
                            a price column the name was wrapping to four lines on a
                            phone. */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-4">
                            <div className="min-w-0 space-y-3">
                                <h2 id="product-purchase-heading" className="text-lg font-semibold text-(--sf-text)">
                                    {product.name}
                                </h2>
                                <StockBadge stockQuantity={selectedVariant?.stockQuantity}/>
                            </div>
                            <div className="flex shrink-0 items-baseline justify-between gap-3 sm:flex-col sm:items-end sm:justify-between">
                                <div className="flex items-baseline gap-2">
                                    {originalPrice != null && (
                                        <span className="text-sm text-(--sf-muted-text) line-through">
                                            {formatAmount(originalPrice, currency, locale)}
                                        </span>
                                    )}
                                    <span className="text-2xl font-bold text-(--sf-text)">
                                        {price != null ? formatAmount(price, currency, locale) : '\u2014'}
                                    </span>
                                </div>
                                {product.brand && (
                                    brandLogo ? (
                                        // Capped on BOTH axes: brand artwork varies wildly
                                        // in aspect, and an unconstrained logo would out-shout
                                        // the price beside it. The name rides in `alt`, so the
                                        // brand is still announced and still readable if the
                                        // file 404s.
                                        <img
                                            src={brandLogo}
                                            alt={product.brand.name}
                                            onError={() => setBrandLogoFailed(true)}
                                            className="h-7 max-h-7 w-auto max-w-24 object-contain object-right"
                                        />
                                    ) : (
                                        <span className="text-base font-semibold text-(--sf-text)">
                                            {product.brand.name}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Description, with the SKU tucked bottom-right of the same
                            block — it identifies the selected variant rather than
                            competing with the product's own copy. */}
                        {(panelDescription || selectedVariant?.sku) && (
                            <div className="border-t border-(--sf-border) pt-4">
                                {panelDescription ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setDescriptionOpen((v) => !v)}
                                            aria-expanded={descriptionOpen}
                                            aria-controls="product-description-body"
                                            className={`flex w-full items-center justify-between gap-2 rounded-sm text-left text-sm font-semibold text-(--sf-text) ${SF_FOCUS_RING_PAGE}`}
                                        >
                                            Description
                                            <ChevronDown
                                                aria-hidden="true"
                                                className={`h-4 w-4 shrink-0 text-(--sf-muted-text) transition-transform ${
                                                    descriptionOpen ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </button>
                                        {descriptionOpen && (
                                            <p
                                                id="product-description-body"
                                                className="mt-2 whitespace-pre-line text-sm leading-relaxed text-(--sf-muted-text)"
                                            >
                                                {panelDescription}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <h3 className="text-sm font-semibold text-(--sf-text)">Description</h3>
                                )}
                                {selectedVariant?.sku && (
                                    <p className="mt-3 text-right text-xs text-(--sf-muted-text)">
                                        SKU: <span className="font-medium text-(--sf-text)">{selectedVariant.sku}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="border-t border-(--sf-border) pt-4">
                            <VariantSelector
                                variants={product.variants}
                                selectedVariant={selectedVariant}
                                onSelectionChange={setSelectedAttrs}
                            />
                        </div>

                        {categories.length > 0 && (
                            <div className="border-t border-(--sf-border) pt-4">
                                <h3 className="text-sm font-semibold text-(--sf-text)">
                                    {categories.length > 1 ? 'Categories' : 'Category'}
                                </h3>
                                {/* Badges, not links.
                                    They label what this product IS; navigating away
                                    to a filtered catalogue mid-purchase is not what a
                                    shopper reading the panel wants. The hover
                                    treatment is kept — it is what makes the pills
                                    read as a set rather than as flat text. */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {categories.map((category) => (
                                        <span
                                            key={category.id}
                                            className="inline-flex items-center rounded-full border border-(--sf-border) px-3 py-1 text-sm font-medium text-(--sf-text) transition-colors hover:border-(--sf-accent) hover:bg-[color-mix(in_srgb,var(--sf-accent)_8%,var(--sf-panel))]"
                                        >
                                            {category.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 border-t border-(--sf-border) pt-4">
                            <div className="flex items-center gap-3">
                            {isOutOfStock ? (
                                <button
                                    type="button"
                                    disabled
                                    className={`${ACTION_BUTTON_BASE} bg-(--sf-surface-muted) text-(--sf-muted-text) cursor-not-allowed`}
                                >
                                    Out of stock
                                </button>
                            ) : showConfirmation ? (
                                <button
                                    type="button"
                                    disabled
                                    className={`${ACTION_BUTTON_BASE} bg-(--sf-surface-muted) text-(--sf-muted-text) cursor-not-allowed`}
                                >
                                    Added ✓
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={!selectedVariant}
                                    onClick={handleAddToCart}
                                    className={`${ACTION_BUTTON_BASE} transition-colors ${
                                        selectedVariant
                                            ? `bg-(--sf-accent) text-(--sf-accent-text) ${ACCENT_BUTTON_HOVER} ${SF_FOCUS_RING_PAGE} cursor-pointer`
                                            : 'bg-(--sf-surface-muted) text-(--sf-muted-text) cursor-not-allowed'
                                    }`}
                                >
                                    Add to Cart
                                </button>
                            )}

                            {selectedVariant && (
                                <WishlistButton
                                    variantId={selectedVariant.id}
                                    className="h-10 w-10 shrink-0"
                                />
                            )}
                            </div>

                            {showConfirmation && (
                                <p className="text-sm text-(--sf-success)">
                                    Added to cart!{' '}
                                    <Link to="/cart" className="underline font-medium">
                                        View cart
                                    </Link>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Long-form description. Only when a SHORT description was shown in
                the panel above — otherwise the panel already fell back to this
                text and repeating it would print the same copy twice. */}
            {shortDescription && longDescription && (
                <section aria-labelledby="product-description-heading" className="mt-10 border-t border-(--sf-border) pt-6">
                    <h2 id="product-description-heading" className="text-sm font-semibold text-(--sf-text)">
                        Description
                    </h2>
                    <div className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-(--sf-muted-text)">
                        {longDescription}
                    </div>
                </section>
            )}
        </Section>
    )
}
