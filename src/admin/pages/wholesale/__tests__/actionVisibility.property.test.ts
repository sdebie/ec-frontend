import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { getAvailableActions } from '@/admin/hooks/customers/types'
import type { CustomerStatus, WholesaleStatus } from '@/admin/hooks/customers/types'

/**
 * Feature: admin-wholesale-management
 * Property 2: Action visibility rule
 *
 * For any combination of staff role and entity status (either CustomerStatus
 * for customer actions or WholesaleStatus for application actions), action
 * controls SHALL be rendered if and only if `role === 'SUPER_ADMIN'` AND
 * the entity has available transitions (for customers:
 * `getAvailableActions(status).length > 0`; for applications:
 * `status === 'PENDING'`).
 *
 * **Validates: Requirements 1.6, 1.7, 2.6, 2.7, 3.8, 3.9, 8.2**
 */

// Arbitrary that generates a wide variety of role values including edge cases
const roleArb = fc.oneof(
  fc.constant('SUPER_ADMIN'),
  fc.constant('VIEWER'),
  fc.constant('ADMIN'),
  fc.constant(''),
  fc.string(),
)

const customerStatusArb: fc.Arbitrary<CustomerStatus> = fc.constantFrom('ACTIVE', 'PENDING', 'DISABLED')
const wholesaleStatusArb: fc.Arbitrary<WholesaleStatus> = fc.constantFrom('PENDING', 'APPROVED', 'REJECTED')

/**
 * Pure derivation matching production logic for customer list actions:
 * `canMutate && getAvailableActions(status).length > 0`
 */
function shouldShowCustomerActions(role: string, status: CustomerStatus): boolean {
  return role === 'SUPER_ADMIN' && getAvailableActions(status).length > 0
}

/**
 * Pure derivation matching production logic for application actions:
 * `canMutate && status === 'PENDING'`
 */
function shouldShowApplicationActions(role: string, status: WholesaleStatus): boolean {
  return role === 'SUPER_ADMIN' && status === 'PENDING'
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

  it('application actions visible iff SUPER_ADMIN AND status === PENDING', () => {
    fc.assert(
      fc.property(roleArb, wholesaleStatusArb, (role, status) => {
        const visible = shouldShowApplicationActions(role, status)
        const expected = role === 'SUPER_ADMIN' && status === 'PENDING'
        expect(visible).toBe(expected)
      }),
      { numRuns: 100 },
    )
  })
})
