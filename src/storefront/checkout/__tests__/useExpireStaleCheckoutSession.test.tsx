import {renderHook} from '@testing-library/react'
import {beforeEach, describe, expect, it} from 'vitest'
import {useExpireStaleCheckoutSession} from '../hooks/useExpireStaleCheckoutSession'
import {useCheckoutSessionStore} from '../store/checkoutSessionStore'
import {useCartStore} from '@/storefront/cart/store/cartStore'
import type {CheckoutSession} from '../types'

function sessionFor(lines: Array<{ variantId: string; quantity: number }>): CheckoutSession {
    return {
        orderId: 'order-1',
        sessionId: 'session-1',
        lines: lines.map(({variantId, quantity}) => ({
            variantId,
            name: `Product ${variantId}`,
            unitPrice: 100,
            quantity,
            lineTotal: 100 * quantity,
        })),
        subtotal: 100,
        vatAmount: 15,
        shippingEstimate: 0,
        grandTotal: 115,
        orderToken: 'token-1',
    }
}

function cartOf(items: Array<{ variantId: string; quantity: number }>) {
    useCartStore.setState({
        items: items.map(({variantId, quantity}) => ({
            variantId,
            productName: `Product ${variantId}`,
            variantLabel: '',
            quantity,
        })),
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    })
}

/**
 * guest-order-authorization narrowed what "expiring" a stale session means. The
 * store's own clearCheckoutIntent() / clearOrder() split (checkoutSessionStore.ts)
 * is what this hook calls, and its job is clearing the idempotency-replay hazard —
 * not the order id or token, which must survive a refresh of the success page.
 * This hook calls clearCheckoutIntent() (not clearOrder()) so that
 * CheckoutSuccessPage's clearCart()-then-clearCheckoutIntent() sequence — which
 * fires this exact subscription, since an emptied cart no longer matches the
 * just-placed order's lines — does not wipe the confirmation it is about to show.
 * See design.md §5.2a: "the split must change the store's semantics, not one call
 * site."
 * <p>
 * This hook deliberately leaves `session` itself alone on divergence — see above.
 * That used to mean a genuinely abandoned, diverged checkout (the shopper goes
 * back to the cart mid-flow and changes it, then somehow returns to /checkout
 * without going through useCheckout() again — browser forward, a restored tab)
 * could briefly redisplay and resubmit the stale total. CheckoutPage now closes
 * that gap itself: it runs the identical staleness check
 * (isCheckoutSessionStale, shared via utils/cartSignature) against the live cart
 * on every render and refuses to show or submit a diverged session, clearing it
 * outright rather than leaving it inert. This hook's narrow scope is still
 * correct — the guest-order-authorization/CheckoutSuccessPage ordering hazard
 * this file documents above is unchanged — the resubmit risk is what moved.
 */
describe('useExpireStaleCheckoutSession', () => {
    beforeEach(() => {
        useCartStore.setState({items: [], itemCount: 0})
        useCheckoutSessionStore.setState({session: null, idempotencyKey: null, idempotencyKeyCartSignature: null})
    })

    it('leaves a session alone while the cart still matches what it was priced for', () => {
        cartOf([{variantId: 'v1', quantity: 2}])
        useCheckoutSessionStore.setState({session: sessionFor([{variantId: 'v1', quantity: 2}])})

        renderHook(() => useExpireStaleCheckoutSession())

        expect(useCheckoutSessionStore.getState().session).not.toBeNull()
    })

    it('ignores line order — the same cart in a different order is not a change', () => {
        cartOf([{variantId: 'v2', quantity: 1}, {variantId: 'v1', quantity: 2}])
        useCheckoutSessionStore.setState({
            session: sessionFor([{variantId: 'v1', quantity: 2}, {variantId: 'v2', quantity: 1}]),
        })

        renderHook(() => useExpireStaleCheckoutSession())

        expect(useCheckoutSessionStore.getState().session).not.toBeNull()
    })

    it('clears the idempotency key, but keeps the session, when a quantity changes', () => {
        cartOf([{variantId: 'v1', quantity: 2}])
        useCheckoutSessionStore.setState({session: sessionFor([{variantId: 'v1', quantity: 2}])})
        useCheckoutSessionStore.setState({idempotencyKey: 'key-1', idempotencyKeyCartSignature: 'sig-1'})
        renderHook(() => useExpireStaleCheckoutSession())

        useCartStore.getState().updateQty('v1', 3)

        const state = useCheckoutSessionStore.getState()
        expect(state.session).not.toBeNull()
        expect(state.idempotencyKey).toBeNull()
    })

    it('clears the idempotency key, but keeps the session, when a line is removed', () => {
        cartOf([{variantId: 'v1', quantity: 1}, {variantId: 'v2', quantity: 1}])
        useCheckoutSessionStore.setState({
            session: sessionFor([{variantId: 'v1', quantity: 1}, {variantId: 'v2', quantity: 1}]),
        })
        useCheckoutSessionStore.setState({idempotencyKey: 'key-1', idempotencyKeyCartSignature: 'sig-1'})
        renderHook(() => useExpireStaleCheckoutSession())

        useCartStore.getState().remove('v2')

        const state = useCheckoutSessionStore.getState()
        expect(state.session).not.toBeNull()
        expect(state.idempotencyKey).toBeNull()
    })

    it('clears the idempotency key, but keeps the session, when a product is added from anywhere', () => {
        cartOf([{variantId: 'v1', quantity: 1}])
        useCheckoutSessionStore.setState({session: sessionFor([{variantId: 'v1', quantity: 1}])})
        useCheckoutSessionStore.setState({idempotencyKey: 'key-1', idempotencyKeyCartSignature: 'sig-1'})
        renderHook(() => useExpireStaleCheckoutSession())

        useCartStore.getState().addItem({
            variantId: 'v9',
            productName: 'Added from the catalogue',
            variantLabel: '',
            quantity: 1,
        })

        const state = useCheckoutSessionStore.getState()
        expect(state.session).not.toBeNull()
        expect(state.idempotencyKey).toBeNull()
    })

    it('clears the idempotency key for a session that was already stale before mount', () => {
        // Forward navigation into a restored tab: the cart moved on while the
        // session persisted in sessionStorage.
        cartOf([{variantId: 'v1', quantity: 5}])
        useCheckoutSessionStore.setState({session: sessionFor([{variantId: 'v1', quantity: 1}])})
        useCheckoutSessionStore.setState({idempotencyKey: 'key-1', idempotencyKeyCartSignature: 'sig-1'})

        renderHook(() => useExpireStaleCheckoutSession())

        const state = useCheckoutSessionStore.getState()
        expect(state.session).not.toBeNull()
        expect(state.idempotencyKey).toBeNull()
    })

    it('does nothing when there is no session to expire', () => {
        cartOf([{variantId: 'v1', quantity: 1}])
        renderHook(() => useExpireStaleCheckoutSession())

        useCartStore.getState().updateQty('v1', 4)

        expect(useCheckoutSessionStore.getState().session).toBeNull()
    })

    it('stops watching the cart once unmounted', () => {
        cartOf([{variantId: 'v1', quantity: 1}])
        const {unmount} = renderHook(() => useExpireStaleCheckoutSession())
        unmount()

        useCheckoutSessionStore.setState({
            session: sessionFor([{variantId: 'v1', quantity: 1}]),
            idempotencyKey: 'key-1',
            idempotencyKeyCartSignature: 'sig-1',
        })
        useCartStore.getState().updateQty('v1', 9)

        expect(useCheckoutSessionStore.getState().idempotencyKey).not.toBeNull()
    })
})
