import type {CartLineItem} from '@/storefront/cart/store/cartStore'
import type {CheckoutSession} from '../types'

/**
 * variantId:quantity pairs, order-independent. Shared by
 * useExpireStaleCheckoutSession (session staleness) and useCheckout
 * (idempotency-key staleness) — one definition, so the two can never drift
 * into disagreeing about what "the same cart" means.
 */
export function cartSignature(items: CartLineItem[]): string {
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

/**
 * Whether the live cart no longer matches what `session` was priced for.
 * Shared by useExpireStaleCheckoutSession (clears the idempotency key on
 * divergence, keeping the order alive for a legitimate resubmit) and
 * CheckoutPage (refuses to render or submit a diverged session at all) — one
 * definition, so the two can never disagree about what counts as stale.
 */
export function isCheckoutSessionStale(session: CheckoutSession, items: CartLineItem[]): boolean {
    return cartSignature(items) !== sessionSignature(session)
}
