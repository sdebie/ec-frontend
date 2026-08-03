/**
 * Single source of truth for order-status badge styling, shared by the account
 * dashboard and order history/detail pages (previously triplicated).
 *
 * `--c-status-*` and `--c-info` are bound only under [data-surface='admin']
 * (see shared/ui/primitives/surface/tokens.css), so they resolve to nothing on
 * storefront pages. Lifecycle states therefore use semantic status palette
 * classes (the documented theme-token exception); CREATED uses neutral surface
 * tokens, which are defined for every surface.
 */
const STATUS_BADGE_CLASSES: Record<string, string> = {
    CREATED: 'bg-(--c-surface-hover) text-(--c-text-muted)',
    PAID: 'bg-blue-50 text-blue-700',
    SHIPPED: 'bg-amber-50 text-amber-700',
    DELIVERED: 'bg-green-50 text-green-700',
    CANCELLED: 'bg-red-50 text-red-700',
}

const FALLBACK_BADGE = 'bg-(--c-surface-hover) text-(--c-text-muted)'

export function orderStatusBadgeClasses(status: string): string {
    return STATUS_BADGE_CLASSES[status] ?? FALLBACK_BADGE
}
