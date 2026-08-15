/**
 * Mirrors `OrderStatusEn` in ec-common. An order walks one of two paths, a step at
 * a time:
 *
 *   delivery:   CREATED → PENDING_PAYMENT  → PAID → PROCESSING → READY_TO_SHIP        → IN_TRANSIT → DELIVERED
 *   collection: CREATED → IN_STORE_PAYMENT → PAID → PROCESSING → READY_FOR_COLLECTION → COLLECTED
 *
 * PENDING and CANCELLED are legacy values kept so historic orders still render; no
 * transition reaches either, and neither may be used for new work.
 */
export const OrderStatus = {
  CREATED: 'CREATED',
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  IN_STORE_PAYMENT: 'IN_STORE_PAYMENT',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAID: 'PAID',
  PROCESSING: 'PROCESSING',
  READY_TO_SHIP: 'READY_TO_SHIP',
  READY_FOR_COLLECTION: 'READY_FOR_COLLECTION',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERY_FAILED: 'DELIVERY_FAILED',
  RETURNED_TO_ORIGIN: 'RETURNED_TO_ORIGIN',
  DELIVERED: 'DELIVERED',
  COLLECTED: 'COLLECTED',
  USER_CANCELED: 'USER_CANCELED',
  ADMIN_CANCELED: 'ADMIN_CANCELED',
  SYSTEM_CANCELED: 'SYSTEM_CANCELED',
  FAILED: 'FAILED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  REFUNDED: 'REFUNDED',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const OrderStatusOptions: Record<OrderStatus, { label: string; color: string }> = {
  [OrderStatus.CREATED]: { label: 'Created', color: 'gray' },
  [OrderStatus.PENDING_PAYMENT]: { label: 'Awaiting Payment', color: 'yellow' },
  [OrderStatus.IN_STORE_PAYMENT]: { label: 'Awaiting In-Store Payment', color: 'yellow' },
  [OrderStatus.PAYMENT_FAILED]: { label: 'Payment Failed', color: 'red' },
  [OrderStatus.PAID]: { label: 'Paid', color: 'green' },
  [OrderStatus.PROCESSING]: { label: 'Processing', color: 'blue' },
  [OrderStatus.READY_TO_SHIP]: { label: 'Ready to Ship', color: 'blue' },
  [OrderStatus.READY_FOR_COLLECTION]: { label: 'Ready for Collection', color: 'blue' },
  [OrderStatus.IN_TRANSIT]: { label: 'In Transit', color: 'blue' },
  [OrderStatus.DELIVERY_FAILED]: { label: 'Delivery Failed', color: 'red' },
  [OrderStatus.RETURNED_TO_ORIGIN]: { label: 'Returned to Store', color: 'orange' },
  [OrderStatus.DELIVERED]: { label: 'Delivered', color: 'green' },
  [OrderStatus.COLLECTED]: { label: 'Collected', color: 'green' },
  [OrderStatus.USER_CANCELED]: { label: 'Cancelled by Customer', color: 'red' },
  [OrderStatus.ADMIN_CANCELED]: { label: 'Cancelled by Staff', color: 'red' },
  [OrderStatus.SYSTEM_CANCELED]: { label: 'Cancelled — Not Paid', color: 'red' },
  [OrderStatus.FAILED]: { label: 'Failed', color: 'red' },
  [OrderStatus.PARTIALLY_REFUNDED]: { label: 'Partially Refunded', color: 'orange' },
  [OrderStatus.REFUNDED]: { label: 'Refunded', color: 'orange' },
  [OrderStatus.PENDING]: { label: 'Pending', color: 'gray' },
  [OrderStatus.CANCELLED]: { label: 'Cancelled', color: 'red' },
}
