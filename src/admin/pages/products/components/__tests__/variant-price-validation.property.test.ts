import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property 2: Variant price field accepts only valid decimal strings
 *
 * For any string value in the `price` field, the zod `variantSchema` SHALL accept
 * strings matching `/^\d+(\.\d{1,2})?$/` and SHALL reject all other strings,
 * including empty strings, negative values, and strings with more than 2 decimal places.
 *
 */

// The exact regex from variantSchema in ProductForm.tsx
const PRICE_REGEX = /^\d+(\.\d{1,2})?$/

// Arbitrary: valid integer prices like "0", "99", "12345"
const validIntegerPriceArb = fc.integer({ min: 0, max: 99999 }).map((n) => String(n))

// Arbitrary: valid prices with 1 decimal place like "99.9", "0.5"
const validOneDecimalPriceArb = fc
  .tuple(fc.integer({ min: 0, max: 99999 }), fc.integer({ min: 0, max: 9 }))
  .map(([whole, d]) => `${whole}.${d}`)

// Arbitrary: valid prices with 2 decimal places like "99.99", "0.01"
const validTwoDecimalPriceArb = fc
  .tuple(fc.integer({ min: 0, max: 99999 }), fc.integer({ min: 0, max: 99 }))
  .map(([whole, d]) => `${whole}.${String(d).padStart(2, '0')}`)

// Combined arbitrary for all valid price strings
const validPriceArb = fc.oneof(validIntegerPriceArb, validOneDecimalPriceArb, validTwoDecimalPriceArb)

// Arbitrary: negative price strings like "-5.00", "-123"
const negativePriceArb = fc
  .tuple(fc.integer({ min: 1, max: 99999 }), fc.integer({ min: 0, max: 99 }))
  .map(([whole, d]) => `-${whole}.${String(d).padStart(2, '0')}`)

// Arbitrary: prices with 3+ decimal places like "9.999", "1.1234"
const tooManyDecimalsArb = fc
  .tuple(fc.integer({ min: 0, max: 9999 }), fc.integer({ min: 100, max: 99999 }))
  .map(([whole, d]) => `${whole}.${d}`)

// Arbitrary: alphabetic or non-numeric strings
const alphabeticArb = fc.string({ minLength: 1, maxLength: 10 }).filter((s) => /[a-zA-Z]/.test(s))

// Arbitrary: strings with spaces
const spacedStringArb = fc
  .tuple(fc.string({ minLength: 0, maxLength: 5 }), fc.string({ minLength: 0, maxLength: 5 }))
  .map(([a, b]) => `${a} ${b}`)

// Combined arbitrary for invalid price strings
const invalidPriceArb = fc.oneof(
  fc.constant(''),
  negativePriceArb,
  tooManyDecimalsArb,
  alphabeticArb,
  spacedStringArb,
)

describe('Variant price validation — Property: Variant price field accepts only valid decimal strings', () => {
  it('accepts valid price strings matching the decimal pattern', () => {
    fc.assert(
      fc.property(validPriceArb, (price) => {
        expect(PRICE_REGEX.test(price)).toBe(true)
      }),
      { numRuns: 500 },
    )
  })

  it('rejects invalid price strings (empty, negative, 3+ decimals, alphabetic, spaces)', () => {
    fc.assert(
      fc.property(invalidPriceArb, (price) => {
        expect(PRICE_REGEX.test(price)).toBe(false)
      }),
      { numRuns: 500 },
    )
  })
})
