// Feature: admin-product-list-redesign, Property 2: Filter-to-GraphQL-variable mapping

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

import { buildVariables, type UseAdminProductListParams } from '../useAdminProductList'

/**
 * **Validates: Requirements 3.6**
 *
 * Property 2: Filter-to-GraphQL-variable mapping
 *
 * For any combination of filter values, the buildVariables function SHALL include
 * only non-empty, non-"ALL" values as GraphQL variables in the adminProductList request.
 * pageIndex and pageSize ALWAYS appear in the output.
 */
describe('Property 2: Filter-to-GraphQL-variable mapping', () => {
  const statusArb = fc.constantFrom('ALL', 'ACTIVE', 'PENDING', 'DISABLED', '', undefined)
  const categoryIdArb = fc.oneof(
    fc.constant(undefined),
    fc.constant(''),
    fc.constant('ALL'),
    fc.uuid(),
  )
  const brandIdArb = fc.oneof(
    fc.constant(undefined),
    fc.constant(''),
    fc.constant('ALL'),
    fc.uuid(),
  )
  const searchArb = fc.oneof(
    fc.constant(undefined),
    fc.constant(''),
    fc.constant('   '),
    fc.string({ minLength: 1, maxLength: 50 }),
  )
  const pageIndexArb = fc.nat({ max: 100 })
  const pageSizeArb = fc.integer({ min: 1, max: 100 })

  const paramsArb = fc.record({
    pageIndex: pageIndexArb,
    pageSize: pageSizeArb,
    status: statusArb,
    categoryId: categoryIdArb,
    brandId: brandIdArb,
    search: searchArb,
  }) as fc.Arbitrary<UseAdminProductListParams>

  it('pageIndex and pageSize are ALWAYS present in output variables', () => {
    fc.assert(
      fc.property(paramsArb, (params) => {
        const variables = buildVariables(params)
        expect(variables).toHaveProperty('pageIndex', params.pageIndex)
        expect(variables).toHaveProperty('pageSize', params.pageSize)
      }),
      { numRuns: 100 },
    )
  })

  it('status is NOT included when it is "ALL", empty, or undefined', () => {
    fc.assert(
      fc.property(paramsArb, (params) => {
        const variables = buildVariables(params)
        if (!params.status || params.status === 'ALL') {
          expect(variables).not.toHaveProperty('status')
        }
      }),
      { numRuns: 100 },
    )
  })

  it('status IS included when it is a valid non-ALL, non-empty value', () => {
    fc.assert(
      fc.property(paramsArb, (params) => {
        const variables = buildVariables(params)
        if (params.status && params.status !== 'ALL') {
          expect(variables).toHaveProperty('status', params.status)
        }
      }),
      { numRuns: 100 },
    )
  })

  it('categoryId is NOT included when it is "ALL", empty, or undefined', () => {
    fc.assert(
      fc.property(paramsArb, (params) => {
        const variables = buildVariables(params)
        if (!params.categoryId || params.categoryId === 'ALL') {
          expect(variables).not.toHaveProperty('categoryId')
        }
      }),
      { numRuns: 100 },
    )
  })

  it('categoryId IS included when it is a valid non-ALL, non-empty value', () => {
    fc.assert(
      fc.property(paramsArb, (params) => {
        const variables = buildVariables(params)
        if (params.categoryId && params.categoryId !== 'ALL') {
          expect(variables).toHaveProperty('categoryId', params.categoryId)
        }
      }),
      { numRuns: 100 },
    )
  })

  it('brandId is NOT included when it is "ALL", empty, or undefined', () => {
    fc.assert(
      fc.property(paramsArb, (params) => {
        const variables = buildVariables(params)
        if (!params.brandId || params.brandId === 'ALL') {
          expect(variables).not.toHaveProperty('brandId')
        }
      }),
      { numRuns: 100 },
    )
  })

  it('brandId IS included when it is a valid non-ALL, non-empty value', () => {
    fc.assert(
      fc.property(paramsArb, (params) => {
        const variables = buildVariables(params)
        if (params.brandId && params.brandId !== 'ALL') {
          expect(variables).toHaveProperty('brandId', params.brandId)
        }
      }),
      { numRuns: 100 },
    )
  })

  it('search is NOT included when it is empty, whitespace-only, or undefined', () => {
    fc.assert(
      fc.property(paramsArb, (params) => {
        const variables = buildVariables(params)
        if (!params.search || params.search.trim() === '') {
          expect(variables).not.toHaveProperty('search')
        }
      }),
      { numRuns: 100 },
    )
  })

  it('search IS included (trimmed) when it has non-whitespace content', () => {
    fc.assert(
      fc.property(paramsArb, (params) => {
        const variables = buildVariables(params)
        if (params.search && params.search.trim() !== '') {
          expect(variables).toHaveProperty('search', params.search.trim())
        }
      }),
      { numRuns: 100 },
    )
  })

  it('output variables contain ONLY pageIndex, pageSize, and non-empty/non-ALL filter values', () => {
    fc.assert(
      fc.property(paramsArb, (params) => {
        const variables = buildVariables(params)
        const keys = Object.keys(variables)

        // Every key in the output must be one of the allowed keys
        const allowedKeys = ['pageIndex', 'pageSize', 'status', 'categoryId', 'brandId', 'search']
        for (const key of keys) {
          expect(allowedKeys).toContain(key)
        }

        // No value in the output should be 'ALL', empty, or whitespace-only
        for (const key of keys) {
          if (key === 'pageIndex' || key === 'pageSize') continue
          const value = variables[key] as string
          expect(value).not.toBe('ALL')
          expect(value).not.toBe('')
          expect(value.trim()).not.toBe('')
        }
      }),
      { numRuns: 100 },
    )
  })
})
