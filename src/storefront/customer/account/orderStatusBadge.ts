/**
 * Single source of truth for order-status badge styling, shared by the account
 * dashboard and order history/detail pages (previously triplicated).
 *
 * Order-lifecycle states are semantic status indicators with no dedicated
 * storefront token: SHIPPED/DELIVERED/CANCELLED map onto the shared
 * `--c-status-*` tokens; CREATED (neutral) and PAID (info) have no token
 * equivalent and fall under the documented semantic-status exception.
 */
const STATUS_BADGE_CLASSES: Record<string, string> = {
  CREATED: 'bg-(--c-surface-hover) text-(--c-text-muted)',
  PAID: 'bg-(--c-accent-subtle) text-(--c-info)',
  SHIPPED: 'bg-(--c-status-yellow-bg) text-(--c-status-yellow-text)',
  DELIVERED: 'bg-(--c-status-green-bg) text-(--c-status-green-text)',
  CANCELLED: 'bg-(--c-status-red-bg) text-(--c-status-red-text)',
}

const FALLBACK_BADGE = 'bg-(--c-surface-hover) text-(--c-text-muted)'

export function orderStatusBadgeClasses(status: string): string {
  return STATUS_BADGE_CLASSES[status] ?? FALLBACK_BADGE
}
