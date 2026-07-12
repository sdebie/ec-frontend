import type {CategoryShowcaseSectionConfig} from '@/shared/types/StorefrontConfig'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import {useCategories} from '@/storefront/catalog/hooks/useCategories'
import {useProducts} from '@/storefront/catalog/hooks/useProducts'
import {ProductCard} from '@/storefront/catalog/components/ProductCard'

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
    const {title, categorySlug, themeColor, imageUrl, limit} = section.props

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

    // Validate themeColor and build gradient
    const validColor = resolveThemeColor(themeColor)
    const gradientStyle = {
        background: `linear-gradient(135deg, ${validColor}22 0%, ${validColor}08 100%)`,
    }

    const resolvedImageSrc = resolveImageUrl(imageUrl ?? null)

    return (
        <section style={gradientStyle}>
            <div className="max-w-7xl mx-auto px-4 py-10">
                {resolvedImageSrc && (
                    <img
                        src={resolvedImageSrc}
                        alt=""
                        aria-hidden="true"
                        className="mb-4 h-16 w-auto object-contain"
                    />
                )}

                <h2 className="text-2xl font-bold mb-6">{title}</h2>

                <div className="flex items-stretch gap-4 overflow-x-auto py-2">
                    {displayProducts.map((product) => (
                        <div key={product.id} className="w-56 shrink-0">
                            <ProductCard product={product}/>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
