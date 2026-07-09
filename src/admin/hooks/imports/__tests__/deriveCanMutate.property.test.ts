// Feature: admin-product-import, Property 7: canMutate derivation

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { deriveCanMutate } from '../utils'

/**
 * Validates: Requirements 9.1
 */
describe('deriveCanMutate — Property Tests', () => {
  it('returns true if and only if role === "SUPER_ADMIN"', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant(null), fc.string()),
        (role: string | null) => {
          const result = deriveCanMutate(role)

          if (role === 'SUPER_ADMIN') {
            expect(result).toBe(true)
          } else {
            expect(result).toBe(false)
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('explicitly returns true for SUPER_ADMIN', () => {
    expect(deriveCanMutate('SUPER_ADMIN')).toBe(true)
  })

  it('explicitly returns false for VIEWER, null, and empty string', () => {
    expect(deriveCanMutate('VIEWER')).toBe(false)
    expect(deriveCanMutate(null)).toBe(false)
    expect(deriveCanMutate('')).toBe(false)
  })
})
