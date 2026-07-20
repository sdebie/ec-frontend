import { OrderStatus } from '@/shared/types/enums/OrderStatus'

const transitionMap: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED, OrderStatus.REFUNDED],
  [OrderStatus.IN_STORE_PAYMENT]: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED, OrderStatus.REFUNDED],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
  [OrderStatus.CREATED]: [],
  [OrderStatus.FAILED]: [],
  [OrderStatus.SYSTEM_CANCELED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
}

export function getAvailableTransitions(status: OrderStatus): OrderStatus[] {
  return transitionMap[status] ?? []
}
