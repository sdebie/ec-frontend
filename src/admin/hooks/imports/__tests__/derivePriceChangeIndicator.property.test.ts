// Feature: admin-product-import, Property 6: Price review change-indicator derivation

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { derivePriceChangeIndicator } from '../utils'
import type { ProductPriceComparisonDto } from '../types'

/**
 * Validates: Requirements 7.2
 */
describe('derivePriceChangeIndicator — Property Tests', () => {
  const productPriceComparisonArb = fc.record({
    stagedId: fc.uuid(),
    sku: fc.string(),
    validationStatus: fc.constantFrom('VALID' as const, 'INVALID' as const),
    validationErrors: fc.array(fc.string()),
    hasChanges: fc.boolean(),
    currentRetailPrice: fc.oneof(fc.constant(null), fc.nat()),
    proposedRetailPrice: fc.nat(),
    currentWholesalePrice: fc.oneof(fc.constant(null), fc.nat()),
    proposedWholesalePrice: fc.oneof(fc.constant(null), fc.nat()),
  })

  it('returns "Changed" when hasChanges is true, "No Change" when false', () => {
    fc.assert(
      fc.property(
        productPriceComparisonArb,
        (row: ProductPriceComparisonDto) => {
          const result = derivePriceChangeIndicator(row)

          if (row.hasChanges) {
            expect(result).toBe('Changed')
          } else {
            expect(result).toBe('No Change')
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})
