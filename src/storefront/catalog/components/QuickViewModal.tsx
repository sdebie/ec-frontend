import {useCallback, useEffect, useRef} from 'react'
import {createPortal} from 'react-dom'
import {Link} from 'react-router-dom'
import {X} from 'lucide-react'
import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {useCustomerAuthStore} from '@/shared/auth/customerAuthStore'
import {formatAmount} from '@/shared/utils/formatAmount'
import {getDisplayPrice} from '../utils/pricing'
import {pickFeaturedImage} from '@/storefront/catalog'
import {CardActions} from './CardActions'

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

/**
 * Collects all focusable elements within a container.
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
    const elements = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    )
    return Array.from(elements)
}

export function QuickViewModal({product, variantId, triggerRef, onClose}: QuickViewModalProps) {
    const dialogRef = useRef<HTMLDivElement>(null)
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

    // Focus trap: keydown handler
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
                return
            }

            if (e.key === 'Tab' && dialogRef.current) {
                const focusable = getFocusableElements(dialogRef.current)
                if (focusable.length === 0) return

                const first = focusable[0]
                const last = focusable[focusable.length - 1]

                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault()
                        last.focus()
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault()
                        first.focus()
                    }
                }
            }
        },
        [onClose],
    )

    // On mount: move focus into the dialog, add keydown listener
    useEffect(() => {
        const triggerElement = triggerRef.current
        document.addEventListener('keydown', handleKeyDown)

        // Focus the first focusable element inside the dialog
        if (dialogRef.current) {
            const focusable = getFocusableElements(dialogRef.current)
            if (focusable.length > 0) {
                focusable[0].focus()
            }
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            // Restore focus on unmount
            triggerElement?.focus()
        }
    }, [handleKeyDown, triggerRef])

    // Read portal attributes from the document root (standing rule — no getComputedStyle)
    const root = document.documentElement
    const dataSurface = root.getAttribute('data-surface') ?? 'storefront'
    const dataTheme = root.getAttribute('data-theme') ?? undefined
    const dataDensity = root.getAttribute('data-density') ?? 'comfortable'

    const headingId = `quick-view-heading-${product.id}`

    const modalContent = (
        <div
            data-surface={dataSurface}
            data-theme={dataTheme}
            data-density={dataDensity}
            className="fixed inset-0 z-50 flex items-center justify-center"
            data-testid="quick-view-portal"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
                aria-hidden="true"
                data-testid="quick-view-backdrop"
            />

            {/* Dialog */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={headingId}
                className="relative z-10 mx-4 w-full max-w-2xl overflow-y-auto rounded-lg bg-(--sf-panel) p-6 shadow-xl max-h-[90vh]"
            >
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
                            <div className="flex h-full w-full items-center justify-center text-(--sf-muted-text)">
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

                        {/* Actions */}
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
            </div>
        </div>
    )

    return createPortal(modalContent, document.body)
}
