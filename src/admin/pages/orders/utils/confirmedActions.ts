import { OrderStatus } from '@/shared/types/enums/OrderStatus'

/**
 * Status changes that ask before they run: the two destructive ones, and
 * marking an order paid in store — that one emails the customer their order
 * confirmation. Shared by the list and detail pages so both warn identically.
 *
 * Ship and Deliver are deliberately absent: they are reversible-by-forward-
 * transition and carry no outward-facing side effect.
 */
export const CONFIRMED_ACTIONS = {
  'mark-paid-in-store': {
    status: OrderStatus.IN_STORE_PAYMENT,
    title: 'Mark Paid In Store',
    description:
      'This marks the order as paid in store and emails the customer their order confirmation.',
    confirmLabel: 'Mark Paid In Store',
    variant: 'default',
  },
  cancel: {
    status: OrderStatus.CANCELLED,
    title: 'Cancel Order',
    description: 'Are you sure you want to cancel this order?',
    confirmLabel: 'Cancel Order',
    variant: 'danger',
  },
  refund: {
    status: OrderStatus.REFUNDED,
    title: 'Refund Order',
    description:
      'This records the order as refunded. It does not move any money — process the refund with the payment provider separately.',
    confirmLabel: 'Refund Order',
    variant: 'danger',
  },
} as const

export type ConfirmedAction = keyof typeof CONFIRMED_ACTIONS

/**
 * Whether the goods are still with the store, given only the order's status.
 * Mirrors `OrderStatusEn.isPreDispatch()` — keep the two in step.
 *
 * This picks the *default* for the refund prompt and is never the answer itself.
 * Status lags reality: an order dispatched without being moved to In Transit still
 * reads Paid, so deciding from status alone would return stock for goods that have
 * already gone and overstate what is available to sell. The staff member issuing the
 * refund is the only one who knows, so they confirm it.
 */
export function defaultRestockForStatus(status: OrderStatus): boolean {
  return (
    status === OrderStatus.CREATED ||
    status === OrderStatus.PENDING ||
    status === OrderStatus.PAID ||
    status === OrderStatus.IN_STORE_PAYMENT
  )
}
