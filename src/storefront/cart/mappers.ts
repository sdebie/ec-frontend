import {pickFeaturedImage} from '@/storefront/catalog/utils/productImage'
import {parseVariantLabel} from '@/storefront/catalog/utils/variantLabel'
import type {CartLineItem} from './store/cartStore.ts'
import type {CartVariant} from './hooks/useCartVariants'
import type {CartRow} from './types'

interface ToCartRowsInput {
    items: CartLineItem[]
    variants: Map<string, CartVariant>
    /** Variant IDs the catalogue did not return at all (hard-deleted). */
    unavailableIds: string[]
    /** Variant IDs the checkout 422 named. */
    checkoutFlaggedIds: string[]
}

/**
 * Joins the persisted cart lines with the current catalogue state, deciding
 * every availability question ONCE so a row, the summary and the checkout button
 * can never disagree about which lines are orderable.
 *
 * The availability rules mirror `OrderService.createOrderFromCart` exactly —
 * missing or non-ACTIVE variant, and quantity above stock — so what the cart
 * blocks is what the server would have rejected with a 422.
 *
 * Null discipline: `stockQuantity === null` means the catalogue does not know,
 * and unknown never blocks. (The server does reject null stock; the 422 handling
 * stays the backstop for that, because falsely blocking a shopper is worse than
 * a rejection we already surface.)
 *
 * Pricing: `unitPrice` is the price the backend already selected for this
 * shopper's tier — the cart multiplies it by the quantity and never derives one.
 */
export function toCartRows({
                               items,
                               variants,
                               unavailableIds,
                               checkoutFlaggedIds,
                           }: ToCartRowsInput): CartRow[] {
    const unavailable = new Set(unavailableIds)
    const flagged = new Set(checkoutFlaggedIds)

    return items.map((item) => {
        const variant = variants.get(item.variantId)
        const isCheckoutFlagged = flagged.has(item.variantId)

        // Gone from the catalogue, or present but no longer ACTIVE. A null status is
        // unknown, not disabled. A checkout rejection is tracked separately: the
        // server flags a variant for stock reasons too, so "no longer available" is
        // not a safe thing to tell the shopper about a flagged line.
        const isUnavailable =
            unavailable.has(item.variantId) ||
            (variant?.status != null && variant.status !== 'ACTIVE')

        const stockQuantity = variant?.stockQuantity ?? null
        const isOutOfStock = stockQuantity === 0
        const exceedsStock = stockQuantity !== null && stockQuantity > 0 && item.quantity > stockQuantity

        const unitPrice = variant?.displayPrice ?? null
        const lineTotal = unitPrice !== null ? unitPrice * item.quantity : null

        return {
            variantId: item.variantId,
            productName: item.productName,
            // Idempotent for the display labels every add path already writes; it only
            // bites if a legacy stored line kept raw attribute JSON.
            variantLabel: parseVariantLabel(item.variantLabel),
            quantity: item.quantity,
            sku: variant?.sku ?? null,
            imageUrl: variant ? pickFeaturedImage(variant.images) : null,
            unitPrice,
            lineTotal,
            stockQuantity,
            isUnavailable,
            isCheckoutFlagged,
            isOutOfStock,
            exceedsStock,
            // A priceless line is blocked deliberately: PricingService falls back to
            // BigDecimal.ZERO rather than rejecting, so letting it through would place
            // a R0.00 order the shopper never agreed to.
            isOrderable:
                !isUnavailable &&
                !isCheckoutFlagged &&
                !isOutOfStock &&
                !exceedsStock &&
                unitPrice !== null,
        }
    })
}

/**
 * Sums the orderable lines' totals. Only lines that can actually be ordered
 * count, so the figure matches what "Proceed to checkout" would submit.
 */
export function estimateSubtotal(rows: CartRow[]): number {
    return rows.reduce((sum, row) => (row.isOrderable ? sum + (row.lineTotal ?? 0) : sum), 0)
}
