import {useState} from 'react'
import {Link} from 'react-router-dom'
import type {CategoryShowcaseSectionConfig} from '@/shared/types/StorefrontConfig'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import {useCategories} from '@/storefront/catalog/hooks/useCategories'
import {useProducts} from '@/storefront/catalog/hooks/useProducts'
import {ProductCard} from '@/storefront/catalog/components/ProductCard'
import {Carousel, SectionHeading, SECTION_WIDTH_CLASS, SF_FOCUS_RING_PAGE} from './shared'

/** Default fallback colour when themeColor validation fails */
const DEFAULT_THEME_COLOR = '#6b7280'

/**
 * Validates and normalises a 6-character hex colour string.
 * Returns the colour with a leading `#` if valid, or the default fallback.
 */
function resolveThemeColor(raw: string): string {
    const stripped = raw.startsWith('#') ? raw.slice(1) : raw
    if (/^[0-9a-fA-F]{6}$/.test(stripped)) {
        return `#${stripped}`
    }
    return DEFAULT_THEME_COLOR
}

export function CategoryShowcaseSection({section}: { section: CategoryShowcaseSectionConfig }) {
    const {title, categorySlug, themeColor, layout = 'row', columns, gradient, imageUrl, limit, carouselControls} = section.props

    // Resolve the carousel hint — unknown values fall back to the default ('overlay')
    const hint = (carouselControls === 'header' || carouselControls === 'gutter' || carouselControls === 'overlay')
        ? carouselControls
        : 'overlay'

    // A seeded imageUrl can point at a file that was never uploaded (the
    // hospitality retarget shipped ahead of its artwork). Degrade text-first
    // rather than leaving a broken graphic + a 404 on every page load.
    // Declared before the early returns below — Rules of Hooks.
    const [imageFailed, setImageFailed] = useState(false)

    // Step 1: resolve slug → category ID
    const {categories, isLoading: categoriesLoading} = useCategories()
    const resolvedCategory = categories.find((c) => c.slug === categorySlug)
    const resolvedId = resolvedCategory?.id ?? null

    // Step 2: fetch products for this category
    const {products, isLoading: productsLoading} = useProducts({
        categoryId: resolvedId ?? undefined,
        enabled: !!resolvedId,
    })

    // Slice products to the configured limit
    const effectiveLimit = limit ?? 8
    const displayProducts = products.slice(0, effectiveLimit)

    // Loading state: skeleton row — no spinner
    if (categoriesLoading || (resolvedId && productsLoading)) {
        return (
            <section className="py-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="animate-pulse flex gap-4 overflow-hidden">
                        {Array.from({length: 4}).map((_, i) => (
                            <div
                                key={i}
                                className="min-w-[200px] h-[280px] bg-(--sf-surface-muted) rounded-lg shrink-0"
                            />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    // Categories loaded but slug didn't match
    if (!categoriesLoading && !resolvedCategory) {
        return null
    }

    // Products loaded but result is empty
    if (displayProducts.length === 0) {
        return null
    }

    // Prefer the DB-provided full gradient (from section.props.gradient) when set,
    // so each row's multi-stop brand gradient is authored in the seed rather than
    // derived in code. Fall back to a themeColor-based gradient for backward
    // compatibility with clients that only supply a single hex.
    const validColor = resolveThemeColor(themeColor)
    const gradientStyle = {
        background: gradient && gradient.trim().length > 0
            ? gradient
            : `linear-gradient(135deg, ${validColor}22 0%, ${validColor}08 100%)`,
    }

    const resolvedImageSrc = resolveImageUrl(imageUrl ?? null)
    const showImage = !!resolvedImageSrc && !imageFailed

    // Below `md` the graphic rides inline with the heading as a small icon (the
    // `w-64` side rail is `hidden md:flex`, so it never crushes the deck on a
    // phone) — icon first, then the title.
    // Both the mobile icon and the desktop rail are doors into the filtered
    // catalogue — `?category=<slug>` is the contract ProductListPage reads.
    const categoryHref = `/products?category=${encodeURIComponent(categorySlug)}`

    const mobileIcon = showImage ? (
        <Link
            to={categoryHref}
            aria-label={`Shop ${title}`}
            className={`shrink-0 rounded-sm md:hidden ${SF_FOCUS_RING_PAGE}`}
        >
            <img
                src={resolvedImageSrc}
                alt=""
                aria-hidden="true"
                onError={() => setImageFailed(true)}
                className="h-20 w-20 object-contain"
            />
        </Link>
    ) : null

    return (
        // Gutter + container width are deliberately the shared `Section` frame's
        // (`px-6 sm:px-8` around the exported default width), NOT this band's
        // own. The gradient still runs full-bleed, but the heading and deck start
        // on the same left edge as every other home section — a band that keeps
        // its own container reads as misaligned no matter how good it looks
        // alone. The width comes from SECTION_WIDTH_CLASS rather than a copied
        // literal so a change to the shared frame carries here automatically.
        // Only the vertical rhythm stays tighter than Section's py-12.
        <section className="px-6 sm:px-8" style={gradientStyle}>
            <div className={`mx-auto ${SECTION_WIDTH_CLASS.default} py-6`}>
                {/* The heading spans the full band width above the image + deck row, so
                    it shares a left margin with the desktop icon rail below it rather
                    than starting inset by the rail's width. It renders here for every
                    carousel hint — under 'header' the Carousel keeps only its arrow
                    row, so the title is never duplicated. `tone="onAccent"` is what
                    puts the title and rule in accent-text: the band is a
                    client-authored dark gradient, so --sf-accent would sink into it. */}
                {/* The icon sits BESIDE the SectionHeading rather than inside it, so
                    the rule tracks the heading text on mobile instead of starting
                    under the logo. At md+ the icon is hidden and the block collapses
                    to a left-aligned heading + rule. */}
                <div className="mb-2 flex items-center gap-3">
                    {mobileIcon}
                    <SectionHeading title={title} tone="onAccent" className="mb-0 min-w-0"/>
                </div>

                {/* No bottom margin: this row is the container's last child, so a
                    margin here would stack on top of the container's own bottom
                    padding and read as dead space under the deck. */}
                <div className="flex items-stretch gap-8">
                    {showImage && (
                        <div className="hidden md:flex w-64 shrink-0 items-center justify-center">
                            <Link
                                to={categoryHref}
                                aria-label={`Shop ${title}`}
                                className={`block w-full rounded-md transition-opacity hover:opacity-80 ${SF_FOCUS_RING_PAGE}`}
                            >
                                <img
                                    src={resolvedImageSrc}
                                    alt=""
                                    aria-hidden="true"
                                    onError={() => setImageFailed(true)}
                                    className="max-h-80 w-full object-contain"
                                />
                            </Link>
                        </div>
                    )}
                    {layout === 'carousel' ? (
                        <div className="min-w-0 flex-1 py-2">
                            <Carousel
                                ariaLabel={title}
                                perView={columns}
                                perViewMobile={2}
                                tone="onAccent"
                                // This band always renders its own heading above the
                                // deck, so a header ROW would only ever hold arrows —
                                // 68px of chrome for two buttons. At the non-header
                                // hints the arrows ride the deck edges instead and that
                                // row disappears. Mobile keeps the dotted treatment
                                // either way: it is the quieter read on a colour band,
                                // and it is no longer tied to having a header row.
                                mobileControls="dots"
                                {...(hint === 'header'
                                    ? {header: <span className="sr-only">{title}</span>}
                                    : {arrowPlacement: hint})}
                            >
                                {displayProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} variantId={product.variantId}
                                                 imageAspect="landscape" borderWeight="thick"/>
                                ))}
                            </Carousel>
                        </div>
                    ) : (
                        <div className="flex min-w-0 flex-1 items-stretch gap-4 overflow-x-auto py-2">
                            {displayProducts.map((product) => (
                                <div key={product.id} className="w-56 shrink-0">
                                    <ProductCard product={product} variantId={product.variantId} imageAspect="landscape" borderWeight="thick"/>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
