import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from './cartStore'
import { useCartVariants } from './hooks/useCartVariants'
import { useCheckout } from './hooks/useCheckout'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { formatAmount } from '@/shared/utils/formatAmount'

function CartEmptyState() {
  return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
      <p className="text-gray-500 mb-6">
        Looks like you haven't added anything to your cart yet.
      </p>
      <Link
        to="/products"
        className="inline-block px-6 py-3 rounded-lg font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors"
      >
        Continue shopping
      </Link>
    </div>
  )
}

function PriceSkeleton() {
  return (
    <span className="inline-block h-5 w-20 bg-gray-200 rounded animate-pulse" />
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
        className="p-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Increase quantity"
        className="p-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
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
    return <CartEmptyState />
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

      {/* Line items */}
      <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
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
                <p className="font-medium text-gray-900 truncate">{item.productName}</p>
                <p className="text-sm text-gray-500">{item.variantLabel}</p>
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
              <div className="text-sm text-gray-600 text-right min-w-[5rem]">
                {isLoading ? (
                  <PriceSkeleton />
                ) : isUnavailable ? (
                  <span className="text-gray-400">—</span>
                ) : (
                  formatAmount(unitPrice, currency, locale)
                )}
              </div>

              {/* Line total */}
              <div className="text-sm font-medium text-gray-900 text-right min-w-[5rem]">
                {isLoading ? (
                  <PriceSkeleton />
                ) : isUnavailable ? (
                  <span className="text-gray-400">—</span>
                ) : (
                  formatAmount(lineTotal, currency, locale)
                )}
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => remove(item.variantId)}
                aria-label={`Remove ${item.productName} from cart`}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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
          <div className="flex justify-between items-center text-lg font-medium text-gray-900">
            <span>Estimated subtotal</span>
            <span>{formatAmount(estimatedSubtotal, currency, locale)}</span>
          </div>
        )}

        {/* Price disclaimer */}
        <p className="text-xs text-gray-500">
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
          className={`w-full px-6 py-3 rounded-lg font-medium text-white transition-colors ${
            hasUnavailableItems || checkoutLoading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gray-900 hover:bg-gray-800 cursor-pointer'
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
