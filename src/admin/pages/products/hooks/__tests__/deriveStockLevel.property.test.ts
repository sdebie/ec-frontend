// Feature: admin-product-list-redesign, Property 5: StockLevel derivation from stockCount

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { deriveStockLevel } from '../../types'

/**
 * Property 5: StockLevel derivation from stockCount
 *
 * For any non-negative integer stockCount, deriveStockLevel(stockCount) SHALL return:
 * - OUT_OF_STOCK when stockCount === 0
 * - LOW_STOCK when 1 <= stockCount <= 10
 * - IN_STOCK when stockCount > 10
 *
 */

describe('deriveStockLevel — Property Tests', () => {
  it('returns OUT_OF_STOCK when stockCount is 0', () => {
    expect(deriveStockLevel(0)).toBe('OUT_OF_STOCK')
  })

  it('returns OUT_OF_STOCK for zero, LOW_STOCK for 1–10, IN_STOCK for > 10', () => {
    fc.assert(
      fc.property(fc.nat(), (stockCount) => {
        const result = deriveStockLevel(stockCount)

        if (stockCount === 0) {
          expect(result).toBe('OUT_OF_STOCK')
        } else if (stockCount >= 1 && stockCount <= 10) {
          expect(result).toBe('LOW_STOCK')
        } else {
          expect(result).toBe('IN_STOCK')
        }
      }),
      { numRuns: 100 },
    )
  })

  it('boundary: stockCount=10 is LOW_STOCK and stockCount=11 is IN_STOCK', () => {
    expect(deriveStockLevel(10)).toBe('LOW_STOCK')
    expect(deriveStockLevel(11)).toBe('IN_STOCK')
  })
})
