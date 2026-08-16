import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { getAvailableTransitions } from '@/admin/pages/orders/utils/getAvailableTransitions'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'

/**
 * Feature: admin-order-management
 * Property 1: Valid status transitions
 *
 * This map is the mirror of `OrderStatusEn.allowedTransitions()` in ec-common, which
 * is the authority — the server rejects anything the map below allows but the enum
 * does not. Changing either without the other is the failure this suite cannot catch,
 * so change them together; `OrderWorkflowTest` pins the same shape on the Java side.
 *
 * Two rules matter most, and both are asserted below rather than merely described:
 * no forward step may be skipped, and a terminal status offers nothing at all.
 */

const CANCELS = [OrderStatus.USER_CANCELED, OrderStatus.ADMIN_CANCELED]
const REFUNDS = [OrderStatus.REFUNDED, OrderStatus.PARTIALLY_REFUNDED]

const expectedTransitionMap: Record<OrderStatus, OrderStatus[]> = {
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
  [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED, OrderStatus.DELIVERY_FAILED],
  [OrderStatus.DELIVERY_FAILED]: [OrderStatus.IN_TRANSIT, OrderStatus.RETURNED_TO_ORIGIN],
  [OrderStatus.DELIVERED]: REFUNDS,
  [OrderStatus.COLLECTED]: REFUNDS,
  [OrderStatus.RETURNED_TO_ORIGIN]: REFUNDS,
  [OrderStatus.PARTIALLY_REFUNDED]: [OrderStatus.REFUNDED],
  [OrderStatus.REFUNDED]: [],
  [OrderStatus.USER_CANCELED]: [],
  [OrderStatus.ADMIN_CANCELED]: [],
  [OrderStatus.SYSTEM_CANCELED]: [],
  [OrderStatus.FAILED]: [],
  [OrderStatus.PENDING]: [],
  [OrderStatus.CANCELLED]: [],
}

/** Nothing leaves these, including the two legacy values no transition reaches. */
const TERMINAL_STATUSES = [
  OrderStatus.REFUNDED,
  OrderStatus.USER_CANCELED,
  OrderStatus.ADMIN_CANCELED,
  OrderStatus.SYSTEM_CANCELED,
  OrderStatus.FAILED,
  OrderStatus.PENDING,
  OrderStatus.CANCELLED,
]

/** The two fulfilment paths, in order. Each entry may reach only the next. */
const ONLINE_PATH = [
  OrderStatus.CREATED,
  OrderStatus.PENDING_PAYMENT,
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.READY_TO_SHIP,
  OrderStatus.IN_TRANSIT,
  OrderStatus.DELIVERED,
]

const IN_STORE_PATH = [
  OrderStatus.CREATED,
  OrderStatus.IN_STORE_PAYMENT,
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.READY_FOR_COLLECTION,
  OrderStatus.COLLECTED,
]

describe('Feature: admin-order-management, Property 1: Valid status transitions', () => {
  it('getAvailableTransitions returns exactly the expected transitions for any OrderStatus', () => {
    fc.assert(
      fc.property(fc.constantFrom(...Object.values(OrderStatus)), (status) => {
        const result = getAvailableTransitions(status)
        const expected = expectedTransitionMap[status]

        expect(new Set(result)).toEqual(new Set(expected))
        expect(result).toHaveLength(expected.length)
      }),
      { numRuns: 100 },
    )
  })

  it('never offers a target outside OrderStatus, and never a move to the status already held', () => {
    fc.assert(
      fc.property(fc.constantFrom(...Object.values(OrderStatus)), (status) => {
        const result = getAvailableTransitions(status)

        expect(new Set(result).size).toBe(result.length)
        for (const target of result) {
          expect(Object.values(OrderStatus)).toContain(target)
          expect(target).not.toBe(status)
        }
      }),
      { numRuns: 100 },
    )
  })

  it('offers nothing from a terminal status, so a closed order cannot be reopened', () => {
    for (const status of TERMINAL_STATUSES) {
      expect(getAvailableTransitions(status)).toEqual([])
    }
  })

  /**
   * The UI half of "no step may be skipped". Offering a shortcut here would put a
   * button in front of staff that records fulfilment work nobody performed — and the
   * server would refuse it, so the button would simply fail.
   */
  it('offers no forward jump that skips a step, on either path', () => {
    for (const path of [ONLINE_PATH, IN_STORE_PATH]) {
      for (let from = 0; from < path.length; from++) {
        for (let to = from + 2; to < path.length; to++) {
          expect(getAvailableTransitions(path[from])).not.toContain(path[to])
        }
      }
    }
  })

  it('offers no move backwards through either path', () => {
    for (const path of [ONLINE_PATH, IN_STORE_PATH]) {
      for (let from = 0; from < path.length; from++) {
        for (let to = 0; to < from; to++) {
          expect(getAvailableTransitions(path[from])).not.toContain(path[to])
        }
      }
    }
  })

  it('walks each path end to end, one step at a time', () => {
    for (const path of [ONLINE_PATH, IN_STORE_PATH]) {
      for (let i = 0; i < path.length - 1; i++) {
        // CREATED → PENDING_PAYMENT is made by checkout, not by staff, so it is the
        // one step with no button; every other step must be offered.
        if (path[i] === OrderStatus.CREATED && path[i + 1] === OrderStatus.PENDING_PAYMENT) {
          continue
        }
        expect(getAvailableTransitions(path[i])).toContain(path[i + 1])
      }
    }
  })

  it('never lets the delivery and collection paths cross after they fork', () => {
    expect(getAvailableTransitions(OrderStatus.READY_TO_SHIP)).not.toContain(OrderStatus.COLLECTED)
    expect(getAvailableTransitions(OrderStatus.READY_FOR_COLLECTION)).not.toContain(
      OrderStatus.IN_TRANSIT,
    )
    expect(getAvailableTransitions(OrderStatus.IN_TRANSIT)).not.toContain(OrderStatus.COLLECTED)
    expect(getAvailableTransitions(OrderStatus.READY_FOR_COLLECTION)).not.toContain(
      OrderStatus.DELIVERED,
    )
  })

  /**
   * Cancelling restores the order's stock, so it must never be offered once the goods
   * have left. Pinned as an equivalence in both directions rather than a spot check.
   */
  it('offers cancellation exactly while the goods are still in the shop', () => {
    const stillInShop: OrderStatus[] = [
      OrderStatus.CREATED,
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.IN_STORE_PAYMENT,
      OrderStatus.PAYMENT_FAILED,
      OrderStatus.PAID,
      OrderStatus.PROCESSING,
      OrderStatus.READY_TO_SHIP,
      OrderStatus.READY_FOR_COLLECTION,
    ]

    for (const status of Object.values(OrderStatus)) {
      const offersCancel = CANCELS.some((c) => getAvailableTransitions(status).includes(c))
      expect(offersCancel).toBe(stillInShop.includes(status))
    }
  })
})
