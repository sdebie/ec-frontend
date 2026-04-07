import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {StorefrontLayout} from '@/components/layout/store/default'
import {HeroSection, Section} from '@/components/layout/store/default/sections'
import {useAddToCart} from '@/pages/shop/cart/hook/useAddToCart'
import {fetchProductsList} from '@/services/graphql/product/product.service'
import {useStorefrontTheme} from '@/components/layout/store/default/theme'
import {ProductListItem} from "@/types/admin/ProductTypes.ts";
import {CategoryCard, ProductCard} from "@/components";

interface HomePageProps {
    activeCategory?: string
}

/**
 * HomePage
 * Home page for storefront
 * Displays a hero section, featured categories, featured products, and CTAs
 */
const HomePage: React.FC<HomePageProps> = ({activeCategory = 'All'}) => {
    const navigate = useNavigate()
    const {createOrder} = useAddToCart()
    const {config} = useStorefrontTheme()
    const [featuredProducts, setFeaturedProducts] = useState<ProductListItem[]>([])
    const [loading, setLoading] = useState(true)

    // Sample categories for a featured section
    const featuredCategories = [
        {
            name: 'Electronics',
            description: 'Latest gadgets and tech',
            icon: '📱',
            href: '/products?category=Electronics',
        },
        {
            name: 'Fashion',
            description: 'Trendy clothing and accessories',
            icon: '👔',
            href: '/products?category=Fashion',
        },
        {
            name: 'Home & Garden',
            description: 'Furnishings and decor',
            icon: '🏠',
            href: '/products?category=Home',
        },
        {
            name: 'Sports',
            description: 'Athletic gear and equipment',
            icon: '⚽',
            href: '/products?category=Sports',
        },
    ]

    useEffect(() => {
        const loadFeaturedProducts = async () => {
            try {
                setLoading(true)
                const products = await fetchProductsList(activeCategory)
                setFeaturedProducts(products.slice(0, 6))
            } catch (error) {
                console.error('Failed to load featured products:', error)
            } finally {
                setLoading(false)
            }
        }

        loadFeaturedProducts()
    }, [activeCategory])

    const handleAddToCart = async (productId: string) => {
        try {
            // Use the correct format for createOrder
            const product = featuredProducts.find(p => p.id === productId)
            if (!product) return

            const price = product.retailSalesPrice ?? product.retailPrice ?? 0
            await createOrder({
                items: [
                    {
                        quantity: 1,
                        unitPrice: price,
                        variant: productId, // Use product ID as variant identifier
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
            contentClassName="py-0 px-0"
        >
            {/* Hero Section */}
            <HeroSection
                title={`Welcome to ${config.siteName}`}
                subtitle="Discover amazing products at unbeatable prices"
                backgroundImage="https://images.unsplash.com/photo-1483389127117-b6a2102724ae?w=1200&q=80"
                ctaButton={{
                    label: 'Shop Now',
                    href: '/products',
                    onClick: () => navigate('/products'),
                }}
                ctaButtonSecondary={{
                    label: 'Learn More',
                    href: '#featured-categories',
                }}
            />

            {/* Featured Categories Section */}
            <Section
                title="Shop by Category"
                subtitle="Explore our most popular collections"
                backgroundColor="background"
                paddingSize="large"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredCategories.map((category) => (
                        <CategoryCard
                            key={category.name}
                            name={category.name}
                            description={category.description}
                            icon={category.icon}
                            href={category.href}
                            onClick={() => navigate(category.href)}
                        />
                    ))}
                </div>
            </Section>

            {/* Featured Products Section */}
            <Section
                title="Featured Products"
                subtitle="Check out our best-selling items"
                backgroundColor="surface"
                paddingSize="large"
            >
                {loading ? (
                    <div className="text-center py-12">
                        <p style={{color: 'var(--storefront-color-text-secondary)'}}>
                            Loading products...
                        </p>
                    </div>
                ) : featuredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredProducts.map((product) => {
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
                ) : (
                    <div className="text-center py-12">
                        <p style={{color: 'var(--storefront-color-text-secondary)'}}>
                            No products available
                        </p>
                    </div>
                )}
            </Section>

            {/* Promotional Banner Section */}
            <Section
                backgroundColor="custom"
                customBackgroundColor="var(--storefront-color-primary)"
                paddingSize="large"
            >
                <div className="text-center text-white">
                    <h2
                        className="text-3xl md:text-4xl font-bold mb-4"
                        style={{fontFamily: 'var(--storefront-font-heading)'}}
                    >
                        Limited Time Offer
                    </h2>
                    <p className="text-lg mb-6 opacity-90">
                        Get 20% off your first purchase with code: WELCOME20
                    </p>
                    <button
                        onClick={() => navigate('/products')}
                        className="px-8 py-3 rounded-lg font-semibold transition-all hover:shadow-lg"
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            border: '2px solid rgba(255, 255, 255, 0.5)',
                            color: 'white',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
                        }}
                    >
                        Start Shopping
                    </button>
                </div>
            </Section>

            {/* Trust Section */}
            <Section
                title="Why Shop With Us"
                backgroundColor="surface"
                paddingSize="large"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: '🚚',
                            title: 'Free Shipping',
                            description: 'On orders over R500',
                        },
                        {
                            icon: '🔒',
                            title: 'Secure Checkout',
                            description: 'Your data is always protected',
                        },
                        {
                            icon: '↩️',
                            title: 'Easy Returns',
                            description: '30-day return guarantee',
                        },
                    ].map((item) => (
                        <div key={item.title} className="text-center">
                            <div className="text-4xl mb-4">{item.icon}</div>
                            <h3
                                className="text-lg font-semibold mb-2"
                                style={{
                                    color: 'var(--storefront-color-text-primary)',
                                    fontFamily: 'var(--storefront-font-heading)',
                                }}
                            >
                                {item.title}
                            </h3>
                            <p
                                className="text-sm"
                                style={{
                                    color: 'var(--storefront-color-text-secondary)',
                                }}
                            >
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Newsletter CTA Section */}
            <Section
                backgroundColor="background"
                paddingSize="large"
            >
                <div
                    className="rounded-lg p-8 md:p-12 text-center"
                    style={{
                        backgroundColor: 'var(--storefront-color-surface)',
                        border: '1px solid var(--storefront-color-border)',
                    }}
                >
                    <h2
                        className="text-2xl md:text-3xl font-bold mb-4"
                        style={{
                            color: 'var(--storefront-color-text-primary)',
                            fontFamily: 'var(--storefront-font-heading)',
                        }}
                    >
                        Stay Updated
                    </h2>
                    <p
                        className="mb-6 text-lg"
                        style={{
                            color: 'var(--storefront-color-text-secondary)',
                        }}
                    >
                        Subscribe to our newsletter for exclusive deals and new arrivals
                    </p>
                    <form
                        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                        onSubmit={(e) => {
                            e.preventDefault()
                            // Handle newsletter subscription
                        }}
                    >
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                            style={{
                                backgroundColor: 'var(--storefront-color-background)',
                                color: 'var(--storefront-color-text-primary)',
                                border: '1px solid var(--storefront-color-border)',
                            }}
                        />
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg font-semibold transition-all hover:shadow-md"
                            style={{
                                backgroundColor: 'var(--storefront-color-button-primary)',
                                color: 'var(--storefront-color-button-primary-text)',
                            }}
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </Section>
        </StorefrontLayout>
    )
}

export default HomePage






