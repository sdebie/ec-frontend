import {useEffect, useRef} from 'react'
import {isCancelledStatus, usePollOrderStatus} from './hooks/usePollOrderStatus'
import {useCheckoutSessionStore} from './store/checkoutSessionStore'
import {useCartStore} from '@/storefront/cart/store/cartStore'
import {useStorefrontConfig} from '@/shared/config/storefrontConfig.context'
import {formatAmount} from '@/shared/utils/formatAmount'
import {CheckoutShell} from './components/CheckoutShell'
import {CheckoutNotice} from './components/CheckoutNotice'
import {clearFormDraft} from '@/shared/ui/components/form/useFormDraft'
import {CHECKOUT_DRAFT_KEY} from './draftKey'

/**
 * The end of the journey. Every state renders in the shared shell through the
 * same notice panel, so the page keeps one `h1` and does not change shape as the
 * payment resolves.
 * <p>
 * Reads the order from checkoutSessionStore, not a URL query string (Requirement
 * 3.5) — a query string reaches browser history and any third-party Referer, and
 * a token in the URL is itself a bearer credential (Requirement 4). The
 * store survives the PayFast round trip in the same tab (owner decision 3), and
 * clearCheckoutIntent() (see the store) deliberately keeps orderId/orderToken
 * through a terminal status so this page still has something to render after a
 * refresh.
 */
export function CheckoutSuccessPage() {
    const orderId = useCheckoutSessionStore((state) => state.session?.orderId ?? null)
    const token = useCheckoutSessionStore((state) => state.session?.orderToken ?? null)

    const clearCheckoutIntent = useCheckoutSessionStore((state) => state.clearCheckoutIntent)
    const clearCart = useCartStore((state) => state.clear)
    const config = useStorefrontConfig()

    const {data, isTerminal, isTimedOut} = usePollOrderStatus(orderId, token)
    const hasClearedSession = useRef(false)

    // Clear the cart, the idempotency key and the saved form draft once payment
    // resolves — never the order id/token themselves, which this page still needs
    // to render (and needs again on a refresh). The draft joins them here rather
    // than being dropped at submit time: a PayFast shopper leaves the site to pay,
    // and one who abandons at the gateway must come back to their details still
    // filled in.
    useEffect(() => {
        if (isTerminal && !hasClearedSession.current) {
            hasClearedSession.current = true
            clearCart()
            clearCheckoutIntent()
            clearFormDraft(CHECKOUT_DRAFT_KEY)
        }
    }, [isTerminal, clearCart, clearCheckoutIntent])

    if (!orderId || !token) {
        return (
            <CheckoutShell title="Order confirmation">
                <CheckoutNotice
                    heading="This link isn't valid"
                    body="We couldn't find an order for this link. If you've just paid, check your email for the confirmation."
                    action={{label: 'Return to home', to: '/'}}
                />
            </CheckoutShell>
        )
    }

    if (isCancelledStatus(data?.status)) {
        return (
            <CheckoutShell title="Order confirmation">
                <CheckoutNotice
                    heading="This order was cancelled"
                    body="This order is no longer active and was not charged. If this is unexpected, please contact us."
                    action={{label: 'Return to home', to: '/'}}
                />
            </CheckoutShell>
        )
    }

    // Deliberately not folded into isCancelledStatus: a declined card is not a
    // cancellation, and the account order-history badge already treats the two as
    // distinct outcomes (orderStatusBadge.ts). This page has no path to retry the
    // same order today, so the action returns home rather than promising one.
    if (data?.status === 'PAYMENT_FAILED') {
        return (
            <CheckoutShell title="Order confirmation">
                <CheckoutNotice
                    heading="Payment failed"
                    body="Your payment could not be processed and this order was not charged. Please return to the shop to try again."
                    action={{label: 'Return to home', to: '/'}}
                />
            </CheckoutShell>
        )
    }

    if (isTimedOut) {
        return (
            <CheckoutShell title="Order confirmation">
                <CheckoutNotice
                    heading="Payment is still processing"
                    body="This is taking longer than usual. Your confirmation will arrive by email — please contact us if it doesn't."
                    action={{label: 'Return to home', to: '/'}}
                />
            </CheckoutShell>
        )
    }

    if (data?.status === 'PAID') {
        return (
            <CheckoutShell title="Order confirmation">
                <CheckoutNotice
                    heading="Payment confirmed"
                    body={`Thank you — order ${data.id} is paid, for ${formatAmount(data.totalAmount, config.currency, config.locale)}. A confirmation is on its way to your email.`}
                    action={{label: 'Continue shopping', to: '/products'}}
                />
            </CheckoutShell>
        )
    }

    if (data?.status === 'IN_STORE_PAYMENT') {
        return (
            <CheckoutShell title="Order confirmation">
                <CheckoutNotice
                    heading="Order confirmed"
                    body="Your order is confirmed. Please pay when you collect it."
                    action={{label: 'Continue shopping', to: '/products'}}
                />
            </CheckoutShell>
        )
    }

    return (
        <CheckoutShell title="Order confirmation">
            <CheckoutNotice
                busy
                heading="Confirming your payment…"
                body="Please wait while we confirm your payment. This usually takes a few seconds."
            />
        </CheckoutShell>
    )
}
