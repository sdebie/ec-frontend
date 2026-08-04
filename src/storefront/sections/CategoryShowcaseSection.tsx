import {useState, type CSSProperties, type ReactNode} from 'react'
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

/**
 * Resolves the band's background. Depends only on props, so it is available
 * before the data arrives — which is what lets the skeleton paint the same
 * band as the loaded state instead of a transparent one.
 *
 * Prefer the DB-provided full gradient (from section.props.gradient) when set,
 * so each row's multi-stop brand gradient is authored in the seed rather than
 * derived in code. Fall back to a themeColor-based gradient for backward
 * compatibility with clients that only supply a single hex.
 */
function resolveGradientStyle(gradient: string | undefined, themeColor: string): CSSProperties {
    if (gradient && gradient.trim().length > 0) {
        return {background: gradient}
    }
    const validColor = resolveThemeColor(themeColor)
    return {background: `linear-gradient(135deg, ${validColor}22 0%, ${validColor}08 100%)`}
}

/**
 * The band's frame — ONE definition, rendered by both the skeleton and the
 * loaded state so the two cannot drift.
 *
 * Gutter and container width are deliberately the shared `Section` frame's, and
 * the split across two elements is the load-bearing part: the gutter goes on the
 * OUTER element, the width on the INNER one. Put both on one element and the
 * content starts a full gutter further in than every section above it. The
 * gradient still runs full-bleed, but the heading and deck start on the same
 * left edge as the rest of the page — a band that keeps its own container reads
 * as misaligned no matter how good it looks alone. The width is read from
 * SECTION_WIDTH_CLASS rather than copied as a literal so a change to the shared
 * frame carries here automatically. Only the vertical rhythm stays tighter than
 * Section's py-12.
 *
 * Both branches render this rather than each writing its own container, so the
 * band cannot jump sideways when its products arrive.
 */
function ShowcaseBand({style, children}: { style: CSSProperties; children: ReactNode }) {
    return (
        <section className="px-6 sm:px-8" style={style}>
            <div className={`mx-auto ${SECTION_WIDTH_CLASS.default} py-6`}>
                {children}
            </div>
        </section>
    )
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

    // Prop-derived, so the skeleton below can paint the real band rather than a
    // transparent placeholder that pops into colour on load.
    const gradientStyle = resolveGradientStyle(gradient, themeColor)

    // Loading state: skeleton row — no spinner. Same frame as the loaded band,
    // so nothing shifts when the products arrive.
    if (categoriesLoading || (resolvedId && productsLoading)) {
        return (
            <ShowcaseBand style={gradientStyle}>
                <div className="animate-pulse flex gap-4 overflow-hidden">
                    {Array.from({length: 4}).map((_, i) => (
                        <div
                            key={i}
                            className="min-w-[200px] h-[280px] bg-(--sf-surface-muted) rounded-lg shrink-0"
                        />
                    ))}
                </div>
            </ShowcaseBand>
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

    const resolvedImageSrc = resolveImageUrl(imageUrl ?? null)
    const showImage = !!resolvedImageSrc && !imageFailed

    // The graphic is a door into the filtered catalogue — `?category=<slug>` is
    // the contract ProductListPage reads.
    const categoryHref = `/products?category=${encodeURIComponent(categorySlug)}`

    // One graphic at every breakpoint, sized against the heading beside it so it
    // reads as chrome. Anything larger becomes a side rail that eats a quarter of
    // the row and holds the deck to three cards.
    const categoryIcon = showImage ? (
        <Link
            to={categoryHref}
            aria-label={`Shop ${title}`}
            className={`shrink-0 rounded-sm transition-opacity hover:opacity-80 ${SF_FOCUS_RING_PAGE}`}
        >
            <img
                src={resolvedImageSrc}
                alt=""
                aria-hidden="true"
                onError={() => setImageFailed(true)}
                className="h-16 w-16 object-contain sm:h-20 sm:w-20"
            />
        </Link>
    ) : null

    // Heading + graphic as one block. In carousel layout this becomes the
    // Carousel's header node so the prev/next buttons share its row instead of
    // overlaying the product cards.
    const headingBlock = (
        <div className="flex items-center gap-3">
            {categoryIcon}
            <SectionHeading title={title} tone="onAccent" className="mb-0 min-w-0"/>
        </div>
    )

    return (
        <ShowcaseBand style={gradientStyle}>
            {layout === 'carousel' ? (
                <>
                    {/* Under the non-header hints the Carousel has no header row,
                        so the heading needs its own above the deck. */}
                    {hint !== 'header' && <div className="mb-2">{headingBlock}</div>}
                    <Carousel
                        ariaLabel={title}
                        perView={columns}
                        perViewMobile={2}
                        tone="onAccent"
                        // 'header' puts the heading in the Carousel's header slot so
                        // the prev/next buttons sit BESIDE it instead of overlaying
                        // the first and last product cards — and that row costs
                        // nothing, because the heading had to occupy a row anyway.
                        {...(hint === 'header'
                            ? {header: headingBlock}
                            : {arrowPlacement: hint})}
                        // Stated rather than inherited from `header`: the dotted
                        // mobile treatment is a deliberate choice for this band and
                        // must survive any later change to how the controls sit.
                        mobileControls="dots"
                    >
                        {displayProducts.map((product) => (
                            <ProductCard key={product.id} product={product} variantId={product.variantId}
                                         imageAspect="landscape" borderWeight="thick"/>
                        ))}
                    </Carousel>
                </>
            ) : (
                <>
                    <div className="mb-4">{headingBlock}</div>
                    <div className="flex items-stretch gap-4 overflow-x-auto py-2">
                        {displayProducts.map((product) => (
                            <div key={product.id} className="w-56 shrink-0">
                                <ProductCard product={product} variantId={product.variantId} imageAspect="landscape" borderWeight="thick"/>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </ShowcaseBand>
    )
}
