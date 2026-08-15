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
 * Keyed by `OrderStatus` and typed `Record<OrderStatus, string>`, so a new status
 * fails to compile until it is given a colour. It was previously a
 * `Record<string, string>` containing `SHIPPED` — a status `OrderStatusEn` has never
 * had — which made the amber styling unreachable and dropped `IN_TRANSIT`,
 * `REFUNDED`, `IN_STORE_PAYMENT`, `FAILED`, `SYSTEM_CANCELED` and `PENDING` onto the
 * neutral fallback, so a shipped order and a refunded one looked identical.
 */
const NEUTRAL_BADGE = 'bg-(--c-surface-hover) text-(--c-text-muted)'

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
    // Not yet paid — nothing has happened the shopper needs drawing to.
    [OrderStatus.CREATED]: NEUTRAL_BADGE,
    [OrderStatus.PENDING]: NEUTRAL_BADGE,

    // Money committed, goods still with the store.
    [OrderStatus.PAID]: 'bg-blue-50 text-blue-700',
    [OrderStatus.IN_STORE_PAYMENT]: 'bg-blue-50 text-blue-700',

    // On its way — the state a shopper checks this page for.
    [OrderStatus.IN_TRANSIT]: 'bg-amber-50 text-amber-700',

    [OrderStatus.DELIVERED]: 'bg-green-50 text-green-700',

    // Ended without delivery. SYSTEM_CANCELED reads the same as a staff
    // cancellation: the shopper does not care which side ended it.
    [OrderStatus.CANCELLED]: 'bg-red-50 text-red-700',
    [OrderStatus.SYSTEM_CANCELED]: 'bg-red-50 text-red-700',
    [OrderStatus.FAILED]: 'bg-red-50 text-red-700',

    // Money returned — distinct from cancelled, which may involve no payment.
    [OrderStatus.REFUNDED]: 'bg-purple-50 text-purple-700',
}

/**
 * Falls back to neutral for a status outside the vocabulary — the server is the
 * authority on what it sends, and an unknown value must not render unstyled.
 */
export function orderStatusBadgeClasses(status: string): string {
    return STATUS_BADGE_CLASSES[status as OrderStatus] ?? NEUTRAL_BADGE
}
