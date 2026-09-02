// Feature: admin-product-list-redesign, Property 3: Product column subtitle fallback
// Feature: admin-product-list-redesign, Property 4: Price column displays minimum price only

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

import { getProductSubtitle, getFormattedPrice } from '../components/ProductTable'
import { formatAmount } from '@/shared/utils/formatAmount'
import type { AdminProductListItem } from '../types'
import { ProductStatus } from '@/shared/types/enums'

/**
 * Property 3: Product column subtitle fallback
 *
 * For any AdminProductListItem record where category.name is non-empty,
 * the Product column subtitle SHALL never be empty.
 *
 */
describe('Property 3: Product column subtitle fallback', () => {
  const statusArb = fc.constantFrom(
    ProductStatus.ACTIVE,
    ProductStatus.PENDING,
    ProductStatus.DISABLED,
  )

  const productWithCategoryArb = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    slug: fc.string({ minLength: 1, maxLength: 100 }),
    sku: fc.string({ minLength: 1, maxLength: 30 }),
    category: fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 80 }),
    }),
    status: statusArb,
    thumbnailUrl: fc.oneof(fc.constant(null), fc.webUrl()),
    retailPrice: fc.oneof(
      fc.constant(null),
      fc.integer({ min: 1, max: 9999999 }).map((n) => (n / 100).toFixed(2)),
    ),
    stockCount: fc.nat({ max: 1000 }),
  }) as fc.Arbitrary<AdminProductListItem>

  it('subtitle is never empty when category.name is non-empty', () => {
    fc.assert(
      fc.property(productWithCategoryArb, (product) => {
        const subtitle = getProductSubtitle(product)

        // Since category.name is always non-empty (minLength: 1), subtitle must be non-empty
        expect(subtitle).not.toBe('')
        expect(subtitle.length).toBeGreaterThan(0)
      }),
      { numRuns: 100 },
    )
  })

  it('subtitle equals category.name for any product', () => {
    fc.assert(
      fc.property(productWithCategoryArb, (product) => {
        const subtitle = getProductSubtitle(product)

        expect(subtitle).toBe(product.category.name)
      }),
      { numRuns: 100 },
    )
  })
})

/**
 * Property 4: Price column displays minimum price only
 *
 * For any AdminProductListItem with a retailPrice value, the Price column SHALL
 * display only formatAmount(parseFloat(retailPrice)) — never a range string.
 *
 */
describe('Property 4: Price column displays minimum price only', () => {
  const validPriceArb = fc
    .integer({ min: 1, max: 9999999 })
    .map((n) => (n / 100).toFixed(2))

  it('output always equals formatAmount(parseFloat(price)) for valid prices', () => {
    fc.assert(
      fc.property(validPriceArb, (priceStr) => {
        const result = getFormattedPrice(priceStr)
        const expected = formatAmount(parseFloat(priceStr))

        expect(result).toBe(expected)
      }),
      { numRuns: 100 },
    )
  })

  it('output never contains a range separator ("–" en-dash)', () => {
    fc.assert(
      fc.property(validPriceArb, (priceStr) => {
        const result = getFormattedPrice(priceStr)

        // Must not contain en-dash (range indicator)
        expect(result).not.toContain('–')
        // Must not contain em-dash either
        expect(result).not.toContain('—')
        // Must not contain hyphen-minus used as range separator
        expect(result).not.toMatch(/\d\s*-\s*\d/)
      }),
      { numRuns: 100 },
    )
  })

  it('output for null retailPrice defaults to formatAmount(0)', () => {
    const result = getFormattedPrice(null)
    const expected = formatAmount(0)

    expect(result).toBe(expected)
  })

  it('output is always a single formatted amount (no "to" keyword)', () => {
    fc.assert(
      fc.property(validPriceArb, (priceStr) => {
        const result = getFormattedPrice(priceStr)

        // Should not contain "to" which would indicate a range like "R10.00 to R20.00"
        expect(result.toLowerCase()).not.toContain(' to ')
      }),
      { numRuns: 100 },
    )
  })
})
