import { describe, it, expect } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import * as fc from 'fast-check'
import { DataTable } from '../DataTable'
import type { ColumnDef } from '@tanstack/react-table'

/**
 *
 * Property 5: DataTable manual pagination passthrough
 * For any data array passed to DataTable with `manualPagination={true}`,
 * all items in the data prop SHALL appear in the rendered table without
 * internal slicing or filtering.
 */

interface TestRow {
  id: string
  name: string
}

const columns: ColumnDef<TestRow, unknown>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
]

// Generate data arrays of varying length (1 to 50 items)
const dataArb = fc.array(
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
  }),
  { minLength: 1, maxLength: 50 },
)

describe('DataTable — Property: Manual pagination passthrough', () => {
  it('all items in data prop appear in the rendered table when manualPagination is true', () => {
    fc.assert(
      fc.property(dataArb, (data) => {
        cleanup()

        const paginationState = { pageIndex: 0, pageSize: data.length }
        const onPaginationChange = () => {}

        const { container } = render(
          <DataTable
            columns={columns}
            data={data}
            manualPagination={true}
            pageCount={1}
            pagination={paginationState}
            onPaginationChange={onPaginationChange}
          />,
        )

        // Get all rendered table body rows (excluding header and loading skeleton)
        const tbody = container.querySelector('tbody')!
        const rows = tbody.querySelectorAll('tr')

        // Assert: the number of rendered rows equals the data length (no slicing)
        expect(rows.length).toBe(data.length)

        // Assert: each item's id appears in the rendered table cells
        for (const item of data) {
          const cells = tbody.querySelectorAll('td')
          const cellTexts = Array.from(cells).map((cell) => cell.textContent)
          expect(cellTexts).toContain(item.id)
        }
      }),
      { numRuns: 100 },
    )
  })
})
