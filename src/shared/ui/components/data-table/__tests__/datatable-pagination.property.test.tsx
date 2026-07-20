import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { render } from '@testing-library/react'
import { DataTable } from '../DataTable'
import type { ColumnDef } from '@tanstack/react-table'

/**
 * Property 4: DataTable client-side pagination invariant
 *
 * For any dataset with length greater than the page size, when DataTable is rendered
 * without `manualPagination`, only `pageSize` rows SHALL be visible on any given page.
 *
 * **Validates: Requirements 3.1**
 */

interface TestRow {
  id: number
  value: string
}

const columns: ColumnDef<TestRow, unknown>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'value', header: 'Value' },
]

function makeRows(count: number): TestRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    value: `row-${i + 1}`,
  }))
}

// Arbitrary for page sizes (reasonable range for UI pagination)
const pageSizeArb = fc.constantFrom(5, 10, 20, 50)

// Arbitrary for data lengths that exceed the page size
// We generate a tuple of [pageSize, dataLength] where dataLength > pageSize
const paginationArb = pageSizeArb.chain((pageSize) =>
  fc.integer({ min: pageSize + 1, max: pageSize * 5 }).map((dataLength) => ({
    pageSize,
    dataLength,
  })),
)

describe('DataTable client-side pagination invariant — Property 4', () => {
  it('renders exactly pageSize data rows when data length exceeds pageSize (client-side mode)', () => {
    fc.assert(
      fc.property(paginationArb, ({ pageSize, dataLength }) => {
        const data = makeRows(dataLength)
        const { container } = render(
          <DataTable columns={columns} data={data} initialPageSize={pageSize} />,
        )

        // Get all rows in the tbody (data rows only, excluding header rows in thead)
        const tbody = container.querySelector('tbody')!
        const dataRows = tbody.querySelectorAll('tr')

        // Assert only pageSize data rows are rendered on the first page
        expect(dataRows.length).toBe(pageSize)
      }),
      { numRuns: 100 },
    )
  })

  it('never renders more than pageSize data rows regardless of dataset size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 50 }), // pageSize
        fc.integer({ min: 1, max: 10 }), // multiplier (dataLength = pageSize * multiplier + extra)
        fc.integer({ min: 1, max: 49 }), // extra rows beyond a full multiple
        (pageSize, multiplier, extra) => {
          const dataLength = pageSize * multiplier + extra
          // Only test when dataLength > pageSize (which is guaranteed since multiplier >= 1 and extra >= 1)
          const data = makeRows(dataLength)
          const { container } = render(
            <DataTable columns={columns} data={data} initialPageSize={pageSize} />,
          )

          const tbody = container.querySelector('tbody')!
          const dataRows = tbody.querySelectorAll('tr')

          // Data rows on the first page must be exactly pageSize
          expect(dataRows.length).toBe(pageSize)
        },
      ),
      { numRuns: 100 },
    )
  })
})
