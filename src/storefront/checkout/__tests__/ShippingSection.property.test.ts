// Feature: checkout, Property 4: Shipping method classification determines address form visibility
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { isDeliveryMethod } from '../utils/isDeliveryMethod'
import type { ShippingMethod } from '../types'

// Arbitrary for ShippingMethod with varying baseFee and estimatedDays
const shippingMethodArb: fc.Arbitrary<ShippingMethod> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  baseFee: fc.float({ min: 0, max: 1000, noNaN: true }),
  estimatedDays: fc.oneof(
    fc.constant(null),
    fc.constant('0'),
    fc.string({ minLength: 1, maxLength: 5 })
  ),
})

describe('ShippingSection - Property Tests', () => {
  // **Validates: Requirements 4.3, 4.4**
  it('Property 4: isDeliveryMethod returns true iff baseFee > 0 OR (estimatedDays is non-null and not "0")', () => {
    fc.assert(
      fc.property(shippingMethodArb, (method) => {
        const result = isDeliveryMethod(method)
        const expectedDelivery =
          method.baseFee > 0 ||
          (method.estimatedDays !== null && method.estimatedDays !== '0')

        expect(result).toBe(expectedDelivery)
      }),
      { numRuns: 200 }
    )
  })
})
