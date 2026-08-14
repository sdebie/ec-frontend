import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { getAvailableActions } from '@/admin/hooks/customers/types'
import { roleCan } from '@/shared/auth/adminPermissions'
import type { CustomerStatus, WholesaleStatus } from '@/admin/hooks/customers/types'

/**
 * Feature: admin-wholesale-management
 * Property 2: Action visibility rule
 *
 * For any combination of staff role and entity status (either CustomerStatus
 * for customer actions or WholesaleStatus for application actions), action
 * controls SHALL be rendered if and only if the role may mutate AND the
 * entity has available transitions. Customer account actions require
 * `role === 'SUPER_ADMIN'` (backend updateCustomerStatus) with
 * `getAvailableActions(status).length > 0`; application decisions require
 * `SUPER_ADMIN` or `ORDER_MANAGER` (backend approve/rejectWholesaleApplication)
 * with `status === 'PENDING'`.
 *
 * **Validates: Requirements 1.6, 1.7, 2.6, 2.7, 3.8, 3.9, 8.2**
 */

// Arbitrary that generates a wide variety of role values including edge cases
const roleArb = fc.oneof(
  fc.constant('SUPER_ADMIN'),
  fc.constant('ORDER_MANAGER'),
  fc.constant('CATALOG_MANAGER'),
  fc.constant('VIEWER'),
  fc.constant('ADMIN'),
  fc.constant(''),
  fc.string(),
)

const customerStatusArb: fc.Arbitrary<CustomerStatus> = fc.constantFrom('ACTIVE', 'PENDING', 'DISABLED')
const wholesaleStatusArb: fc.Arbitrary<WholesaleStatus> = fc.constantFrom('PENDING', 'APPROVED', 'REJECTED')

// Production derivations, composed from the real capability rule the pages use.
function shouldShowCustomerActions(role: string, status: CustomerStatus): boolean {
  return roleCan(role, 'customer:write') && getAvailableActions(status).length > 0
}

function shouldShowApplicationActions(role: string, status: WholesaleStatus): boolean {
  return roleCan(role, 'wholesale-application:decide') && status === 'PENDING'
}

describe('Feature: admin-wholesale-management, Property 2: Action visibility rule', () => {
  it('customer actions visible iff SUPER_ADMIN AND getAvailableActions(status).length > 0', () => {
    fc.assert(
      fc.property(roleArb, customerStatusArb, (role, status) => {
        const visible = shouldShowCustomerActions(role, status)
        const expected = role === 'SUPER_ADMIN' && getAvailableActions(status).length > 0
        expect(visible).toBe(expected)
      }),
      { numRuns: 100 },
    )
  })

  it('application actions visible iff (SUPER_ADMIN or ORDER_MANAGER) AND status === PENDING', () => {
    fc.assert(
      fc.property(roleArb, wholesaleStatusArb, (role, status) => {
        const visible = shouldShowApplicationActions(role, status)
        const expected =
          (role === 'SUPER_ADMIN' || role === 'ORDER_MANAGER') &&
          status === 'PENDING'
        expect(visible).toBe(expected)
      }),
      { numRuns: 100 },
    )
  })
})
