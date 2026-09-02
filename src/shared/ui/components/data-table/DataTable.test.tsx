import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

    it('summary text uses totalRowCount, not the current page\'s row count, for the "of Z" figure', () => {
      // Page 2 of a 15-row result set, fetched 10 at a time: the server returns only
      // this page's 5 remaining rows, but the true total across all pages is 15.
      const data = makeRows(5)
      render(
        <DataTable
          columns={columns}
          data={data}
          manualPagination
          pageCount={2}
          totalRowCount={15}
          pagination={{ pageIndex: 1, pageSize: 10 }}
          onPaginationChange={vi.fn()}
        />
      )

      expect(screen.getByText(/Showing/)).toHaveTextContent('Showing 11 to 15 of 15 results')
    })

    it('falls back to data.length when totalRowCount is omitted (back-compat)', () => {
      const data = makeRows(5)
      render(
        <DataTable
          columns={columns}
          data={data}
          manualPagination
          pageCount={1}
          pagination={{ pageIndex: 0, pageSize: 10 }}
          onPaginationChange={vi.fn()}
        />
      )

      expect(screen.getByText(/Showing/)).toHaveTextContent('Showing 1 to 5 of 5 results')
    })

    it('clamps the "Showing X" start figure when pageIndex is stale relative to a shrunk total', () => {
      // pageIndex is caller-owned local state that survives a total shrinking out from
      // under it (e.g. another admin action reduced matching rows while page 2 stayed
      // selected). The server has nothing left to return for this page, but the stale
      // pageIndex still drives the summary math: (2-1)*10+1 = 11, which must not be
      // allowed to exceed a totalRows of 10.
      const data: TestRow[] = []
      render(
        <DataTable
          columns={columns}
          data={data}
          manualPagination
          pageCount={1}
          totalRowCount={10}
          pagination={{ pageIndex: 1, pageSize: 10 }}
          onPaginationChange={vi.fn()}
        />
      )

      expect(screen.getByText(/Showing/)).toHaveTextContent('Showing 10 to 10 of 10 results')
    })

    it('does not echo react-table\'s own {pageIndex: 0} default back to onPaginationChange on mount, when a non-zero page is already controlled', () => {
      // TanStack Table's pagination feature calls onPaginationChange exactly once per
      // table-instance creation (i.e. on every mount) with its own internal default,
      // regardless of the controlled `pagination` prop already in effect. A caller that
      // restores its page number from the URL (BrandListPage, CategoryListPage) and
      // applies this verbatim would see it silently snap back to page 1 the instant the
      // table (re)mounts — exactly what navigate(-1) from an edit/create form does.
      const onPaginationChange = vi.fn()
      render(
        <DataTable
          columns={columns}
          data={makeRows(2)}
          manualPagination
          pageCount={5}
          pagination={{ pageIndex: 2, pageSize: 10 }}
          onPaginationChange={onPaginationChange}
        />
      )

      expect(onPaginationChange).not.toHaveBeenCalled()
    })

    it('does not echo the phantom default on a REMOUNT either (mount, unmount, mount again with the same controlled page)', () => {
      // The scenario the guard actually exists for: navigate away to edit/create, then
      // navigate(-1) back — a fresh DataTable instance mounts while the URL (and thus the
      // controlled `pagination` prop) already carries the page the reader was on.
      const onPaginationChange = vi.fn()
      const props = {
        columns,
        data: makeRows(2),
        manualPagination: true as const,
        pageCount: 5,
        pagination: { pageIndex: 2, pageSize: 10 },
        onPaginationChange,
      }

      render(<DataTable {...props} />).unmount()
      render(<DataTable {...props} />)

      expect(onPaginationChange).not.toHaveBeenCalled()
    })

    it('still forwards a real, user-driven page change after the guarded first call', async () => {
      const user = userEvent.setup()
      const onPaginationChange = vi.fn()
      render(
        <DataTable
          columns={columns}
          data={makeRows(2)}
          manualPagination
          pageCount={5}
          pagination={{ pageIndex: 2, pageSize: 10 }}
          onPaginationChange={onPaginationChange}
        />
      )

      await user.click(screen.getByTitle('Next Page'))

      expect(onPaginationChange).toHaveBeenCalledTimes(1)
      const updater = onPaginationChange.mock.calls[0][0]
      const next = typeof updater === 'function' ? updater({ pageIndex: 2, pageSize: 10 }) : updater
      expect(next).toEqual({ pageIndex: 3, pageSize: 10 })
    })
  })

  describe('sorting (client-side, default)', () => {
    it('clicking a sortable column header reorders the rendered rows', async () => {
      const user = userEvent.setup()
      const data = [{ id: 1, name: 'Zebra' }, { id: 2, name: 'Apple' }]
      render(<DataTable columns={columns} data={data} />)

      await user.click(screen.getByText('Name'))

      const rows = screen.getAllByRole('row')
      // Header row + 2 data rows, now ascending by name.
      expect(rows[1]).toHaveTextContent('Apple')
      expect(rows[2]).toHaveTextContent('Zebra')
    })

    it('a column with enableSorting: false is not clickable-sortable', async () => {
      const user = userEvent.setup()
      const unsortable: ColumnDef<TestRow, unknown>[] = [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'name', header: 'Name', enableSorting: false },
      ]
      const data = [{ id: 1, name: 'Zebra' }, { id: 2, name: 'Apple' }]
      render(<DataTable columns={unsortable} data={data} />)

      await user.click(screen.getByText('Name'))

      // Order unchanged — the header isn't wired to a sort toggle.
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Zebra')
      expect(rows[2]).toHaveTextContent('Apple')
    })
  })

  describe('manualPagination without manualSorting (the guard)', () => {
    /**
     * `data` here is one server-paginated page, not the full result set. If DataTable let
     * a column header sort it locally, the click would only reorder the ten rows it holds —
     * which answers a different question than "sort every matching order" and, because the
     * sort state then outlives the rows, would go on silently reordering every later fetch
     * too. A table in this configuration has no way to sort the full result set, so it must
     * not look sortable at all.
     */
    it('does not reorder rows when a header is clicked', async () => {
      const user = userEvent.setup()
      const data = [{ id: 1, name: 'Zebra' }, { id: 2, name: 'Apple' }]
      render(
        <DataTable
          columns={columns}
          data={data}
          manualPagination
          pageCount={1}
          pagination={{ pageIndex: 0, pageSize: 10 }}
          onPaginationChange={vi.fn()}
        />
      )

      await user.click(screen.getByText('Name'))

      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Zebra')
      expect(rows[2]).toHaveTextContent('Apple')
    })

    it('renders no sort affordance on any header', () => {
      const data = [{ id: 1, name: 'Zebra' }]
      render(
        <DataTable
          columns={columns}
          data={data}
          manualPagination
          pageCount={1}
          pagination={{ pageIndex: 0, pageSize: 10 }}
          onPaginationChange={vi.fn()}
        />
      )

      // ArrowUpDown is the "sortable but unsorted" affordance — its absence means no
      // header offers a click a caller cannot honour.
      expect(document.querySelector('.lucide-arrow-up-down')).not.toBeInTheDocument()
    })

    it('passing manualSorting + sorting + onSortingChange opts back in to real server sorting', async () => {
      // The guard blocks the unsafe default; it must not block the safe, explicit case
      // that useTableSort exists for.
      const user = userEvent.setup()
      const data = [{ id: 1, name: 'Zebra' }, { id: 2, name: 'Apple' }]
      const onSortingChange = vi.fn()
      render(
        <DataTable
          columns={columns}
          data={data}
          manualPagination
          pageCount={1}
          pagination={{ pageIndex: 0, pageSize: 10 }}
          onPaginationChange={vi.fn()}
          manualSorting
          sorting={[]}
          onSortingChange={onSortingChange}
        />
      )

      await user.click(screen.getByText('Name'))

      expect(onSortingChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('server-side sorting (manualSorting)', () => {
    it('clicking a sortable header calls onSortingChange instead of reordering rows itself', async () => {
      const user = userEvent.setup()
      // Server already returned this order for the current sort — if DataTable
      // sorted client-side too, this deliberately-unsorted data would flip.
      const data = [{ id: 1, name: 'Zebra' }, { id: 2, name: 'Apple' }]
      const onSortingChange = vi.fn()
      render(
        <DataTable
          columns={columns}
          data={data}
          manualSorting
          sorting={[]}
          onSortingChange={onSortingChange}
        />
      )

      await user.click(screen.getByText('Name'))

      expect(onSortingChange).toHaveBeenCalledTimes(1)
      // The server-provided order is left exactly as given.
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Zebra')
      expect(rows[2]).toHaveTextContent('Apple')
    })

    it('reflects the controlled sorting prop as the sort-icon state', () => {
      const data = makeRows(2)
      const { container } = render(
        <DataTable
          columns={columns}
          data={data}
          manualSorting
          sorting={[{ id: 'name', desc: true }]}
          onSortingChange={vi.fn()}
        />
      )

      // lucide ArrowDown renders with this class; ArrowUpDown (unsorted) does not.
      expect(container.querySelector('.lucide-arrow-down')).toBeInTheDocument()
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

  describe('onRowDoubleClick', () => {
    const columnsWithAction: ColumnDef<TestRow, unknown>[] = [
      ...columns,
      {
        id: 'actions',
        header: 'Actions',
        cell: () => <button type="button">Row action</button>,
      },
    ]

    it('fires with the row data when a cell is double-clicked', async () => {
      const user = userEvent.setup()
      const onRowDoubleClick = vi.fn()
      const data = makeRows(2)
      render(<DataTable columns={columns} data={data} onRowDoubleClick={onRowDoubleClick} />)

      await user.dblClick(screen.getByText('Row 2'))

      expect(onRowDoubleClick).toHaveBeenCalledWith(data[1])
      expect(onRowDoubleClick).toHaveBeenCalledTimes(1)
    })

    it('does NOT fire when the double-click lands on an interactive element in the row', async () => {
      const user = userEvent.setup()
      const onRowDoubleClick = vi.fn()
      const data = makeRows(1)
      render(<DataTable columns={columnsWithAction} data={data} onRowDoubleClick={onRowDoubleClick} />)

      await user.dblClick(screen.getByRole('button', { name: 'Row action' }))

      expect(onRowDoubleClick).not.toHaveBeenCalled()
    })

    it('is inert when no handler is provided', async () => {
      const user = userEvent.setup()
      const data = makeRows(1)
      // Must not throw with onDoubleClick left undefined.
      render(<DataTable columns={columns} data={data} />)

      await expect(user.dblClick(screen.getByText('Row 1'))).resolves.not.toThrow()
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
