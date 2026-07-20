import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { getStatCardSubtitle } from '../ProductListPage'

// Feature: admin-product-list-redesign, Property 1: Stat card percentage calculation

/**
 * Property 1: Stat card percentage calculation
 *
 * For any ProductStats where total > 0, each stat card's displayed percentage
 * SHALL equal Math.round((cardCount / total) * 100) appended with "% of total"
 * — and the Total card SHALL display "View all products" instead.
 *
 * **Validates: Requirements 2.2**
 */

describe('Stat card percentage calculation — Property Tests', () => {
  it('non-total cards display correct percentage when total > 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000 }),
        fc.integer({ min: 0, max: 100000 }),
        (total, rawCardCount) => {
          const cardCount = Math.min(rawCardCount, total)
          const result = getStatCardSubtitle(cardCount, total, false)
          const expectedPercentage = Math.round((cardCount / total) * 100)
          const expected = `${expectedPercentage}% of total`

          expect(result).toBe(expected)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('total card always shows "View all products" regardless of counts', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100000 }),
        fc.integer({ min: 0, max: 100000 }),
        (total, cardCount) => {
          const result = getStatCardSubtitle(cardCount, total, true)

          expect(result).toBe('View all products')
        },
      ),
      { numRuns: 100 },
    )
  })

  it('returns "0% of total" when total is 0 (special case)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100000 }),
        (cardCount) => {
          const result = getStatCardSubtitle(cardCount, 0, false)

          expect(result).toBe('0% of total')
        },
      ),
      { numRuns: 100 },
    )
  })
})
