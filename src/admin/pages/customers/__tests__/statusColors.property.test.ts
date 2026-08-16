import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  getCustomerStatusColor,
  getWholesaleStatusColor,
  type CustomerStatus,
  type WholesaleStatus,
} from '@/admin/pages/customers/types'

/**
 * Feature: admin-wholesale-management
 * Property 4: Status color mapping correctness
 *
 * For any CustomerStatus: ACTIVE→green, PENDING→yellow, DISABLED→red
 * For any WholesaleStatus: APPROVED→green, PENDING→yellow, REJECTED→red
 *
 */

const customerStatusArb: fc.Arbitrary<CustomerStatus> = fc.constantFrom(
  'ACTIVE' as const,
  'PENDING' as const,
  'DISABLED' as const,
)

const wholesaleStatusArb: fc.Arbitrary<WholesaleStatus> = fc.constantFrom(
  'APPROVED' as const,
  'PENDING' as const,
  'REJECTED' as const,
)

const expectedCustomerColors: Record<CustomerStatus, 'green' | 'yellow' | 'red'> = {
  ACTIVE: 'green',
  PENDING: 'yellow',
  DISABLED: 'red',
}

const expectedWholesaleColors: Record<WholesaleStatus, 'green' | 'yellow' | 'red'> = {
  APPROVED: 'green',
  PENDING: 'yellow',
  REJECTED: 'red',
}

describe('Feature: admin-wholesale-management, Property 4: Status color mapping correctness', () => {
  it('getCustomerStatusColor returns correct color for each CustomerStatus', () => {
    fc.assert(
      fc.property(customerStatusArb, (status) => {
        const color = getCustomerStatusColor(status)
        expect(color).toBe(expectedCustomerColors[status])
      }),
      { numRuns: 100 },
    )
  })

  it('getWholesaleStatusColor returns correct color for each WholesaleStatus', () => {
    fc.assert(
      fc.property(wholesaleStatusArb, (status) => {
        const color = getWholesaleStatusColor(status)
        expect(color).toBe(expectedWholesaleColors[status])
      }),
      { numRuns: 100 },
    )
  })
})
