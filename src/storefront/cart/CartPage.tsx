import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from './cartStore'
import { useCartVariants } from './hooks/useCartVariants'
import { useCheckout } from './hooks/useCheckout'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { formatAmount } from '@/shared/utils/formatAmount'

function CartEmptyState() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold text-(--sf-text) mb-2">Your cart is empty</h1>
      <p className="text-(--sf-muted-text) mb-6">
        Looks like you haven't added anything to your cart yet.
      </p>
      <Link
        to="/products"
        className="inline-block px-6 py-3 rounded-lg font-medium text-(--sf-accent-text) bg-(--sf-accent) hover:opacity-90 transition-colors"
      >
        Continue shopping
      </Link>
    </div>
  )
}

function PriceSkeleton() {
  return (
    <span className="inline-block h-5 w-20 bg-(--sf-surface-muted) rounded animate-pulse" />
  )
}

interface QuantityStepperProps {
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
}

function QuantityStepper({ quantity, onIncrement, onDecrement }: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
        className="p-1 rounded border border-(--sf-border) text-(--sf-muted-text) hover:bg-(--sf-surface-muted) disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Increase quantity"
        className="p-1 rounded border border-(--sf-border) text-(--sf-muted-text) hover:bg-(--sf-surface-muted) transition-colors"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

export function CartPage() {
  const { items, updateQty, remove } = useCartStore()
  const variantIds = items.map((i) => i.variantId)
  const { variants, unavailableIds, isLoading } = useCartVariants(variantIds)
  const { checkout, isLoading: checkoutLoading, unavailableVariantIds: checkoutUnavailable, error: checkoutError } = useCheckout()
  const { currency, locale } = useStorefrontConfig()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <CartEmptyState />
      </div>
    )
  }

  // Merge unavailable IDs from catalog fetch and checkout 422 response
  const allUnavailableIds = [...new Set([...unavailableIds, ...checkoutUnavailable])]
  const hasUnavailableItems = allUnavailableIds.length > 0

  // Compute estimated subtotal from loaded variant prices
  const estimatedSubtotal = items.reduce((sum, item) => {
    const variant = variants.get(item.variantId)
    if (!variant || variant.displayPrice === null) return sum
    return sum + variant.displayPrice * item.quantity
  }, 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold text-(--sf-text) mb-6">Your Cart</h1>

      {/* Line items */}
      <div className="divide-y divide-(--sf-border) border-t border-b border-(--sf-border)">
        {items.map((item) => {
          const variant = variants.get(item.variantId)
          const isUnavailable = allUnavailableIds.includes(item.variantId)
          const isCheckoutFlagged = checkoutUnavailable.includes(item.variantId)
          const unitPrice = variant?.displayPrice ?? null
          const lineTotal = unitPrice !== null ? unitPrice * item.quantity : null

          return (
            <div
              key={item.variantId}
              className={`py-4 grid grid-cols-[1fr_auto] gap-4 items-start sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center ${
                isCheckoutFlagged ? 'bg-red-50 -mx-4 px-4 rounded-lg' : ''
              }`}
            >
              {/* Product info */}
              <div className="min-w-0">
                <p className="font-medium text-(--sf-text) truncate">{item.productName}</p>
                <p className="text-sm text-(--sf-muted-text)">{item.variantLabel}</p>
                {isUnavailable && (
                  <p className="text-sm text-red-600 font-medium mt-1">
                    No longer available
                  </p>
                )}
              </div>

              {/* Quantity stepper */}
              <div className="flex items-center">
                <QuantityStepper
                  quantity={item.quantity}
                  onIncrement={() => updateQty(item.variantId, item.quantity + 1)}
                  onDecrement={() => updateQty(item.variantId, item.quantity - 1)}
                />
              </div>

              {/* Unit price */}
              <div className="text-sm text-(--sf-muted-text) text-right min-w-[5rem]">
                {isLoading ? (
                  <PriceSkeleton />
                ) : isUnavailable ? (
                  <span className="text-(--sf-muted-text)">—</span>
                ) : (
                  formatAmount(unitPrice, currency, locale)
                )}
              </div>

              {/* Line total */}
              <div className="text-sm font-medium text-(--sf-text) text-right min-w-[5rem]">
                {isLoading ? (
                  <PriceSkeleton />
                ) : isUnavailable ? (
                  <span className="text-(--sf-muted-text)">—</span>
                ) : (
                  formatAmount(lineTotal, currency, locale)
                )}
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => remove(item.variantId)}
                aria-label={`Remove ${item.productName} from cart`}
                className="p-2 text-(--sf-muted-text) hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Summary section */}
      <div className="mt-6 space-y-4">
        {/* Estimated subtotal */}
        {!isLoading && (
          <div className="flex justify-between items-center text-lg font-medium text-(--sf-text)">
            <span>Estimated subtotal</span>
            <span>{formatAmount(estimatedSubtotal, currency, locale)}</span>
          </div>
        )}

        {/* Price disclaimer */}
        <p className="text-xs text-(--sf-muted-text)">
          Estimated — final total confirmed at checkout
        </p>

        {/* Proceed to checkout button */}
        {checkoutError && (
          <p className="text-sm text-red-600">{checkoutError}</p>
        )}

        <button
          type="button"
          disabled={hasUnavailableItems || checkoutLoading}
          onClick={checkout}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
            hasUnavailableItems || checkoutLoading
              ? 'bg-(--sf-surface-muted) text-(--sf-muted-text) cursor-not-allowed'
              : 'bg-(--sf-accent) text-(--sf-accent-text) hover:opacity-90 cursor-pointer'
          }`}
        >
          {checkoutLoading ? 'Processing...' : 'Proceed to checkout'}
        </button>

        {hasUnavailableItems && (
          <p className="text-sm text-red-600 text-center">
            Remove unavailable items before proceeding to checkout.
          </p>
        )}
      </div>
    </div>
  )
}
