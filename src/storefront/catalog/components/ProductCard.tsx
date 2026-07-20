import {Link} from 'react-router-dom'
import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {formatAmount} from '@/shared/utils/formatAmount'
import {getDisplayPrice} from '../utils/pricing'
import {pickFeaturedImage} from '../utils/imageUtils'
import {WishlistButton} from '@/storefront/customer/account/wishlist/WishlistButton'

interface PriceTier {
    price: number | null
}

interface ProductCardProps {
    product: {
        id: string
        name: string
        slug: string
        images: Array<{
            imageUrl: string
            featured: boolean
            sortOrder: number
        }>
        retailPrice: PriceTier | null
        wholesalePrice: PriceTier | null
        retailSalePrice: PriceTier | null
        wholesaleSalePrice: PriceTier | null
    }
    variantId?: string | null
}

export function ProductCard({product, variantId}: ProductCardProps) {
    const {currency, locale} = useStorefrontConfig()
    const customerType = useCustomerAuthStore((state) => state.customerType)

    const imageUrl = pickFeaturedImage(product.images)
    const {price, originalPrice} = getDisplayPrice(
        {
            retailPrice: product.retailPrice?.price ?? null,
            wholesalePrice: product.wholesalePrice?.price ?? null,
            retailSalePrice: product.retailSalePrice?.price ?? null,
            wholesaleSalePrice: product.wholesaleSalePrice?.price ?? null,
        },
        customerType,
    )

    return (
        <Link
            to={`/products/${product.slug}`}
            className="group flex h-full flex-col rounded-lg border border-(--sf-border) bg-(--sf-panel) overflow-hidden transition-shadow hover:shadow-md"
        >
            <div className="relative aspect-square w-full overflow-hidden bg-(--sf-surface-muted)">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div
                        className="flex h-full w-full items-center justify-center bg-(--sf-surface-muted) text-(--sf-muted-text)">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                            />
                        </svg>
                    </div>
                )}
                {variantId && (
                    <WishlistButton
                        variantId={variantId}
                        className="absolute top-2 right-2 rounded-full bg-(--sf-panel)/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-(--sf-panel) cursor-pointer"
                    />
                )}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-medium text-(--sf-text) line-clamp-2">
                    {product.name}
                </h3>

                <div className="mt-auto flex items-center gap-2 pt-2">
                    {originalPrice != null && (
                        <span className="line-through text-(--sf-muted-text)">
                            {formatAmount(originalPrice, currency, locale)}
                        </span>
                    )}
                    <span className="font-semibold">
                        {formatAmount(price, currency, locale)}
                    </span>
                </div>
            </div>
        </Link>
    )
}
