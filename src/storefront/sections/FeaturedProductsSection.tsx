import type {FeaturedProductsSectionConfig} from '@/shared/types/StorefrontConfig'
import {ProductCard} from '@/storefront/catalog/components/ProductCard'
import {useFeaturedShoppingProducts} from '@/storefront/hooks/useFeaturedShoppingProducts'

export function FeaturedProductsSection({section}: { section: FeaturedProductsSectionConfig }) {
    const {title, category, limit} = section.props

    const effectiveLimit = limit ?? 8

    const {products, isLoading, isError, refetch} = useFeaturedShoppingProducts({
        limit: effectiveLimit,
        categorySlug: category,
    })

    if (isLoading) {
        return (
            <section className="py-12 px-6">
                <h2 className="text-2xl font-bold mb-6 text-(--sf-text)">{title}</h2>
                <div className="flex items-stretch gap-4 overflow-x-auto py-2">
                    {Array.from({length: effectiveLimit}).map((_, i) => (
                        <div key={i} className="w-56 shrink-0 animate-pulse">
                            <div className="bg-(--sf-surface-muted) aspect-square rounded-lg"/>
                            <div className="mt-3 h-4 bg-(--sf-surface-muted) rounded w-3/4"/>
                            <div className="mt-2 h-4 bg-(--sf-surface-muted) rounded w-1/3"/>
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    if (isError) {
        return (
            <section className="py-12 px-6">
                <h2 className="text-2xl font-bold mb-6 text-(--sf-text)">{title}</h2>
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
            </section>
        )
    }

    if (products.length === 0) {
        return null
    }

    return (
        <section className="py-12 px-6">
            <h2 className="text-2xl font-bold mb-6 text-(--sf-text)">{title}</h2>
            <div className="flex items-stretch gap-4 overflow-x-auto py-2">
                {products.map((product) => (
                    <div key={product.id} className="w-56 shrink-0">
                        <ProductCard product={product}/>
                    </div>
                ))}
            </div>
        </section>
    )
}
