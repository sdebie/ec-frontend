// Feature: checkout, Property 1: Session store round-trip
import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { useCheckoutSessionStore } from '../checkoutSessionStore'
import { CheckoutSession } from '../types'

// Arbitrary for OrderCheckoutLine
const orderCheckoutLineArb = fc.record({
  variantId: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1 }),
  unitPrice: fc.float({ min: 0, noNaN: true }),
  quantity: fc.integer({ min: 1 }),
  lineTotal: fc.float({ min: 0, noNaN: true }),
})

// Arbitrary for CheckoutSession
const checkoutSessionArb: fc.Arbitrary<CheckoutSession> = fc.record({
  orderId: fc.uuid(),
  sessionId: fc.uuid(),
  lines: fc.array(orderCheckoutLineArb, { minLength: 1, maxLength: 10 }),
  subtotal: fc.float({ min: 0, noNaN: true }),
  vatAmount: fc.float({ min: 0, noNaN: true }),
  shippingEstimate: fc.float({ min: 0, noNaN: true }),
  grandTotal: fc.float({ min: 0, noNaN: true }),
})

describe('checkoutSessionStore - Property Tests', () => {
  beforeEach(() => {
    useCheckoutSessionStore.setState({ session: null })
  })

  // **Validates: Requirements 1.2**
  it('Property 1: setSession followed by getState().session produces deeply equal output', () => {
    fc.assert(
      fc.property(checkoutSessionArb, (session) => {
        useCheckoutSessionStore.getState().setSession(session)
        const stored = useCheckoutSessionStore.getState().session

        expect(stored).toEqual(session)
      }),
      { numRuns: 100 }
    )
  })
})
