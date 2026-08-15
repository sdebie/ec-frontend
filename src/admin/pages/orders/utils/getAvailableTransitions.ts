import { OrderStatus } from '@/shared/types/enums/OrderStatus'

/**
 * Mirrors `OrderStatusEn.allowedTransitions()` on the backend, which is the
 * authority — the server rejects anything outside it. Keep the two in step so the
 * UI never offers an action the server will refuse.
 *
 * Only the staff map is mirrored. The moves the platform makes for itself —
 * checkout invoking the gateway, a payment landing or failing, the abandoned-order
 * sweep — live in `systemTransitions()` and deliberately have no button, because
 * anything reachable here is something a person can press.
 *
 * Each entry is one forward step plus, while the goods are still in the shop, the
 * two cancellations. No step can be skipped: an order reaches Delivered through
 * Processing, Ready to Ship and In Transit, and Collected through Processing and
 * Ready for Collection. Processing is the only fork, and after it the two paths
 * never cross.
 */
const CANCELS = [OrderStatus.USER_CANCELED, OrderStatus.ADMIN_CANCELED]
const REFUNDS = [OrderStatus.REFUNDED, OrderStatus.PARTIALLY_REFUNDED]

const transitionMap: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.CREATED]: [OrderStatus.IN_STORE_PAYMENT, ...CANCELS],
  [OrderStatus.PENDING_PAYMENT]: [OrderStatus.PAID, ...CANCELS],
  [OrderStatus.IN_STORE_PAYMENT]: [OrderStatus.PAID, ...CANCELS],
  [OrderStatus.PAYMENT_FAILED]: [...CANCELS],
  [OrderStatus.PAID]: [OrderStatus.PROCESSING, ...CANCELS],
  [OrderStatus.PROCESSING]: [
    OrderStatus.READY_TO_SHIP,
    OrderStatus.READY_FOR_COLLECTION,
    ...CANCELS,
  ],
  [OrderStatus.READY_TO_SHIP]: [OrderStatus.IN_TRANSIT, ...CANCELS],
  [OrderStatus.READY_FOR_COLLECTION]: [OrderStatus.COLLECTED, ...CANCELS],

  // Past dispatch there is nothing to cancel — the goods have gone out.
  [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED, OrderStatus.DELIVERY_FAILED],
  [OrderStatus.DELIVERY_FAILED]: [OrderStatus.IN_TRANSIT, OrderStatus.RETURNED_TO_ORIGIN],
  [OrderStatus.DELIVERED]: REFUNDS,
  [OrderStatus.COLLECTED]: REFUNDS,
  [OrderStatus.RETURNED_TO_ORIGIN]: REFUNDS,
  [OrderStatus.PARTIALLY_REFUNDED]: [OrderStatus.REFUNDED],

  // Terminal, plus the two legacy values no transition reaches.
  [OrderStatus.REFUNDED]: [],
  [OrderStatus.USER_CANCELED]: [],
  [OrderStatus.ADMIN_CANCELED]: [],
  [OrderStatus.SYSTEM_CANCELED]: [],
  [OrderStatus.FAILED]: [],
  [OrderStatus.PENDING]: [],
  [OrderStatus.CANCELLED]: [],
}

export function getAvailableTransitions(status: OrderStatus): OrderStatus[] {
  return transitionMap[status] ?? []
}
