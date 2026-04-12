import {Link} from 'react-router-dom'

interface ProductCardProps {
    id: string
    name: string
    price: number
    originalPrice?: number
    image?: string
    rating?: number
    reviewCount?: number
    badge?: string
    onAddToCart?: () => void
}

/**
 * ProductCard
 * Card component for displaying products in grid layouts
 * Shows price, rating, and add-to-cart functionality
 * Fully theme-aware styling
 */
export function ProductCard({
                                id,
                                name,
                                price,
                                originalPrice,
                                image,
                                rating,
                                reviewCount,
                                badge,
                                onAddToCart,
                            }: ProductCardProps) {

    const formatCurrency = (value: number) => {
        return `R ${value.toFixed(2)}`
    }

    const discountPercentage = originalPrice
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0

    return (
        <div
            className="rounded-lg overflow-hidden transition-all hover:shadow-lg group"
            style={{
                backgroundColor: 'var(--storefront-color-surface)',
                border: '1px solid var(--storefront-color-border)',
            }}
        >
            {/* Image Container */}
            <Link
                to={`/product/${id}`}
                className="relative block h-48 bg-gray-100 overflow-hidden"
            >
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{backgroundColor: 'var(--storefront-color-background)'}}
                    >
                        <svg
                            className="w-12 h-12"
                            style={{color: 'var(--storefront-color-border)'}}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                )}

                {/* Badge */}
                {badge && (
                    <div
                        className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{
                            backgroundColor: 'var(--storefront-color-accent)',
                        }}
                    >
                        {badge}
                    </div>
                )}

                {/* Discount Badge */}
                {discountPercentage > 0 && (
                    <div
                        className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold text-white"
                        style={{
                            backgroundColor: 'var(--storefront-color-error, #ef4444)',
                        }}
                    >
                        -{discountPercentage}%
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <Link
                    to={`/product/${id}`}
                    className="block mb-2 hover:opacity-75 transition-opacity"
                >
                    <h3
                        className="font-semibold line-clamp-2"
                        style={{
                            color: 'var(--storefront-color-text-primary)',
                            fontFamily: 'var(--storefront-font-heading)',
                        }}
                    >
                        {name}
                    </h3>
                </Link>

                {/* Rating */}
                {rating !== undefined && (
                    <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className="w-4 h-4"
                                    style={{
                                        color: i < Math.round(rating)
                                            ? 'var(--storefront-color-accent)'
                                            : 'var(--storefront-color-border)',
                                    }}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                            ))}
                        </div>
                        {reviewCount && (
                            <span
                                className="text-xs ml-1"
                                style={{color: 'var(--storefront-color-text-muted)'}}
                            >
                ({reviewCount})
              </span>
                        )}
                    </div>
                )}

                {/* Price */}
                <div className="mb-4">
                    <div className="flex items-baseline gap-2">
            <span
                className="text-lg font-bold"
                style={{color: 'var(--storefront-color-primary)'}}
            >
              {formatCurrency(price)}
            </span>
                        {originalPrice && originalPrice > price && (
                            <span
                                className="text-sm line-through"
                                style={{color: 'var(--storefront-color-text-muted)'}}
                            >
                {formatCurrency(originalPrice)}
              </span>
                        )}
                    </div>
                </div>

                {/* Add to Cart Button */}
                {onAddToCart && (
                    <button
                        onClick={onAddToCart}
                        className="w-full py-2 rounded-lg font-semibold transition-all hover:shadow-md active:scale-95"
                        style={{
                            backgroundColor: 'var(--storefront-color-button-primary)',
                            color: 'var(--storefront-color-button-primary-text)',
                        }}
                    >
                        Add to Cart
                    </button>
                )}
            </div>
        </div>
    )
}

export default ProductCard

