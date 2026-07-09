import {Link} from 'react-router-dom'
import {useQuery} from '@tanstack/react-query'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'
import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {formatAmount} from '@/shared/utils/formatAmount'
import {cn} from '@/shared/utils/cn'
import type {FeaturedProductsSectionConfig} from '@/shared/types/StorefrontConfig'

interface FeaturedProduct {
    id: string
    name: string
    slug: string
    shortDescription?: string
    retailPrice: number
    primaryImageUrl?: string
}

export function FeaturedProductsSection({section}: { section: FeaturedProductsSectionConfig }) {
    const {title, category, limit} = section.props
    const {currency, locale} = useStorefrontConfig()

    const effectiveLimit = limit ?? 6

    const {data: products = [], isLoading, isError, refetch} = useQuery({
        queryKey: ['featured-products', effectiveLimit, category],
        queryFn: async () => {
            const params = new URLSearchParams({limit: String(effectiveLimit)})
            if (category) params.set('category', category)
            const response = await storefrontHttpClient.get<FeaturedProduct[]>(
                `/storefront/products/featured?${params}`,
            )
            return response.data
        },
    })

    if (isLoading) {
        return (
            <section className="py-12 px-6">
                <h2 className="text-2xl font-bold mb-6">{title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({length: effectiveLimit}).map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 aspect-square rounded"/>
                            <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"/>
                            <div className="mt-1 h-3 bg-gray-200 rounded w-full"/>
                            <div className="mt-1 h-3 bg-gray-200 rounded w-1/2"/>
                            <div className="mt-2 h-4 bg-gray-200 rounded w-1/4"/>
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    if (isError) {
        return (
            <section className="py-12 px-6">
                <h2 className="text-2xl font-bold mb-6">{title}</h2>
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
        return (
            <section className="py-12 px-6">
                <h2 className="text-2xl font-bold mb-6">{title}</h2>
                <p className="text-gray-500 text-center py-8">No featured products at this time.</p>
            </section>
        )
    }

    return (
        <section className="py-12 px-6">
            <h2 className="text-2xl font-bold mb-6">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <article key={product.id} className="group">
                        {product.primaryImageUrl && (
                            <img
                                src={product.primaryImageUrl}
                                alt={product.name}
                                loading="lazy"
                                className="w-full aspect-square object-cover rounded"
                            />
                        )}
                        <h3 className="mt-2 font-semibold text-sm">{product.name}</h3>
                        {product.shortDescription && (
                            <p className={cn('text-xs text-gray-500 line-clamp-2')}>
                                {product.shortDescription}
                            </p>
                        )}
                        <p className="mt-1 font-medium">
                            {formatAmount(product.retailPrice, currency, locale)}
                        </p>
                        <Link
                            to={`/products/${product.slug}`}
                            className="mt-2 inline-block text-sm underline"
                        >
                            View details
                        </Link>
                    </article>
                ))}
            </div>
        </section>
    )
}
