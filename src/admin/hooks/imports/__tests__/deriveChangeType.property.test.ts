// Feature: admin-product-import, Property 4: Product review change-type derivation

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { deriveChangeType } from '../utils'
import type { ProductComparisonDto, ValidationStatus } from '../types'

/**
 * Property 4: Product review change-type derivation
 *
 * For any ProductComparisonDto, deriveChangeType SHALL return:
 * - 'New Product' when newProduct is true (regardless of other flags)
 * - 'New Variant' when newVariant is true (and newProduct is false)
 * - 'Update' when hasChanges is true (and neither new flag is true)
 * - 'No Change' otherwise
 *
 */

const validationStatusArb: fc.Arbitrary<ValidationStatus> = fc.constantFrom('VALID' as const, 'INVALID' as const)

function buildProductComparisonDto(
  newProduct: boolean,
  newVariant: boolean,
  hasChanges: boolean,
): ProductComparisonDto {
  return {
    stagedId: 'staged-1',
    sku: 'SKU-001',
    validationStatus: 'VALID',
    validationErrors: null,
    imageErrors: null,
    newProduct,
    newVariant,
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
  it('returns "New Product" when newProduct is true, regardless of other flags', () => {
    fc.assert(
      fc.property(fc.boolean(), fc.boolean(), (newVariant, hasChanges) => {
        const row = buildProductComparisonDto(true, newVariant, hasChanges)
        expect(deriveChangeType(row)).toBe('New Product')
      }),
      { numRuns: 100 },
    )
  })

  it('returns "New Variant" when newProduct is false and newVariant is true, regardless of hasChanges', () => {
    fc.assert(
      fc.property(fc.boolean(), (hasChanges) => {
        const row = buildProductComparisonDto(false, true, hasChanges)
        expect(deriveChangeType(row)).toBe('New Variant')
      }),
      { numRuns: 100 },
    )
  })

  it('returns "Update" when newProduct is false, newVariant is false, and hasChanges is true', () => {
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
      fc.property(fc.boolean(), fc.boolean(), fc.boolean(), (newProduct, newVariant, hasChanges) => {
        const row = buildProductComparisonDto(newProduct, newVariant, hasChanges)
        const result = deriveChangeType(row)

        if (newProduct) {
          expect(result).toBe('New Product')
        } else if (newVariant) {
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
