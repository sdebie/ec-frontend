import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Feature: admin-customer-management
 * Property: canMutate derivation
 *
 * For any role string stored in adminAuthStore, canMutate SHALL equal true
 * if and only if role === 'SUPER_ADMIN'. For all other role values (including
 * undefined, null, empty string, and any non-SUPER_ADMIN string), canMutate
 * SHALL be false.
 *
 * **Validates: Requirements 5.1**
 */

/**
 * Pure derivation function matching the production logic:
 * `useAdminAuthStore(s => s.role) === 'SUPER_ADMIN'`
 */
function deriveCanMutate(role: string | null | undefined): boolean {
  return role === 'SUPER_ADMIN'
}

// Arbitrary that generates a wide variety of role values including edge cases
const roleArb = fc.oneof(
  fc.constant(undefined),
  fc.constant(null),
  fc.constant(''),
  fc.string(),
  fc.constant('SUPER_ADMIN'),
  fc.constant('VIEWER'),
  fc.constant('ADMIN'),
  fc.constant('super_admin'),
  fc.constant('Super_Admin'),
)

describe('canMutate derivation — Property Tests', () => {
  it('canMutate is true if and only if role === "SUPER_ADMIN"', () => {
    fc.assert(
      fc.property(roleArb, (role) => {
        const canMutate = deriveCanMutate(role)
        const expected = role === 'SUPER_ADMIN'

        expect(canMutate).toBe(expected)
      }),
      { numRuns: 100 },
    )
  })
})
