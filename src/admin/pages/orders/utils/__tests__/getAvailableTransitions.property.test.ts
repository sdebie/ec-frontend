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
 * PENDING → [CANCELLED], PAID → [IN_TRANSIT, CANCELLED, REFUNDED],
 * IN_STORE_PAYMENT → [IN_TRANSIT, CANCELLED, REFUNDED], IN_TRANSIT → [DELIVERED],
 * DELIVERED → [REFUNDED], CREATED → [], FAILED → [], SYSTEM_CANCELED → [],
 * CANCELLED → [], REFUNDED → [].
 * No other transitions are permitted.
 *
 * **Validates: Requirements 3.1**
 */

const expectedTransitionMap: Record<OrderStatus, OrderStatus[]> = {
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
})
