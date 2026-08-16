import type {CartLineItem} from '@/storefront/cart/store/cartStore'

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
