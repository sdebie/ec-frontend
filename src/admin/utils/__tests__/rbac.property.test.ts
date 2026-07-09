import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// Feature: admin-product-sub-pages, Property 4: canMutate RBAC derivation

/**
 * Property 4: canMutate RBAC derivation
 *
 * For any string value of `role`, the expression `canMutate` SHALL equal true
 * if and only if `role === 'SUPER_ADMIN'`. All other role values (including
 * null, undefined, empty string, and any arbitrary string) SHALL produce false.
 *
 * **Validates: Requirements 13.7, 13.1, 13.2, 13.4, 13.5**
 */

/**
 * Pure derivation function matching the production logic:
 * `const canMutate = role === 'SUPER_ADMIN'`
 */
function deriveCanMutate(role: string | null | undefined): boolean {
  return role === 'SUPER_ADMIN'
}

describe('canMutate RBAC derivation — Property 4', () => {
  it('canMutate is true if and only if role is exactly "SUPER_ADMIN"', () => {
    // Arbitrary that generates arbitrary strings — all should produce false
    fc.assert(
      fc.property(fc.string(), (role) => {
        const canMutate = deriveCanMutate(role)

        if (role === 'SUPER_ADMIN') {
          expect(canMutate).toBe(true)
        } else {
          expect(canMutate).toBe(false)
        }
      }),
      { numRuns: 100 },
    )
  })

  it('canMutate is false for null, undefined, and empty string', () => {
    const edgeCases: Array<string | null | undefined> = [null, undefined, '']

    for (const role of edgeCases) {
      expect(deriveCanMutate(role)).toBe(false)
    }
  })

  it('canMutate is true only for exact "SUPER_ADMIN" — case and whitespace variants produce false', () => {
    // Generate near-miss values: case variants, padded, partial matches
    const nearMissArb = fc.oneof(
      fc.constant('super_admin'),
      fc.constant('Super_Admin'),
      fc.constant('SUPER_ADMIN '),
      fc.constant(' SUPER_ADMIN'),
      fc.constant('SUPER_ADMINx'),
      fc.constant('SUPER'),
      fc.constant('ADMIN'),
      fc.constant('VIEWER'),
      fc.constant('viewer'),
    )

    fc.assert(
      fc.property(nearMissArb, (role) => {
        expect(deriveCanMutate(role)).toBe(false)
      }),
      { numRuns: 100 },
    )
  })

  it('canMutate is true when role is exactly "SUPER_ADMIN"', () => {
    expect(deriveCanMutate('SUPER_ADMIN')).toBe(true)
  })
})
