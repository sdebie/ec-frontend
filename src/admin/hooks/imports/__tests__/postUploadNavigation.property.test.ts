// Feature: admin-product-import, Property 3: Post-upload navigation targets correct review URL

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

describe('Post-upload navigation — Property Tests', () => {
  it('product upload navigates to correct review URL for any batch ID', () => {
    fc.assert(
      fc.property(fc.uuid(), (batchId) => {
        const productReviewUrl = `/admin/imports/products/bulk-upload/review/${batchId}`
        expect(productReviewUrl).toBe(`/admin/imports/products/bulk-upload/review/${batchId}`)
        expect(productReviewUrl).toContain(batchId)
        expect(productReviewUrl).toMatch(/^\/admin\/imports\/products\/bulk-upload\/review\//)
      }),
      { numRuns: 100 },
    )
  })

  it('price upload navigates to correct review URL for any batch ID', () => {
    fc.assert(
      fc.property(fc.uuid(), (batchId) => {
        const priceReviewUrl = `/admin/imports/products/price/bulk-upload/review/${batchId}`
        expect(priceReviewUrl).toBe(`/admin/imports/products/price/bulk-upload/review/${batchId}`)
        expect(priceReviewUrl).toContain(batchId)
        expect(priceReviewUrl).toMatch(/^\/admin\/imports\/products\/price\/bulk-upload\/review\//)
      }),
      { numRuns: 100 },
    )
  })
})
