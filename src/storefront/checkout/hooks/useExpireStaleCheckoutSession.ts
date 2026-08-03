import { useEffect } from 'react'
import { useCartStore, type CartLineItem } from '@/storefront/cart/store/cartStore'
import { useCheckoutSessionStore } from '../store/checkoutSessionStore'
import type { CheckoutSession } from '../types'

/**
 * A checkout session describes ONE priced order. If the cart no longer matches
 * it — the shopper went back, changed a quantity, removed a line — that order is
 * stale, and navigating forward to /checkout again (browser forward button, a
 * second tab, a restored session) would show and charge the old figures.
 *
 * Deliberately an invariant, not "the cart was touched, wipe it". Comparing what
 * is in the cart against what the session was priced for means a rehydrating
 * store, a re-render, or a write that changes nothing all leave a valid session
 * alone. Only a genuine divergence expires it.
 *
 * Mounted once by StorefrontLayout, so it holds wherever the cart is written
 * from — catalogue, product page, wishlist or the cart itself.
 */
export function useExpireStaleCheckoutSession() {
    useEffect(() => {
        expireIfStale(useCartStore.getState().items)

        return useCartStore.subscribe((state, previous) => {
            if (state.items === previous.items) return
            expireIfStale(state.items)
        })
    }, [])
}

/** variantId:quantity pairs, order-independent. */
function cartSignature(items: CartLineItem[]): string {
    return items
        .map((item) => `${item.variantId}:${item.quantity}`)
        .sort()
        .join('|')
}

function sessionSignature(session: CheckoutSession): string {
    return session.lines
        .map((line) => `${line.variantId}:${line.quantity}`)
        .sort()
        .join('|')
}

function expireIfStale(items: CartLineItem[]): void {
    const { session, clearSession } = useCheckoutSessionStore.getState()
    if (!session) return
    if (cartSignature(items) === sessionSignature(session)) return
    clearSession()
}
