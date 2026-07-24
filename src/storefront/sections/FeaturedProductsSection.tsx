import type {FeaturedProductsSectionConfig} from '@/shared/types/StorefrontConfig'
import {ProductCard} from '@/storefront/catalog/components/ProductCard'
import {useFeaturedShoppingProducts} from '@/storefront/hooks/useFeaturedShoppingProducts'
import {Section, SectionHeading} from './shared'

export function FeaturedProductsSection({section}: { section: FeaturedProductsSectionConfig }) {
    const {title, eyebrow, variant, category, limit} = section.props

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
                    <p className="text-red-600 mb-4">Failed to load featured products.</p>
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
            <SectionHeading title={title} eyebrow={eyebrow} />
            <div className="flex items-stretch gap-4 overflow-x-auto py-2">
                {products.map((product) => (
                    <div key={product.id} className="w-56 shrink-0">
                        <ProductCard product={product} variantId={product.variantId}/>
                    </div>
                ))}
            </div>
        </Section>
    )
}
