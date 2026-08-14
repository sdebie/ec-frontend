// Feature: admin-product-sub-pages, Property 2: Search filter construction preserves the search term

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

import { buildSearchFilterRequest } from '../filterBuilder'

/**
 *
 * Property 2: Search filter construction preserves the search term
 *
 * For any non-empty, non-whitespace search string, buildSearchFilterRequest produces
 * a FilterRequest with exactly one filter where key === 'name', operator === 'ILIKE',
 * and value contains the trimmed search term wrapped in % wildcards.
 */
describe('Property 2: Search filter construction preserves the search term', () => {
  // Arbitrary for non-empty, non-whitespace-only strings
  const nonEmptySearchArb = fc
    .string({ minLength: 1, maxLength: 200 })
    .filter((s) => s.trim().length > 0)

  it('produces a FilterRequest with exactly one filter', () => {
    fc.assert(
      fc.property(nonEmptySearchArb, (search) => {
        const result = buildSearchFilterRequest(search)
        expect(result).toBeDefined()
        expect(result!.filters).toHaveLength(1)
      }),
      { numRuns: 100 },
    )
  })

  it('filter key is always "name"', () => {
    fc.assert(
      fc.property(nonEmptySearchArb, (search) => {
        const result = buildSearchFilterRequest(search)
        expect(result!.filters![0].key).toBe('name')
      }),
      { numRuns: 100 },
    )
  })

  it('filter operator is always "ILIKE"', () => {
    fc.assert(
      fc.property(nonEmptySearchArb, (search) => {
        const result = buildSearchFilterRequest(search)
        expect(result!.filters![0].operator).toBe('ILIKE')
      }),
      { numRuns: 100 },
    )
  })

  it('filter value wraps the trimmed search term in % wildcards', () => {
    fc.assert(
      fc.property(nonEmptySearchArb, (search) => {
        const result = buildSearchFilterRequest(search)
        const trimmed = search.trim()
        expect(result!.filters![0].value).toBe(`%${trimmed}%`)
      }),
      { numRuns: 100 },
    )
  })

  it('returns undefined for empty or whitespace-only input', () => {
    const whitespaceArb = fc.constantFrom('', ' ', '  ', '\t', '\n', '  \t\n  ')

    fc.assert(
      fc.property(whitespaceArb, (search) => {
        const result = buildSearchFilterRequest(search)
        expect(result).toBeUndefined()
      }),
      { numRuns: 100 },
    )
  })
})
