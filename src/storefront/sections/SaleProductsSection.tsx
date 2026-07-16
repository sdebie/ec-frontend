import {Link} from 'react-router-dom'
import {ProductCard} from '@/storefront/catalog/components/ProductCard'
import {useSaleShoppingProducts} from '@/storefront/sections/hooks/useSaleShoppingProducts'

interface SaleProductsSectionProps {
    title?: string
    limit?: number
    category?: string
}

interface SaleProductsSectionConfig {
    id: string
    type: 'sale-products'
    props: SaleProductsSectionProps
}

export function SaleProductsSection({section}: { section: SaleProductsSectionConfig }) {
    const {title = 'Specials', limit = 8} = section.props

    const {products, isLoading, isError} = useSaleShoppingProducts({limit})

    if (isLoading) {
        return (
            <section className="py-12 px-6">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-(--sf-text)">{title}</h2>
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
            </section>
        )
    }

    if (isError || products.length === 0) {
        return null
    }

    return (
        <section className="py-12 px-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-(--sf-text)">{title}</h2>
                <Link to="/specials" className="text-sm font-medium text-(--sf-accent) hover:opacity-80">
                    View all →
                </Link>
            </div>
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
