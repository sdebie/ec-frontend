export const OrderStatus = {
  CREATED: 'CREATED',
  PENDING: 'PENDING',
  PAID: 'PAID',
  IN_STORE_PAYMENT: 'IN_STORE_PAYMENT',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  SYSTEM_CANCELED: 'SYSTEM_CANCELED',
  REFUNDED: 'REFUNDED',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const OrderStatusOptions: Record<OrderStatus, { label: string; color: string }> = {
  [OrderStatus.CREATED]: { label: 'Created', color: 'gray' },
  [OrderStatus.PENDING]: { label: 'Pending', color: 'yellow' },
  [OrderStatus.PAID]: { label: 'Paid', color: 'green' },
  [OrderStatus.IN_STORE_PAYMENT]: { label: 'In-store Payment', color: 'blue' },
  [OrderStatus.IN_TRANSIT]: { label: 'In Transit', color: 'blue' },
  [OrderStatus.DELIVERED]: { label: 'Delivered', color: 'green' },
  [OrderStatus.CANCELLED]: { label: 'Cancelled', color: 'red' },
  [OrderStatus.FAILED]: { label: 'Failed', color: 'red' },
  [OrderStatus.SYSTEM_CANCELED]: { label: 'System Cancelled', color: 'red' },
  [OrderStatus.REFUNDED]: { label: 'Refunded', color: 'orange' },
}
