import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { getAvailableTransitions } from '@/admin/pages/orders/utils/getAvailableTransitions'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'

/**
 * Feature: admin-order-management
 * Property 1: Valid status transitions
 *
 * For any OrderStatus value, the set of available transitions returned by
 * getAvailableTransitions(status) SHALL be exactly:
 * CREATED → [IN_STORE_PAYMENT, CANCELLED], PENDING → [IN_STORE_PAYMENT, CANCELLED],
 * PAID → [IN_TRANSIT, CANCELLED, REFUNDED],
 * IN_STORE_PAYMENT → [IN_TRANSIT, CANCELLED, REFUNDED], IN_TRANSIT → [DELIVERED],
 * DELIVERED → [REFUNDED], FAILED → [], SYSTEM_CANCELED → [],
 * CANCELLED → [], REFUNDED → [].
 * No other transitions are permitted.
 *
 * This map is the mirror of `OrderStatusEn.allowedTransitions()` in ec-common,
 * which is the authority — the server rejects anything the map below allows but
 * the enum does not. Changing either without the other is the failure this
 * suite cannot catch, so change them together.
 */

const expectedTransitionMap: Record<OrderStatus, OrderStatus[]> = {
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

/** Statuses an order can never leave by a staff action. */
const TERMINAL_STATUSES = [
  OrderStatus.CANCELLED,
  OrderStatus.SYSTEM_CANCELED,
  OrderStatus.REFUNDED,
  OrderStatus.FAILED,
]

describe('Feature: admin-order-management, Property 1: Valid status transitions', () => {
  it('getAvailableTransitions returns exactly the expected transitions for any OrderStatus', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(OrderStatus)),
        (status) => {
          const result = getAvailableTransitions(status)
          const expected = expectedTransitionMap[status]

          expect(new Set(result)).toEqual(new Set(expected))
          expect(result).toHaveLength(expected.length)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('never offers a target outside OrderStatus, and never a move to the status already held', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(OrderStatus)),
        (status) => {
          const result = getAvailableTransitions(status)

          expect(new Set(result).size).toBe(result.length)
          for (const target of result) {
            expect(Object.values(OrderStatus)).toContain(target)
            expect(target).not.toBe(status)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('offers nothing from a terminal status, so a closed order cannot be reopened', () => {
    for (const status of TERMINAL_STATUSES) {
      expect(getAvailableTransitions(status)).toEqual([])
    }
  })
})
