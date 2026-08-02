import {useState} from 'react'
import type {CategoryShowcaseSectionConfig} from '@/shared/types/StorefrontConfig'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import {useCategories} from '@/storefront/catalog/hooks/useCategories'
import {useProducts} from '@/storefront/catalog/hooks/useProducts'
import {ProductCard} from '@/storefront/catalog/components/ProductCard'
import {Carousel} from './shared'

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
    const mobileIcon = showImage ? (
        <img
            src={resolvedImageSrc}
            alt=""
            aria-hidden="true"
            onError={() => setImageFailed(true)}
            className="h-8 w-8 shrink-0 object-contain md:hidden"
        />
    ) : null

    return (
        <section style={gradientStyle}>
            <div className="max-w-7xl mx-auto px-4 py-10">
                {/* The heading spans the full band width above the image + deck row, so
                    it shares a left margin with the desktop icon rail below it rather
                    than starting inset by the rail's width. It renders here for every
                    carousel hint — under 'header' the Carousel keeps only its arrow
                    row, so the title is never duplicated. Colour is the accent-text
                    token because the band is a client-authored dark gradient. */}
                <h2 className="text-2xl font-bold mb-4 text-(--sf-accent-text) drop-shadow-md flex items-center gap-2">
                    {mobileIcon}
                    {title}
                </h2>

                <div className="mb-4 flex items-stretch gap-8">
                    {showImage && (
                        <div className="hidden md:flex w-64 shrink-0 items-center justify-center">
                            <img
                                src={resolvedImageSrc}
                                alt=""
                                aria-hidden="true"
                                onError={() => setImageFailed(true)}
                                className="max-h-112 w-full object-contain"
                            />
                        </div>
                    )}
                    {layout === 'carousel' ? (
                        <div className="min-w-0 flex-1 py-2">
                            <Carousel
                                ariaLabel={title}
                                perView={columns}
                                {...(hint === 'header'
                                    ? {header: <span className="sr-only">{title}</span>}
                                    : {arrowPlacement: hint})}
                            >
                                {displayProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} variantId={product.variantId}/>
                                ))}
                            </Carousel>
                        </div>
                    ) : (
                        <div className="flex min-w-0 flex-1 items-stretch gap-4 overflow-x-auto py-2">
                            {displayProducts.map((product) => (
                                <div key={product.id} className="w-56 shrink-0">
                                    <ProductCard product={product} variantId={product.variantId}/>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
