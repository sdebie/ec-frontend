// Feature: admin-product-import, Property 5: Product review summary computation

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { computeProductReviewSummary } from '../utils'
import type { ProductComparisonDto, ValidationStatus } from '../types'

/**
 * Validates: Requirements 4.5
 */
describe('computeProductReviewSummary — Property Tests', () => {
  const productComparisonArbitrary: fc.Arbitrary<ProductComparisonDto> = fc.record({
    stagedId: fc.uuid(),
    sku: fc.option(fc.string(), { nil: null }),
    validationStatus: fc.constantFrom<ValidationStatus>('VALID', 'INVALID'),
    validationErrors: fc.option(fc.string(), { nil: null }),
    imageErrors: fc.option(fc.string(), { nil: null }),
    newProduct: fc.boolean(),
    newVariant: fc.boolean(),
    hasChanges: fc.boolean(),
    currentName: fc.option(fc.string(), { nil: null }),
    proposedName: fc.option(fc.string(), { nil: null }),
    currentDescription: fc.option(fc.string(), { nil: null }),
    proposedDescription: fc.option(fc.string(), { nil: null }),
    currentStock: fc.option(fc.nat(), { nil: null }),
    proposedStock: fc.option(fc.nat(), { nil: null }),
    currentImages: fc.option(fc.string(), { nil: null }),
    proposedImages: fc.option(fc.string(), { nil: null }),
    currentAttributes: fc.option(fc.string(), { nil: null }),
    proposedAttributes: fc.option(fc.string(), { nil: null }),
  })

  it('total equals array length', () => {
    fc.assert(
      fc.property(fc.array(productComparisonArbitrary), (rows) => {
        const summary = computeProductReviewSummary(rows)
        expect(summary.total).toBe(rows.length)
      }),
      { numRuns: 100 },
    )
  })

  it('valid equals count of rows with VALID status', () => {
    fc.assert(
      fc.property(fc.array(productComparisonArbitrary), (rows) => {
        const summary = computeProductReviewSummary(rows)
        const expectedValid = rows.filter(r => r.validationStatus === 'VALID').length
        expect(summary.valid).toBe(expectedValid)
      }),
      { numRuns: 100 },
    )
  })

  it('withErrors equals count of rows with INVALID status', () => {
    fc.assert(
      fc.property(fc.array(productComparisonArbitrary), (rows) => {
        const summary = computeProductReviewSummary(rows)
        const expectedWithErrors = rows.filter(r => r.validationStatus === 'INVALID').length
        expect(summary.withErrors).toBe(expectedWithErrors)
      }),
      { numRuns: 100 },
    )
  })

  it('newProducts equals count of rows with newProduct true', () => {
    fc.assert(
      fc.property(fc.array(productComparisonArbitrary), (rows) => {
        const summary = computeProductReviewSummary(rows)
        const expectedNewProducts = rows.filter(r => r.newProduct).length
        expect(summary.newProducts).toBe(expectedNewProducts)
      }),
      { numRuns: 100 },
    )
  })

  it('updates equals count where hasChanges is true but not newProduct and not newVariant', () => {
    fc.assert(
      fc.property(fc.array(productComparisonArbitrary), (rows) => {
        const summary = computeProductReviewSummary(rows)
        const expectedUpdates = rows.filter(r => r.hasChanges && !r.newProduct && !r.newVariant).length
        expect(summary.updates).toBe(expectedUpdates)
      }),
      { numRuns: 100 },
    )
  })
})
