import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  OrderStatus,
  OrderStatusOptions,
  ProductStatus,
  ProductStatusOptions,
} from '@/shared/types/enums'

/**
 * Property 11: Enum options map completeness
 *
 * For every value in OrderStatus and ProductStatus, the corresponding Options map
 * contains an entry with a non-empty label and non-empty color.
 *
 */

const orderStatusValues = Object.values(OrderStatus)
const productStatusValues = Object.values(ProductStatus)

// Arbitrary that picks any OrderStatus value
const orderStatusArb = fc.constantFrom(...orderStatusValues)

// Arbitrary that picks any ProductStatus value
const productStatusArb = fc.constantFrom(...productStatusValues)

describe('Enum Options Map Completeness — Property Tests', () => {
  describe('OrderStatusOptions completeness', () => {
    it('every OrderStatus value has a corresponding entry with a non-empty label and non-empty color', () => {
      fc.assert(
        fc.property(orderStatusArb, (status) => {
          const entry = OrderStatusOptions[status]

          // Entry must exist
          expect(entry).toBeDefined()

          // Label must be a non-empty string
          expect(typeof entry.label).toBe('string')
          expect(entry.label.length).toBeGreaterThan(0)

          // Color must be a non-empty string
          expect(typeof entry.color).toBe('string')
          expect(entry.color.length).toBeGreaterThan(0)
        }),
        { numRuns: 100 },
      )
    })
  })

  describe('ProductStatusOptions completeness', () => {
    it('every ProductStatus value has a corresponding entry with a non-empty label and non-empty color', () => {
      fc.assert(
        fc.property(productStatusArb, (status) => {
          const entry = ProductStatusOptions[status]

          // Entry must exist
          expect(entry).toBeDefined()

          // Label must be a non-empty string
          expect(typeof entry.label).toBe('string')
          expect(entry.label.length).toBeGreaterThan(0)

          // Color must be a non-empty string
          expect(typeof entry.color).toBe('string')
          expect(entry.color.length).toBeGreaterThan(0)
        }),
        { numRuns: 100 },
      )
    })
  })
})
