import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { getPaginationText, getPageNumbers } from '../paginationUtils'

// Feature: admin-product-list-redesign, Property 6: Pagination text calculation

/**
 * Property 6: Pagination text calculation
 *
 * For any valid pagination state where page >= 1, pageSize >= 1, and total >= 0,
 * the pagination bar SHALL display "Showing X to Y of Z results" where
 * X = (page - 1) * pageSize + 1, Y = min(page * pageSize, total), and Z = total.
 * When total === 0, X SHALL be 0.
 *
 */

describe('Pagination text calculation — Property Tests', () => {
  it('displays "Showing 0 to 0 of 0 results" when total is 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1, max: 100 }),
        (page, pageSize) => {
          const result = getPaginationText(page, pageSize, 0)

          expect(result).toBe('Showing 0 to 0 of 0 results')
        },
      ),
      { numRuns: 100 },
    )
  })

  it('calculates correct "Showing X to Y of Z results" for total > 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 500 }),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100000 }),
        (page, pageSize, total) => {
          const result = getPaginationText(page, pageSize, total)
          const expectedX = (page - 1) * pageSize + 1
          const expectedY = Math.min(page * pageSize, total)
          const expected = `Showing ${expectedX} to ${expectedY} of ${total} results`

          expect(result).toBe(expected)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('Y never exceeds total', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 500 }),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100000 }),
        (page, pageSize, total) => {
          const result = getPaginationText(page, pageSize, total)
          // Extract Y from the string "Showing X to Y of Z results"
          const match = result.match(/Showing \d+ to (\d+) of (\d+) results/)

          expect(match).not.toBeNull()
          const y = parseInt(match![1], 10)
          const z = parseInt(match![2], 10)

          expect(y).toBeLessThanOrEqual(z)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('X is always >= 1 when total > 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 500 }),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100000 }),
        (page, pageSize, total) => {
          const result = getPaginationText(page, pageSize, total)
          const match = result.match(/Showing (\d+) to \d+ of \d+ results/)

          expect(match).not.toBeNull()
          const x = parseInt(match![1], 10)

          expect(x).toBeGreaterThanOrEqual(1)
        },
      ),
      { numRuns: 100 },
    )
  })
})

// Feature: admin-product-list-redesign, Property 7: Pagination button constraints

/**
 * Property 7: Pagination button constraints
 *
 * For any pagination state with currentPage and totalPages >= 1, the rendered
 * page buttons SHALL always include page 1, the current page, and the last page.
 * At most one page on each side of the current page is shown. Gaps between
 * non-adjacent displayed pages SHALL be represented by "..." ellipsis elements.
 *
 */

describe('Pagination button constraints — Property Tests', () => {
  it('always includes page 1 in the result', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }).chain((totalPages) =>
          fc.tuple(
            fc.integer({ min: 1, max: totalPages }),
            fc.constant(totalPages),
          ),
        ),
        ([currentPage, totalPages]) => {
          const result = getPageNumbers(currentPage, totalPages)
          const numericEntries = result.filter((e): e is number => typeof e === 'number')

          expect(numericEntries).toContain(1)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('always includes the current page in the result', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }).chain((totalPages) =>
          fc.tuple(
            fc.integer({ min: 1, max: totalPages }),
            fc.constant(totalPages),
          ),
        ),
        ([currentPage, totalPages]) => {
          const result = getPageNumbers(currentPage, totalPages)
          const numericEntries = result.filter((e): e is number => typeof e === 'number')

          expect(numericEntries).toContain(currentPage)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('always includes the last page (totalPages) in the result', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }).chain((totalPages) =>
          fc.tuple(
            fc.integer({ min: 1, max: totalPages }),
            fc.constant(totalPages),
          ),
        ),
        ([currentPage, totalPages]) => {
          const result = getPageNumbers(currentPage, totalPages)
          const numericEntries = result.filter((e): e is number => typeof e === 'number')

          expect(numericEntries).toContain(totalPages)
        },
      ),
      { numRuns: 100 },
    )
  })

  it('gaps between non-adjacent pages are represented by "..."', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }).chain((totalPages) =>
          fc.tuple(
            fc.integer({ min: 1, max: totalPages }),
            fc.constant(totalPages),
          ),
        ),
        ([currentPage, totalPages]) => {
          const result = getPageNumbers(currentPage, totalPages)

          for (let i = 0; i < result.length - 1; i++) {
            const current = result[i]
            const next = result[i + 1]

            if (typeof current === 'number' && typeof next === 'number') {
              // Adjacent numeric entries must be consecutive (no hidden gap)
              expect(next - current).toBe(1)
            }
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('numeric entries are in strictly ascending order', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }).chain((totalPages) =>
          fc.tuple(
            fc.integer({ min: 1, max: totalPages }),
            fc.constant(totalPages),
          ),
        ),
        ([currentPage, totalPages]) => {
          const result = getPageNumbers(currentPage, totalPages)
          const numericEntries = result.filter((e): e is number => typeof e === 'number')

          for (let i = 0; i < numericEntries.length - 1; i++) {
            expect(numericEntries[i]).toBeLessThan(numericEntries[i + 1])
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  it('"..." only appears between non-adjacent numeric entries', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }).chain((totalPages) =>
          fc.tuple(
            fc.integer({ min: 1, max: totalPages }),
            fc.constant(totalPages),
          ),
        ),
        ([currentPage, totalPages]) => {
          const result = getPageNumbers(currentPage, totalPages)

          for (let i = 0; i < result.length; i++) {
            if (result[i] === '...') {
              // Ellipsis must be between two numeric entries
              expect(i).toBeGreaterThan(0)
              expect(i).toBeLessThan(result.length - 1)
              expect(typeof result[i - 1]).toBe('number')
              expect(typeof result[i + 1]).toBe('number')

              // The numeric entries around ellipsis must have a gap > 1
              const before = result[i - 1] as number
              const after = result[i + 1] as number
              expect(after - before).toBeGreaterThan(1)
            }
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})
