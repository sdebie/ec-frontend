import {Link} from 'react-router-dom'
import type {SaleProductsSectionConfig} from '@/shared/types/StorefrontConfig'
import {ProductCard} from '@/storefront/catalog/components/ProductCard'
import {useSaleShoppingProducts} from '@/storefront/sections/hooks/useSaleShoppingProducts'
import {Section, SectionHeading} from './shared'

export function SaleProductsSection({section}: { section: SaleProductsSectionConfig }) {
    const {title = 'Specials', eyebrow, limit = 8} = section.props

    const {products, isLoading, isError} = useSaleShoppingProducts({limit})

    if (isLoading) {
        return (
            <Section>
                <SectionHeading title={title} eyebrow={eyebrow} />
                <div className="mb-4 flex justify-end">
                    <Link to="/specials" className="text-sm font-medium text-(--sf-accent) hover:opacity-80">
                        View all →
                    </Link>
                </div>
                <div className="flex items-stretch gap-4 overflow-x-auto py-2">
                    {Array.from({length: limit}).map((_, i) => (
                        <div key={i} className="w-56 shrink-0 animate-pulse">
                            <div className="bg-(--sf-surface-muted) aspect-square rounded-lg"/>
                            <div className="mt-3 h-4 bg-(--sf-surface-muted) rounded w-3/4"/>
                            <div className="mt-2 h-4 bg-(--sf-surface-muted) rounded w-1/3"/>
                        </div>
                    ))}
                </div>
            </Section>
        )
    }

    if (isError || products.length === 0) {
        return null
    }

    return (
        <Section>
            <SectionHeading title={title} eyebrow={eyebrow} />
            <div className="mb-4 flex justify-end">
                <Link to="/specials" className="text-sm font-medium text-(--sf-accent) hover:opacity-80">
                    View all →
                </Link>
            </div>
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
