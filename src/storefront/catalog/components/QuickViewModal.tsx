import {Link} from 'react-router-dom'
import {X} from 'lucide-react'
import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {formatAmount} from '@/shared/utils/formatAmount'
import {getDisplayPrice} from '../utils/pricing'
import {pickFeaturedImage} from '@/storefront/catalog'
import {Dialog, DialogContent} from '@/shared/ui/components/dialog/Dialog'
import {CardActions} from './CardActions'
import {ProductImagePlaceholder} from './ProductImageStage'

interface PriceTier {
    price: number | null
}

export interface QuickViewModalProps {
    product: {
        id: string
        name: string
        slug: string
        shortDescription: string
        images: Array<{ imageUrl: string; featured: boolean; sortOrder: number }>
        retailPrice: PriceTier | null
        wholesalePrice: PriceTier | null
        retailSalePrice: PriceTier | null
        wholesaleSalePrice: PriceTier | null
        variantId?: string | null
        sku?: string | null
        inStock?: boolean | null
    }
    variantId: string | null
    triggerRef: React.RefObject<HTMLElement | null>
    onClose: () => void
}

export function QuickViewModal({product, variantId, triggerRef, onClose}: QuickViewModalProps) {
    const {currency, locale} = useStorefrontConfig()
    const customerType = useCustomerAuthStore((state) => state.customerType)

    const imageUrl = pickFeaturedImage(product.images)
    const priceTiers = {
        retailPrice: product.retailPrice?.price ?? null,
        wholesalePrice: product.wholesalePrice?.price ?? null,
        retailSalePrice: product.retailSalePrice?.price ?? null,
        wholesaleSalePrice: product.wholesaleSalePrice?.price ?? null,
    }
    const {price, originalPrice} = getDisplayPrice(priceTiers, customerType)

    const wholesaleDisplay =
        customerType !== 'WHOLESALE' ? getDisplayPrice(priceTiers, 'WHOLESALE').price : null

    // Determine if we show CardActions or "View full details"
    const isSimpleInStock = variantId != null && product.inStock === true && price != null

    const headingId = `quick-view-heading-${product.id}`

    return (
        <Dialog
            open
            onClose={onClose}
            className="max-w-2xl"
            restoreFocusRef={triggerRef}
            aria-labelledby={headingId}
        >
            <DialogContent className="relative p-6">
                {/* Close button */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close quick view"
                    className="absolute right-4 top-4 rounded p-1 text-(--sf-muted-text) hover:text-(--sf-text) transition-colors"
                >
                    <X className="h-5 w-5"/>
                </button>

                <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                    {/* Image */}
                    <div
                        className="aspect-square w-full shrink-0 overflow-hidden rounded-md bg-(--sf-surface-muted) sm:w-48">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={product.name}
                                className="h-full w-full object-contain p-4"
                            />
                        ) : (
                            <ProductImagePlaceholder className="h-12 w-12"/>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col">
                        <h2
                            id={headingId}
                            className="text-lg font-semibold text-(--sf-text)"
                        >
                            {product.name}
                        </h2>

                        {/* SKU line — SIMPLE only */}
                        {product.sku && (
                            <p className="mt-1 text-sm text-(--sf-muted-text)">
                                SKU: {product.sku}
                            </p>
                        )}

                        {/* Stock indicator */}
                        {product.inStock === true && (
                            <p className="mt-1 text-sm font-medium text-(--sf-success)">In stock</p>
                        )}
                        {product.inStock === false && (
                            <p className="mt-1 text-sm font-medium text-(--sf-muted-text)">Out of stock</p>
                        )}

                        {/* Price block */}
                        <div className="mt-3">
                            <div className="flex items-baseline gap-2">
                                {originalPrice != null && (
                                    <span className="line-through text-(--sf-muted-text)">
                    {formatAmount(originalPrice, currency, locale)}
                  </span>
                                )}
                                <span className="font-semibold">
                  {formatAmount(price, currency, locale)}
                </span>
                                {price != null && (
                                    <span className="text-xs text-(--sf-muted-text)">ex. VAT</span>
                                )}
                            </div>
                            {wholesaleDisplay != null && (
                                <p className="mt-0.5 text-xs text-(--sf-muted-text)">
                                    Wholesale: {formatAmount(wholesaleDisplay, currency, locale)} ex. VAT
                                </p>
                            )}
                        </div>

                        {/* Short description */}
                        {product.shortDescription && (
                            <p className="mt-3 text-sm text-(--sf-muted-text) line-clamp-3">
                                {product.shortDescription}
                            </p>
                        )}

                        <div className="mt-4">
                            {isSimpleInStock ? (
                                <CardActions
                                    variantId={variantId}
                                    productName={product.name}
                                    productSlug={product.slug}
                                    inStock={product.inStock ?? null}
                                    hasPrice={price != null}
                                />
                            ) : (
                                <Link
                                    to={`/products/${product.slug}`}
                                    className="inline-flex items-center justify-center rounded-lg border border-(--sf-border) px-4 py-2 text-sm font-medium text-(--sf-text) hover:bg-(--sf-surface-muted) transition-colors"
                                >
                                    View full details
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
