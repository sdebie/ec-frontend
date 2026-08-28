import { OrderStatus } from '@/shared/types/enums/OrderStatus'

/**
 * Single source of truth for order-status badge styling, shared by the account
 * dashboard and the order history and detail pages.
 *
 * `--c-status-*` and `--c-info` are bound only under [data-surface='admin']
 * (see shared/ui/primitives/surface/tokens.css), so they resolve to nothing on
 * storefront pages. Lifecycle states therefore use semantic status palette
 * classes (the documented theme-token exception); neutral states use surface
 * tokens, which are defined for every surface.
 *
 * Keyed by `OrderStatus` and typed `Record<OrderStatus, string>` rather than
 * `Record<string, string>`, so a new status fails to compile until it is given
 * a colour here — a loosely-typed map can silently miss a status and let it
 * fall through to the neutral badge, reading as no different from a cancelled
 * or refunded order.
 */
const NEUTRAL_BADGE = 'bg-(--c-surface-hover) text-(--c-text-muted)'

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
    // Placed, but nothing has happened the shopper needs drawing to yet.
    [OrderStatus.CREATED]: NEUTRAL_BADGE,
    [OrderStatus.PENDING]: NEUTRAL_BADGE,

    // Waiting on the shopper: money is still owed, whether at the gateway or the
    // counter. Amber is "your move" — the same weight as a delivery in progress.
    [OrderStatus.PENDING_PAYMENT]: 'bg-amber-50 text-amber-700',
    [OrderStatus.IN_STORE_PAYMENT]: 'bg-amber-50 text-amber-700',

    // Money committed, goods still with the store and being prepared.
    [OrderStatus.PAID]: 'bg-blue-50 text-blue-700',
    [OrderStatus.PROCESSING]: 'bg-blue-50 text-blue-700',
    [OrderStatus.READY_TO_SHIP]: 'bg-blue-50 text-blue-700',
    [OrderStatus.READY_FOR_COLLECTION]: 'bg-blue-50 text-blue-700',

    // On its way — the state a shopper checks this page for.
    [OrderStatus.IN_TRANSIT]: 'bg-amber-50 text-amber-700',

    // Both endings where the shopper has their goods.
    [OrderStatus.DELIVERED]: 'bg-green-50 text-green-700',
    [OrderStatus.COLLECTED]: 'bg-green-50 text-green-700',

    // Something went wrong and the shopper has to act or wait to hear.
    [OrderStatus.PAYMENT_FAILED]: 'bg-red-50 text-red-700',
    [OrderStatus.DELIVERY_FAILED]: 'bg-red-50 text-red-700',
    [OrderStatus.RETURNED_TO_ORIGIN]: 'bg-purple-50 text-purple-700',

    // Ended without delivery. All three read the same: the shopper does not care
    // which side ended it, only that it is over.
    [OrderStatus.USER_CANCELED]: 'bg-red-50 text-red-700',
    [OrderStatus.ADMIN_CANCELED]: 'bg-red-50 text-red-700',
    [OrderStatus.SYSTEM_CANCELED]: 'bg-red-50 text-red-700',
    [OrderStatus.CANCELLED]: 'bg-red-50 text-red-700',
    [OrderStatus.FAILED]: 'bg-red-50 text-red-700',

    // Money returned — distinct from cancelled, which may involve no payment.
    [OrderStatus.REFUNDED]: 'bg-purple-50 text-purple-700',
    [OrderStatus.PARTIALLY_REFUNDED]: 'bg-purple-50 text-purple-700',
}

/**
 * Falls back to neutral for a status outside the vocabulary — the server is the
 * authority on what it sends, and an unknown value must not render unstyled.
 */
export function orderStatusBadgeClasses(status: string): string {
    return STATUS_BADGE_CLASSES[status as OrderStatus] ?? NEUTRAL_BADGE
}
