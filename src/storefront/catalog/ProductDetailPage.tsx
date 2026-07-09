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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
            <p className="text-gray-500 mb-4">
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
                <ol className="flex items-center gap-2 text-sm text-gray-500">
                    <li>
                        <Link to="/products" className="hover:text-gray-700">
                            Products
                        </Link>
                    </li>
                    {categoryName && (
                        <>
                            <li aria-hidden="true">/</li>
                            <li className="text-gray-400">{categoryName}</li>
                        </>
                    )}
                    <li aria-hidden="true">/</li>
                    <li className="text-gray-900 font-medium">{product.name}</li>
                </ol>
            </nav>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Left: Image gallery */}
                <ImageGallery images={product.images} productName={product.name}/>

                {/* Right: Product info */}
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

                    {product.shortDescription && (
                        <p className="text-gray-600">{product.shortDescription}</p>
                    )}

                    <VariantSelector
                        variants={product.variants}
                        selectedVariant={selectedVariant}
                        onSelectionChange={setSelectedAttrs}
                    />

                    {/* Price display */}
                    <div className="flex items-baseline gap-3">
                        {originalPrice != null && (
                            <span className="line-through text-gray-400 text-lg">
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
                            className="px-6 py-3 rounded-lg font-medium text-white bg-gray-300 cursor-not-allowed"
                        >
                            Out of stock
                        </button>
                    ) : showConfirmation ? (
                        <button
                            type="button"
                            disabled
                            className="px-6 py-3 rounded-lg font-medium text-white bg-gray-300 cursor-not-allowed"
                        >
                            Added ✓
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={!selectedVariant}
                            onClick={handleAddToCart}
                            className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                                selectedVariant
                                    ? 'bg-gray-900 hover:bg-gray-800 cursor-pointer'
                                    : 'bg-gray-300 cursor-not-allowed'
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
                <details className="mt-10 border-t border-gray-200 pt-6">
                    <summary className="cursor-pointer text-lg font-medium text-gray-900 select-none">
                        Description
                    </summary>
                    <div className="mt-4 text-gray-600 prose prose-sm max-w-none">
                        {product.description}
                    </div>
                </details>
            )}
        </div>
    )
}
