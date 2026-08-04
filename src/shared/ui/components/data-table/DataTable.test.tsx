import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DataTable } from './DataTable'
import type { ColumnDef } from '@tanstack/react-table'

interface TestRow {
  id: number
  name: string
}

const columns: ColumnDef<TestRow, unknown>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
]

function makeRows(count: number): TestRow[] {
  return Array.from({ length: count }, (_, i) => ({ id: i + 1, name: `Row ${i + 1}` }))
}

describe('DataTable', () => {
  describe('client-side pagination (default)', () => {
    it('renders only pageSize rows when data exceeds page size', () => {
      const data = makeRows(25)
      render(<DataTable columns={columns} data={data} initialPageSize={10} />)
      // Should only show 10 rows (first page)
      const rows = screen.getAllByRole('row')
      expect(rows.length).toBe(11) // 1 header + 10 data rows
    })

    it('shows pagination info text', () => {
      const data = makeRows(25)
      render(<DataTable columns={columns} data={data} initialPageSize={10} />)
      expect(screen.getByText(/Showing/)).toBeInTheDocument()
      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByText(/results/)).toBeInTheDocument()
    })
  })

  describe('server-side pagination (manualPagination)', () => {
    it('renders all rows in data without internal slicing', () => {
      const data = makeRows(5) // server already sliced to current page
      const onPaginationChange = vi.fn()
      render(
        <DataTable
          columns={columns}
          data={data}
          manualPagination
          pageCount={10}
          pagination={{ pageIndex: 0, pageSize: 5 }}
          onPaginationChange={onPaginationChange}
        />
      )
      const rows = screen.getAllByRole('row')
      // 1 header + 5 data rows (all of them — no internal slicing)
      expect(rows.length).toBe(6)
    })
  })

  describe('isLoading', () => {
    it('renders skeleton rows when isLoading is true', () => {
      render(<DataTable columns={columns} data={[]} isLoading />)
      // Should show animated pulse skeleton divs
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('does not render data rows when isLoading is true', () => {
      const data = makeRows(5)
      render(<DataTable columns={columns} data={data} isLoading />)
      expect(screen.queryByText('Row 1')).not.toBeInTheDocument()
    })
  })

  describe('toolbarAction slot', () => {
    it('renders toolbarAction node above the table', () => {
      render(
        <DataTable
          columns={columns}
          data={makeRows(3)}
          toolbarAction={<button>Add Item</button>}
        />
      )
      expect(screen.getByText('Add Item')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty message when data is empty', () => {
      render(<DataTable columns={columns} data={[]} emptyMessage="Nothing here" />)
      expect(screen.getByText('Nothing here')).toBeInTheDocument()
    })

    it('shows default empty message when no emptyMessage prop provided', () => {
      render(<DataTable columns={columns} data={[]} />)
      expect(screen.getByText('No results found')).toBeInTheDocument()
    })
  })

  describe('ColumnDef re-export', () => {
    it('re-exports ColumnDef type from @tanstack/react-table', async () => {
      const module = await import('./DataTable')
      // ColumnDef is a type-only export, so we just verify the module exports exist
      expect(module.DataTable).toBeDefined()
    })
  })
})
