import { useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

import { usePollOrderStatus } from './hooks/usePollOrderStatus'
import { useCheckoutSessionStore } from './checkoutSessionStore'
import { useCartStore } from '@/storefront/cart/cartStore'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { formatAmount } from '@/shared/utils/formatAmount'

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const clearSession = useCheckoutSessionStore((state) => state.clearSession)
  const clearCart = useCartStore((state) => state.clearCart)
  const config = useStorefrontConfig()

  const { data, isTerminal, isTimedOut } = usePollOrderStatus(sessionId)
  const hasClearedSession = useRef(false)

  // Clear cart and session only when payment is confirmed
  useEffect(() => {
    if (isTerminal && !hasClearedSession.current) {
      hasClearedSession.current = true
      clearCart()
      clearSession()
    }
  }, [isTerminal, clearCart, clearSession])

  // Missing sessionId fallback
  if (!sessionId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Invalid link</h1>
        <p className="mt-2 text-gray-600">
          Invalid confirmation link. Return to home.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Return to home
        </Link>
      </div>
    )
  }

  // Timeout state
  if (isTimedOut) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Payment pending</h1>
        <p className="mt-2 text-gray-600">
          Payment is taking longer than expected. Check your email for confirmation or contact us.
        </p>
      </div>
    )
  }

  // PAID confirmation
  if (data?.status === 'PAID') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Payment confirmed</h1>
        <p className="mt-2 text-gray-600">
          Thank you! Your order <span className="font-medium">{data.id}</span> has been paid.
        </p>
        <p className="mt-1 text-gray-600">
          Total: {formatAmount(data.totalAmount, config.currency, config.locale)}
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  // IN_STORE_PAYMENT confirmation
  if (data?.status === 'IN_STORE_PAYMENT') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-gray-900">Order confirmed</h1>
        <p className="mt-2 text-gray-600">
          Your order is confirmed. Please pay at collection.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  // Polling / loading state
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-gray-900">Confirming your payment…</h1>
      <p className="mt-2 text-gray-600">
        Please wait while we confirm your payment. This usually takes a few seconds.
      </p>
      <div className="mt-6 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
      </div>
    </div>
  )
}
