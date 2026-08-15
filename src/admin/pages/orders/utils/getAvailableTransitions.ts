import { OrderStatus } from '@/shared/types/enums/OrderStatus'

/**
 * Mirrors `OrderStatusEn.allowedTransitions()` on the backend, which is the
 * authority — the server rejects anything outside it. Keep the two in step so
 * the UI never offers an action the server will refuse.
 */
const transitionMap: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.CREATED]: [OrderStatus.IN_STORE_PAYMENT, OrderStatus.CANCELLED],
  [OrderStatus.PENDING]: [OrderStatus.IN_STORE_PAYMENT, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED, OrderStatus.REFUNDED],
  [OrderStatus.IN_STORE_PAYMENT]: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED, OrderStatus.REFUNDED],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
  [OrderStatus.FAILED]: [],
  [OrderStatus.SYSTEM_CANCELED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
}

export function getAvailableTransitions(status: OrderStatus): OrderStatus[] {
  return transitionMap[status] ?? []
}
