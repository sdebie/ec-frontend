import {useEffect, useRef} from 'react'
import {useSearchParams} from 'react-router-dom'
import {usePollOrderStatus} from './hooks/usePollOrderStatus'
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
 */
export function CheckoutSuccessPage() {
    const [searchParams] = useSearchParams()
    const sessionId = searchParams.get('sessionId')

    const clearSession = useCheckoutSessionStore((state) => state.clearSession)
    const clearCart = useCartStore((state) => state.clearCart)
    const config = useStorefrontConfig()

    const {data, isTerminal, isTimedOut} = usePollOrderStatus(sessionId)
    const hasClearedSession = useRef(false)

    // Clear cart, session and the saved form draft only when payment is
    // confirmed. The draft joins them here rather than being dropped at submit
    // time: a PayFast shopper leaves the site to pay, and one who abandons at the
    // gateway must come back to their details still filled in.
    useEffect(() => {
        if (isTerminal && !hasClearedSession.current) {
            hasClearedSession.current = true
            clearCart()
            clearSession()
            clearFormDraft(CHECKOUT_DRAFT_KEY)
        }
    }, [isTerminal, clearCart, clearSession])

    if (!sessionId) {
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
