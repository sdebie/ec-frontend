import React, {useEffect, useState} from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {StorefrontLayout} from '@/components/layout/store/default'
import {Section} from '@/components/layout/store/default/sections'

import {useAddToCart} from '@/pages/shop/cart/hook/useAddToCart'
import { fetchProductsList } from '@/services/graphql/product/product.service'
import {ProductListItem} from "@/types/admin/ProductTypes.ts";
import {ProductCard} from "@/components";

interface ShopPageProps {
    activeCategory?: string
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular'

/**
 * ShopPage
 * Product listing page with filtering and sorting
 * Displays all products with grid layout
 */
const ShopPage: React.FC<ShopPageProps> = ({activeCategory = 'All'}) => {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const {createOrder} = useAddToCart()

    const [items, setItems] = useState<ProductListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [sortBy, setSortBy] = useState<SortOption>('newest')
    const [filteredItems, setFilteredItems] = useState<ProductListItem[]>([])

    // Get category from URL params or prop
    const categoryParam = searchParams.get('category') || activeCategory

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true)
                setError(null)
                const list = await fetchProductsList(categoryParam)
                setItems(list)
            } catch (e: any) {
                console.error('Failed to load products:', e)
                setError(e?.message || 'Failed to load products')
            } finally {
                setLoading(false)
            }
        }

        loadProducts()
    }, [categoryParam])

    // Sort products
    useEffect(() => {
        let sorted = [...items]

        switch (sortBy) {
            case 'price-low':
                sorted.sort((a, b) => (a.retailSalesPrice ?? a.retailPrice ?? 0) - (b.retailSalesPrice ?? b.retailPrice ?? 0))
                break
            case 'price-high':
                sorted.sort((a, b) => (b.retailSalesPrice ?? b.retailPrice ?? 0) - (a.retailSalesPrice ?? a.retailPrice ?? 0))
                break
            case 'popular':
                // If no salesCount exists, maintain order
                sorted.sort((a, b) => (a.id ?? '').localeCompare(b.id ?? ''))
                break
            case 'newest':
            default:
                // Assume items are already in newest order
                break
        }

        setFilteredItems(sorted)
    }, [items, sortBy])

    const handleAddToCart = async (productId: string) => {
        try {
            const product = items.find(p => p.id === productId)
            if (!product) return

            const price = product.retailSalesPrice ?? product.retailPrice ?? 0
            await createOrder({
                items: [
                    {
                        quantity: 1,
                        unitPrice: price,
                        variant: productId,
                    },
                ],
            })
            navigate('/cart')
        } catch (error) {
            console.error('Failed to add to cart:', error)
        }
    }

    return (
        <StorefrontLayout
            headerProps={{
                onCartClick: () => navigate('/cart'),
            }}
            contentClassName="py-12 px-4"
        >
            <Section
                title="Our Products"
                subtitle={
                    categoryParam && categoryParam !== 'All'
                        ? `Showing products in ${categoryParam}`
                        : 'Browse our full collection'
                }
                backgroundColor="surface"
                paddingSize="medium"
            >
                {/* Controls Bar */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div style={{color: 'var(--storefront-color-text-secondary)'}} className="text-sm">
                        {loading ? 'Loading...' : `${filteredItems.length} products`}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2">
                        <label
                            style={{color: 'var(--storefront-color-text-secondary)'}}
                            className="text-sm font-medium"
                        >
                            Sort by:
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                            style={{
                                backgroundColor: 'var(--storefront-color-surface)',
                                color: 'var(--storefront-color-text-primary)',
                                borderColor: 'var(--storefront-color-border)',
                            }}
                        >
                            <option value="newest">Newest</option>
                            <option value="popular">Most Popular</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <p style={{color: 'var(--storefront-color-text-secondary)'}}>
                            Loading products...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div
                        className="p-4 rounded-lg text-center"
                        style={{
                            backgroundColor: 'var(--storefront-color-error, #fee2e2)',
                            color: 'var(--storefront-color-error, #dc2626)',
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Products Grid */}
                {!loading && !error && filteredItems.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((product) => {
                            const mainImage = product.productImages?.[0]
                            return (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    price={product.retailSalesPrice ?? product.retailPrice ?? 0}
                                    image={mainImage?.imageUrl}
                                    onAddToCart={() => handleAddToCart(product.id)}
                                />
                            )
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <p
                            className="text-lg"
                            style={{
                                color: 'var(--storefront-color-text-secondary)',
                            }}
                        >
                            No products found
                        </p>
                        <button
                            onClick={() => navigate('/products')}
                            className="mt-4 px-6 py-2 rounded-lg font-semibold transition-all"
                            style={{
                                backgroundColor: 'var(--storefront-color-button-primary)',
                                color: 'var(--storefront-color-button-primary-text)',
                            }}
                        >
                            View All Products
                        </button>
                    </div>
                )}
            </Section>
        </StorefrontLayout>
    )
}

export default ShopPage






