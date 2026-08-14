import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { formatAmount } from '@/shared/utils/formatAmount'

/**
 * Feature: admin-order-management
 * Property 6: Currency formatting consistency
 *
 * For any numeric monetary value displayed in the order management pages,
 * the rendered output SHALL equal the result of calling formatAmount(value) —
 * no manual formatting, rounding, or currency symbol injection is permitted.
 *
 * This test validates that formatAmount is a pure, total function over numeric
 * inputs: it never throws, always returns a non-empty string, and produces
 * deterministic output (calling it twice with the same value yields the same result).
 *
 */

// Arbitrary that generates monetary values in a realistic range
const monetaryValueArb = fc.double({ min: 0, max: 1_000_000, noNaN: true })

describe('Currency formatting consistency — Property Tests', () => {
  it('formatAmount never throws and always returns a non-empty string for any monetary value', () => {
    fc.assert(
      fc.property(monetaryValueArb, (value) => {
        const result = formatAmount(value)

        // formatAmount must not throw (if it did, we wouldn't reach here)
        // Result must be a string
        expect(typeof result).toBe('string')

        // Result must not be empty
        expect(result.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 },
    )
  })

  it('formatAmount is deterministic — same input always produces same output', () => {
    fc.assert(
      fc.property(monetaryValueArb, (value) => {
        const first = formatAmount(value)
        const second = formatAmount(value)

        // Pure function: identical inputs produce identical outputs
        expect(first).toBe(second)
      }),
      { numRuns: 100 },
    )
  })

  it('formatAmount output contains a formatted numeric representation', () => {
    fc.assert(
      fc.property(monetaryValueArb, (value) => {
        const result = formatAmount(value)

        // The result should not be the fallback dash (which is reserved for null/undefined/NaN)
        // Since we generate valid numbers with noNaN: true, we should never get '-'
        expect(result).not.toBe('-')

        // The result should contain at least one digit from the formatted value
        expect(result).toMatch(/\d/)
      }),
      { numRuns: 100 },
    )
  })
})
