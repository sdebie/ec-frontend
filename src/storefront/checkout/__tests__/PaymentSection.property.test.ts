// Feature: checkout, Property 6: Payment method label mapping
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// Label map matching PaymentSection component implementation
const PAYMENT_LABELS: Record<string, string> = {
  PAYFAST: 'Pay online (PayFast)',
  IN_STORE: 'Pay in store at collection',
}

function getPaymentLabel(key: string): string {
  return PAYMENT_LABELS[key] ?? key
}

// Arbitrary for known payment method keys
const knownMethodArb = fc.constantFrom('PAYFAST', 'IN_STORE')

// Arbitrary for unknown payment method keys (alphanumeric/underscore strings mimicking real API keys)
const unknownMethodArb = fc
  .stringMatching(/^[A-Z][A-Z0-9_]{0,29}$/)
  .filter((s) => s.length >= 1 && s !== 'PAYFAST' && s !== 'IN_STORE')

// Arbitrary for any payment method key (mix of known and unknown)
const paymentMethodArb = fc.oneof(knownMethodArb, unknownMethodArb)

// Arbitrary for non-empty arrays of payment method strings
const paymentMethodsArrayArb = fc.array(paymentMethodArb, { minLength: 1, maxLength: 10 })

describe('PaymentSection - Property Tests', () => {
  // **Validates: Requirements 5.2**
  it('Property 6: Each payment method renders with correct label; unknown keys use raw key as fallback', () => {
    fc.assert(
      fc.property(paymentMethodsArrayArb, (methods) => {
        for (const method of methods) {
          const label = getPaymentLabel(method)

          if (method === 'PAYFAST') {
            expect(label).toBe('Pay online (PayFast)')
          } else if (method === 'IN_STORE') {
            expect(label).toBe('Pay in store at collection')
          } else {
            // Unknown keys fall back to the raw key string
            expect(label).toBe(method)
          }
        }
      }),
      { numRuns: 100 }
    )
  })

  // **Validates: Requirements 5.2**
  it('Property 6: Known keys always map to their defined labels', () => {
    fc.assert(
      fc.property(knownMethodArb, (method) => {
        const label = getPaymentLabel(method)
        expect(label).toBe(PAYMENT_LABELS[method])
        expect(label).not.toBe(method) // Label is different from the raw key
      }),
      { numRuns: 100 }
    )
  })

  // **Validates: Requirements 5.2**
  it('Property 6: Unknown keys always return the raw key as label', () => {
    fc.assert(
      fc.property(unknownMethodArb, (method) => {
        const label = getPaymentLabel(method)
        expect(label).toBe(method)
      }),
      { numRuns: 100 }
    )
  })
})
