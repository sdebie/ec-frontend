import {useEffect, useMemo, useRef, useState} from 'react'
import {Link, useLocation, useParams} from 'react-router-dom'
import {useProductDetail} from './hooks/useProductDetail'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {useCartStore} from '@/storefront/cart/cartStore'
import {formatAmount} from '@/shared/utils/formatAmount'
import {getDisplayPrice} from './utils/pricing'
import {parseAttributes} from './utils/imageUtils'
import {ImageGallery} from './components/ImageGallery'
import {VariantSelector} from './components/VariantSelector'
import {ProductDetailSkeleton} from './components/ProductDetailSkeleton'

function ProductNotFound() {
    return (
        <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-(--sf-text) mb-2">Product not found</h2>
            <p className="text-(--sf-muted-text) mb-4">
                The product you&#39;re looking for doesn&#39;t exist or has been removed.
            </p>
            <Link to="/products" className="text-sm font-medium underline">
                Browse all products
            </Link>
        </div>
    )
}

export function ProductDetailPage() {
    const {slug} = useParams<{ slug: string }>()
    const location = useLocation()
    const {product, isLoading, isError} = useProductDetail(slug!)

    const customerType = useCustomerAuthStore((state) => state.customerType)
    const {currency, locale} = useStorefrontConfig()

    const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({})
    const [showConfirmation, setShowConfirmation] = useState(false)
    const confirmationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        return () => {
            if (confirmationTimeoutRef.current) clearTimeout(confirmationTimeoutRef.current)
        }
    }, [])

    const selectedVariant = useMemo(() => {
        if (!product) return null
        return (
            product.variants.find((v) => {
                const attrs = parseAttributes(v.attributesJson)
                return Object.entries(selectedAttrs).every(([k, val]) => attrs[k] === val)
            }) ?? null
        )
    }, [product, selectedAttrs])

    const {price, originalPrice} = selectedVariant
        ? getDisplayPrice(selectedVariant, customerType)
        : {price: null, originalPrice: null}

    const isOutOfStock = selectedVariant?.stockQuantity === 0

    function handleAddToCart() {
        if (!selectedVariant || price == null) return

        const attrs = parseAttributes(selectedVariant.attributesJson)
        const variantLabel = Object.values(attrs).join(' / ')

        useCartStore.getState().addItem({
            variantId: selectedVariant.id,
            productName: product!.name,
            variantLabel,
            quantity: 1,
        })

        setShowConfirmation(true)
        if (confirmationTimeoutRef.current) clearTimeout(confirmationTimeoutRef.current)
        confirmationTimeoutRef.current = setTimeout(() => setShowConfirmation(false), 4000)
    }

    if (isLoading) return <ProductDetailSkeleton/>
    if (isError || !product) return <ProductNotFound/>

    // Best-effort category from location state or product data
    const categoryName =
        (location.state as { categoryName?: string } | null)?.categoryName ??
        product.category?.name ??
        null

    return (
        <div>
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6">
                <ol className="flex items-center gap-2 text-sm text-(--sf-muted-text)">
                    <li>
                        <Link to="/products" className="hover:text-(--sf-text)">
                            Products
                        </Link>
                    </li>
                    {categoryName && (
                        <>
                            <li aria-hidden="true">/</li>
                            <li className="text-(--sf-muted-text)">{categoryName}</li>
                        </>
                    )}
                    <li aria-hidden="true">/</li>
                    <li className="text-(--sf-text) font-medium">{product.name}</li>
                </ol>
            </nav>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Left: Image gallery */}
                <ImageGallery images={product.images} productName={product.name}/>

                {/* Right: Product info */}
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-(--sf-text)">{product.name}</h1>

                    {product.shortDescription && (
                        <p className="text-(--sf-muted-text)">{product.shortDescription}</p>
                    )}

                    <VariantSelector
                        variants={product.variants}
                        selectedVariant={selectedVariant}
                        onSelectionChange={setSelectedAttrs}
                    />

                    {/* Price display */}
                    <div className="flex items-baseline gap-3">
                        {originalPrice != null && (
                            <span className="line-through text-(--sf-muted-text) text-lg">
                {formatAmount(originalPrice, currency, locale)}
              </span>
                        )}
                        <span className="font-bold text-2xl">
              {price != null ? formatAmount(price, currency, locale) : '-'}
            </span>
                    </div>

                    {/* Add to Cart button */}
                    {isOutOfStock ? (
                        <button
                            type="button"
                            disabled
                            className="px-6 py-3 rounded-lg font-medium bg-(--sf-surface-muted) text-(--sf-muted-text) cursor-not-allowed"
                        >
                            Out of stock
                        </button>
                    ) : showConfirmation ? (
                        <button
                            type="button"
                            disabled
                            className="px-6 py-3 rounded-lg font-medium bg-(--sf-surface-muted) text-(--sf-muted-text) cursor-not-allowed"
                        >
                            Added ✓
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={!selectedVariant}
                            onClick={handleAddToCart}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                selectedVariant
                                    ? 'bg-(--sf-accent) text-(--sf-accent-text) hover:opacity-90 cursor-pointer'
                                    : 'bg-(--sf-surface-muted) text-(--sf-muted-text) cursor-not-allowed'
                            }`}
                        >
                            Add to Cart
                        </button>
                    )}

                    {showConfirmation && (
                        <p className="text-sm text-green-600">
                            Added to cart!{' '}
                            <Link to="/cart" className="underline font-medium">
                                View cart
                            </Link>
                        </p>
                    )}
                </div>
            </div>

            {/* Description accordion */}
            {product.description && (
                <details className="mt-10 border-t border-(--sf-border) pt-6">
                    <summary className="cursor-pointer text-lg font-medium text-(--sf-text) select-none">
                        Description
                    </summary>
                    <div className="mt-4 text-(--sf-muted-text) prose prose-sm max-w-none">
                        {product.description}
                    </div>
                </details>
            )}
        </div>
    )
}
