import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { render } from '@testing-library/react'
import { DataTable } from '../DataTable'
import type { ColumnDef } from '@tanstack/react-table'

/**
 * Property 2: Preservation — DataTable Layout Unchanged
 *
 * For all DataTable layout scenarios, horizontal scroll (`overflow-x: auto`) on the
 * inner table wrapper and rounded corners (`rounded-xl`) on the outer container
 * remain intact. These tests run on UNFIXED code to establish the baseline.
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 */

// --- Test helpers ---

interface TestRow {
  id: number
  [key: string]: string | number
}

function makeColumns(count: number): ColumnDef<TestRow, unknown>[] {
  return Array.from({ length: count }, (_, i) => ({
    accessorKey: i === 0 ? 'id' : `col${i}`,
    header: i === 0 ? 'ID' : `Column ${i}`,
  }))
}

function makeRows(rowCount: number, colCount: number): TestRow[] {
  return Array.from({ length: rowCount }, (_, i) => {
    const row: TestRow = { id: i + 1 }
    for (let j = 1; j < colCount; j++) {
      row[`col${j}`] = `Cell ${i + 1}-${j}`
    }
    return row
  })
}

// --- Arbitraries ---

/** Number of columns (2-10, representing narrow to wide tables) */
const columnCountArb = fc.integer({ min: 2, max: 10 })

/** Number of rows (0-30, representing empty to paginated tables) */
const rowCountArb = fc.integer({ min: 0, max: 30 })

/** Page size for pagination */
const pageSizeArb = fc.constantFrom(5, 10, 20)

/** Combined table config arbitrary */
const tableConfigArb = fc.record({
  columnCount: columnCountArb,
  rowCount: rowCountArb,
  pageSize: pageSizeArb,
})

describe('DataTable Layout Preservation — Property 2: Rounded Corners and Horizontal Scroll', () => {
  it('outer container always has rounded-xl border-radius class for any table configuration', () => {
    fc.assert(
      fc.property(tableConfigArb, ({ columnCount, rowCount, pageSize }) => {
        const columns = makeColumns(columnCount)
        const data = makeRows(rowCount, columnCount)
        const { container, unmount } = render(
          <DataTable columns={columns} data={data} initialPageSize={pageSize} />,
        )

        // The outer container is the first child of the root flex div
        // It should have rounded-xl and overflow-hidden classes
        const outerContainer = container.querySelector('.rounded-xl')
        expect(outerContainer).not.toBeNull()

        // Verify the outer container also has border and overflow-hidden
        expect(outerContainer!.classList.contains('overflow-hidden')).toBe(true)
        expect(outerContainer!.classList.contains('border')).toBe(true)

        unmount()
      }),
      { numRuns: 50 },
    )
  })

  it('inner table wrapper always has overflow-x-auto for horizontal scrolling for any table configuration', () => {
    fc.assert(
      fc.property(tableConfigArb, ({ columnCount, rowCount, pageSize }) => {
        const columns = makeColumns(columnCount)
        const data = makeRows(rowCount, columnCount)
        const { container, unmount } = render(
          <DataTable columns={columns} data={data} initialPageSize={pageSize} />,
        )

        // The inner wrapper that contains the table should have overflow-x-auto
        const scrollWrapper = container.querySelector('.overflow-x-auto')
        expect(scrollWrapper).not.toBeNull()

        // The table element should be inside the scroll wrapper
        const table = scrollWrapper!.querySelector('table')
        expect(table).not.toBeNull()

        unmount()
      }),
      { numRuns: 50 },
    )
  })

  it('DataTable maintains both rounded corners and horizontal scroll simultaneously', () => {
    fc.assert(
      fc.property(tableConfigArb, ({ columnCount, rowCount, pageSize }) => {
        const columns = makeColumns(columnCount)
        const data = makeRows(rowCount, columnCount)
        const { container, unmount } = render(
          <DataTable columns={columns} data={data} initialPageSize={pageSize} />,
        )

        // Both should exist simultaneously
        const outerContainer = container.querySelector('.rounded-xl.overflow-hidden')
        const scrollWrapper = container.querySelector('.overflow-x-auto')

        expect(outerContainer).not.toBeNull()
        expect(scrollWrapper).not.toBeNull()

        // The scroll wrapper should be inside the outer container
        expect(outerContainer!.contains(scrollWrapper)).toBe(true)

        unmount()
      }),
      { numRuns: 50 },
    )
  })

  it('pagination footer renders below the table within the outer container', () => {
    fc.assert(
      fc.property(
        columnCountArb,
        fc.integer({ min: 1, max: 30 }), // at least 1 row so pagination shows
        pageSizeArb,
        (columnCount, rowCount, pageSize) => {
          const columns = makeColumns(columnCount)
          const data = makeRows(rowCount, columnCount)
          const { container, unmount } = render(
            <DataTable columns={columns} data={data} initialPageSize={pageSize} />,
          )

          // Pagination footer should exist when not loading and has data
          const outerContainer = container.querySelector('.rounded-xl.overflow-hidden')
          expect(outerContainer).not.toBeNull()

          // The pagination section has border-t class
          const paginationFooter = outerContainer!.querySelector('.border-t')
          expect(paginationFooter).not.toBeNull()

          // Pagination should be inside the outer container (below the table)
          expect(outerContainer!.contains(paginationFooter)).toBe(true)

          unmount()
        },
      ),
      { numRuns: 30 },
    )
  })
})
