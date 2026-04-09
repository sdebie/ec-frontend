import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {DefaultStorefrontLayout} from '@/components/layout/store/default'
import {HeroSection, Section} from '@/components/layout/store/default/sections'
import {useAddToCart} from '@/pages/shop/default/cart/hook/useAddToCart.ts'
import {fetchProductsList} from '@/services/graphql/product/product.service.ts'
import {useStorefrontTheme} from '@/components/layout/store/default/theme'
import {ProductListItem} from '@/types/admin/ProductTypes.ts'
import {Button, ProductCard} from '@/components'

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

    const trustedBrands = [
        'Dromex',
        'Duraglove',
        'Durawipe',
        'Everest Safety',
        'Golden Hands',
        'Pioneer',
        'Proflex',
        'Superweld',
    ]

    const trustHighlights = [
        {
            title: 'Fast Delivery',
            description: 'Reliable delivery nationwide with responsive order updates.',
        },
        {
            title: 'Straightforward Returns',
            description: 'Simple return support for damaged or incorrect orders.',
        },
        {
            title: 'Dedicated Procurement Support',
            description: 'Our team helps with sourcing, quotations, and repeat supply.',
        },
    ]

    const testimonials = [
        {
            quote:
                'UVH has become our first stop for PPE and safety consumables. Fast turnaround and dependable quality.',
            author: 'Operations Manager, Gauteng Manufacturing',
        },
        {
            quote:
                'Their team understands our site requirements and always helps us source the right products quickly.',
            author: 'Procurement Lead, Facilities Group',
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
            const product = featuredProducts.find(p => p.id === productId)
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
        <DefaultStorefrontLayout
            headerProps={{
                onCartClick: () => navigate('/cart'),
            }}
            contentClassName="py-0 px-0"
        >
            {/* Hero Section */}
            <HeroSection
                title={config.siteName || 'UVH Holdings'}
                subtitle="Your trusted partner for PPE, safety wear, medical, and cleaning supply solutions."
                backgroundImage="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80"
                ctaButton={{
                    label: 'Shop Products',
                    href: '/products',
                    onClick: () => navigate('/products'),
                }}
                ctaButtonSecondary={{
                    label: 'Get A Quote',
                    href: '#featured-categories',
                    onClick: () => navigate('/contact'),
                }}
            />

            {/* Featured Products Section */}
            <Section
                title="Featured / Best Sellers"
                subtitle="Popular products trusted by businesses across South Africa"
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
                    <>
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

                        <div className="mt-8 flex justify-center">
                            <Button
                                variant="secondary"
                                onClick={() => navigate('/products')}
                                style={{
                                    borderColor: 'var(--storefront-color-border)',
                                    color: 'var(--storefront-color-text-primary)',
                                    backgroundColor: 'var(--storefront-color-surface)',
                                }}
                            >
                                View Full Catalogue
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p style={{color: 'var(--storefront-color-text-secondary)'}}>
                            No products available
                        </p>
                    </div>
                )}
            </Section>

            <Section
                backgroundColor="background"
                paddingSize="large"
            >
                <div
                    className="rounded-lg p-8 md:p-12"
                    style={{
                        backgroundColor: 'var(--storefront-color-surface)',
                        border: '1px solid var(--storefront-color-border)',
                    }}
                >
                    <h2
                        className="text-2xl md:text-3xl font-bold mb-8 text-center"
                        style={{
                            color: 'var(--storefront-color-text-primary)',
                            fontFamily: 'var(--storefront-font-heading)',
                        }}
                    >
                        Brands We Work With
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {trustedBrands.map((brand) => (
                            <div
                                key={brand}
                                className="rounded-md px-4 py-3 text-center text-sm font-medium"
                                style={{
                                    border: '1px solid var(--storefront-color-border)',
                                    color: 'var(--storefront-color-text-primary)',
                                    backgroundColor: 'var(--storefront-color-background)',
                                }}
                            >
                                {brand}
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            <Section
                backgroundColor="custom"
                customBackgroundColor="var(--storefront-color-primary)"
                paddingSize="large"
            >
                <div className="text-center text-white max-w-3xl mx-auto">
                    <h2
                        className="text-3xl md:text-4xl font-bold mb-4"
                        style={{fontFamily: 'var(--storefront-font-heading)'}}
                    >
                        Buying in Bulk?
                    </h2>
                    <p className="text-lg mb-8 opacity-90">
                        Get volume pricing and sourcing support for your team, site, or facility.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button
                            variant="solid"
                            onClick={() => navigate('/contact')}
                            style={{
                                backgroundColor: '#ffffff',
                                color: 'var(--storefront-color-primary)',
                            }}
                        >
                            Request a Quote
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/products')}
                            style={{
                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                color: '#ffffff',
                            }}
                        >
                            Browse Products
                        </Button>
                    </div>
                </div>
            </Section>

            <Section
                title="Specials / Deals"
                subtitle="Limited promotions across selected categories"
                backgroundColor="background"
                paddingSize="large"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredProducts.slice(0, 3).map((product) => {
                        const specialPrice = product.retailSalesPrice ?? product.retailPrice ?? 0
                        const originalPrice = product.retailPrice ?? specialPrice
                        const discount = originalPrice > specialPrice
                            ? Math.round(((originalPrice - specialPrice) / originalPrice) * 100)
                            : 10

                        return (
                            <div
                                key={`deal-${product.id}`}
                                className="rounded-xl p-6"
                                style={{
                                    backgroundColor: 'var(--storefront-color-surface)',
                                    border: '1px solid var(--storefront-color-border)',
                                }}
                            >
                                <p
                                    className="text-xs font-semibold mb-3"
                                    style={{color: 'var(--storefront-color-accent)'}}
                                >
                                    SAVE {discount}%
                                </p>
                                <h3
                                    className="text-lg font-semibold mb-2 line-clamp-2"
                                    style={{
                                        color: 'var(--storefront-color-text-primary)',
                                        fontFamily: 'var(--storefront-font-heading)',
                                    }}
                                >
                                    {product.name}
                                </h3>
                                <p
                                    className="text-sm mb-4"
                                    style={{color: 'var(--storefront-color-text-secondary)'}}
                                >
                                    Best-value pricing while stock lasts.
                                </p>
                                <div className="flex items-center gap-2 mb-5">
                                    <span className="text-xl font-bold" style={{color: 'var(--storefront-color-primary)'}}>
                                        R {specialPrice.toFixed(2)}
                                    </span>
                                    {originalPrice > specialPrice && (
                                        <span className="text-sm line-through" style={{color: 'var(--storefront-color-text-muted)'}}>
                                            R {originalPrice.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                <Button
                                    variant="solid"
                                    fullWidth
                                    onClick={() => handleAddToCart(product.id)}
                                    style={{
                                        backgroundColor: 'var(--storefront-color-button-primary)',
                                        color: 'var(--storefront-color-button-primary-text)',
                                    }}
                                >
                                    Add Deal to Cart
                                </Button>
                            </div>
                        )
                    })}
                </div>
            </Section>

            <Section
                backgroundColor="surface"
                paddingSize="large"
            >
                <div
                    className="rounded-xl p-8 md:p-10 text-center"
                    style={{
                        backgroundColor: 'var(--storefront-color-background)',
                        border: '1px solid var(--storefront-color-border)',
                    }}
                >
                    <h2
                        className="text-3xl font-bold mb-3"
                        style={{
                            color: 'var(--storefront-color-text-primary)',
                            fontFamily: 'var(--storefront-font-heading)',
                        }}
                    >
                        Get a Quote
                    </h2>
                    <p
                        className="max-w-2xl mx-auto mb-6"
                        style={{color: 'var(--storefront-color-text-secondary)'}}
                    >
                        Tell us what you need and we will provide a tailored quote for your business requirements.
                    </p>
                    <Button
                        variant="solid"
                        onClick={() => navigate('/contact')}
                        style={{
                            backgroundColor: 'var(--storefront-color-button-primary)',
                            color: 'var(--storefront-color-button-primary-text)',
                        }}
                    >
                        Get A Quote
                    </Button>
                </div>
            </Section>

            <Section
                title="Categories"
                backgroundColor="surface"
                paddingSize="large"
            >
                <div>
                    TODO
                </div>
            </Section>

            <Section
                title="Trust & Reassurance"
                backgroundColor="surface"
                paddingSize="large"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {trustHighlights.map((item) => (
                        <div
                            key={item.title}
                            className="text-center rounded-xl p-6"
                            style={{
                                backgroundColor: 'var(--storefront-color-background)',
                                border: '1px solid var(--storefront-color-border)',
                            }}
                        >
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

            <Section
                title="What Our Customers Say"
                backgroundColor="surface"
                paddingSize="large"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {testimonials.map((testimonial) => (
                        <blockquote
                            key={testimonial.author}
                            className="rounded-xl p-6"
                            style={{
                                backgroundColor: 'var(--storefront-color-background)',
                                border: '1px solid var(--storefront-color-border)',
                            }}
                        >
                            <p
                                className="mb-4"
                                style={{color: 'var(--storefront-color-text-primary)'}}
                            >
                                "{testimonial.quote}"
                            </p>
                            <footer
                                className="text-sm font-semibold"
                                style={{color: 'var(--storefront-color-text-secondary)'}}
                            >
                                {testimonial.author}
                            </footer>
                        </blockquote>
                    ))}
                </div>
            </Section>

            <Section
                title="Accreditors"
                subtitle="Compliance-focused sourcing aligned with quality and safety expectations"
                backgroundColor="background"
                paddingSize="large"
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {['ISO', 'SABS', 'NRCS', 'OHSA', 'CIDB', 'B-BBEE'].map((accreditor) => (
                        <div
                            key={accreditor}
                            className="rounded-lg py-5 text-center text-sm font-semibold"
                            style={{
                                border: '1px dashed var(--storefront-color-border)',
                                color: 'var(--storefront-color-text-secondary)',
                                backgroundColor: 'var(--storefront-color-surface)',
                            }}
                        >
                            {accreditor}
                        </div>
                    ))}
                </div>
            </Section>
        </DefaultStorefrontLayout>
    )
}

export default HomePage






