// Feature: admin-product-import, Property 4: Product review change-type derivation

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { deriveChangeType } from '../utils'
import type { ProductComparisonDto, ValidationStatus } from '../types'

/**
 * Property 4: Product review change-type derivation
 *
 * For any ProductComparisonDto, deriveChangeType SHALL return:
 * - 'New Product' when isNewProduct is true (regardless of other flags)
 * - 'New Variant' when isNewVariant is true (and isNewProduct is false)
 * - 'Update' when hasChanges is true (and neither new flag is true)
 * - 'No Change' otherwise
 *
 * **Validates: Requirements 4.2**
 */

const validationStatusArb: fc.Arbitrary<ValidationStatus> = fc.constantFrom('VALID' as const, 'INVALID' as const)

function buildProductComparisonDto(
  isNewProduct: boolean,
  isNewVariant: boolean,
  hasChanges: boolean,
): ProductComparisonDto {
  return {
    stagedId: 'staged-1',
    sku: 'SKU-001',
    validationStatus: 'VALID',
    validationErrors: null,
    imageErrors: null,
    isNewProduct,
    isNewVariant,
    hasChanges,
    currentName: null,
    proposedName: 'Product',
    currentDescription: null,
    proposedDescription: 'Description',
    currentStock: null,
    proposedStock: 10,
    currentImages: null,
    proposedImages: 'front.jpg,back.jpg',
    currentAttributes: null,
    proposedAttributes: '{"size":"M"}',
  }
}

describe('Feature: admin-product-import, Property 4: Product review change-type derivation', () => {
  it('returns "New Product" when isNewProduct is true, regardless of other flags', () => {
    fc.assert(
      fc.property(fc.boolean(), fc.boolean(), (isNewVariant, hasChanges) => {
        const row = buildProductComparisonDto(true, isNewVariant, hasChanges)
        expect(deriveChangeType(row)).toBe('New Product')
      }),
      { numRuns: 100 },
    )
  })

  it('returns "New Variant" when isNewProduct is false and isNewVariant is true, regardless of hasChanges', () => {
    fc.assert(
      fc.property(fc.boolean(), (hasChanges) => {
        const row = buildProductComparisonDto(false, true, hasChanges)
        expect(deriveChangeType(row)).toBe('New Variant')
      }),
      { numRuns: 100 },
    )
  })

  it('returns "Update" when isNewProduct is false, isNewVariant is false, and hasChanges is true', () => {
    fc.assert(
      fc.property(validationStatusArb, (validationStatus) => {
        const row = buildProductComparisonDto(false, false, true)
        row.validationStatus = validationStatus
        expect(deriveChangeType(row)).toBe('Update')
      }),
      { numRuns: 100 },
    )
  })

  it('returns "No Change" when all flags are false', () => {
    fc.assert(
      fc.property(validationStatusArb, (validationStatus) => {
        const row = buildProductComparisonDto(false, false, false)
        row.validationStatus = validationStatus
        expect(deriveChangeType(row)).toBe('No Change')
      }),
      { numRuns: 100 },
    )
  })

  it('priority order holds for any combination of boolean flags', () => {
    fc.assert(
      fc.property(fc.boolean(), fc.boolean(), fc.boolean(), (isNewProduct, isNewVariant, hasChanges) => {
        const row = buildProductComparisonDto(isNewProduct, isNewVariant, hasChanges)
        const result = deriveChangeType(row)

        if (isNewProduct) {
          expect(result).toBe('New Product')
        } else if (isNewVariant) {
          expect(result).toBe('New Variant')
        } else if (hasChanges) {
          expect(result).toBe('Update')
        } else {
          expect(result).toBe('No Change')
        }
      }),
      { numRuns: 100 },
    )
  })
})
