import type {FeaturedProductsSectionConfig} from '@/shared/types/StorefrontConfig'
import {ProductCard} from '@/storefront/catalog/components/ProductCard'
import {useFeaturedShoppingProducts} from '@/storefront/hooks/useFeaturedShoppingProducts'
import {Carousel, Section, SectionHeading} from './shared'

export function FeaturedProductsSection({section}: { section: FeaturedProductsSectionConfig }) {
    const {title, eyebrow, variant, layout = 'row', columns, badgeLabel, category, limit} = section.props

    const effectiveLimit = limit ?? 8

    const {products, isLoading, isError, refetch} = useFeaturedShoppingProducts({
        limit: effectiveLimit,
        categorySlug: category,
    })

    if (isLoading) {
        return (
            <Section variant={variant}>
                <SectionHeading title={title} eyebrow={eyebrow} />
                <div className="flex items-stretch gap-4 overflow-x-auto py-2">
                    {Array.from({length: effectiveLimit}).map((_, i) => (
                        <div key={i} className="w-56 shrink-0 animate-pulse">
                            <div className="bg-(--sf-surface-muted) in-data-[variant=dark]:bg-white/10 aspect-square rounded-lg"/>
                            <div className="mt-3 h-4 bg-(--sf-surface-muted) in-data-[variant=dark]:bg-white/10 rounded w-3/4"/>
                            <div className="mt-2 h-4 bg-(--sf-surface-muted) in-data-[variant=dark]:bg-white/10 rounded w-1/3"/>
                        </div>
                    ))}
                </div>
            </Section>
        )
    }

    if (isError) {
        return (
            <Section variant={variant}>
                <SectionHeading title={title} eyebrow={eyebrow} />
                <div className="text-center py-8">
                    <p className="text-(--sf-error) mb-4">Failed to load featured products.</p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="text-sm font-medium underline"
                    >
                        Try again
                    </button>
                </div>
            </Section>
        )
    }

    if (products.length === 0) {
        return null
    }

    return (
        <Section variant={variant}>
            {layout === 'carousel' ? (
                // Header-controls mode: prev/next sit beside the heading (md+),
                // mobile paginates via dots + swipe — no floating arrows over cards.
                <Carousel
                    ariaLabel={title}
                    perView={columns}
                    header={<SectionHeading title={title} eyebrow={eyebrow} className="mb-0"/>}
                >
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} variantId={product.variantId} badge={badgeLabel}/>
                    ))}
                </Carousel>
            ) : (
                <>
                    <SectionHeading title={title} eyebrow={eyebrow}/>
                    <div className="flex items-stretch gap-4 overflow-x-auto py-2">
                        {products.map((product) => (
                            <div key={product.id} className="w-56 shrink-0">
                                <ProductCard product={product} variantId={product.variantId} badge={badgeLabel}/>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </Section>
    )
}
