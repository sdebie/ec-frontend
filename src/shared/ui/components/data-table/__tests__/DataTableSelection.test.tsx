import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable } from '../DataTable'
import type { ColumnDef } from '@tanstack/react-table'

interface TestRow {
  id: string
  name: string
}

const columns: ColumnDef<TestRow, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
]

function makeRows(count: number): TestRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `row-${i + 1}`,
    name: `Item ${i + 1}`,
  }))
}

describe('DataTable row selection', () => {
  it('renders a checkbox column when enableRowSelection=true', () => {
    const data = makeRows(3)
    render(
      <DataTable
        columns={columns}
        data={data}
        enableRowSelection
        selectedRowIds={new Set()}
        onRowSelectionChange={vi.fn()}
      />
    )

    // Header checkbox + one per row = 4 total
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes).toHaveLength(4)
    expect(screen.getByLabelText('Select all rows')).toBeInTheDocument()
  })

  it('does not render a checkbox column when enableRowSelection is not set', () => {
    const data = makeRows(3)
    render(<DataTable columns={columns} data={data} />)

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('select-all toggles all visible rows', async () => {
    const user = userEvent.setup()
    const data = makeRows(3)
    const onChange = vi.fn()

    render(
      <DataTable
        columns={columns}
        data={data}
        enableRowSelection
        selectedRowIds={new Set()}
        onRowSelectionChange={onChange}
      />
    )

    const selectAll = screen.getByLabelText('Select all rows')
    await user.click(selectAll)

    expect(onChange).toHaveBeenCalledTimes(1)
    const selectedIds = onChange.mock.calls[0][0] as Set<string>
    expect(selectedIds).toEqual(new Set(['row-1', 'row-2', 'row-3']))
  })

  it('shows indeterminate state on header checkbox when partial selection', () => {
    const data = makeRows(3)

    render(
      <DataTable
        columns={columns}
        data={data}
        enableRowSelection
        selectedRowIds={new Set(['row-1'])}
        onRowSelectionChange={vi.fn()}
      />
    )

    // The header checkbox is the sr-only input inside the SelectionCheckbox component
    const headerCheckbox = screen.getByLabelText('Select all rows') as HTMLInputElement
    expect(headerCheckbox.indeterminate).toBe(true)
    expect(headerCheckbox.checked).toBe(false)
  })

  it('header checkbox is fully checked when all visible rows are selected', () => {
    const data = makeRows(3)

    render(
      <DataTable
        columns={columns}
        data={data}
        enableRowSelection
        selectedRowIds={new Set(['row-1', 'row-2', 'row-3'])}
        onRowSelectionChange={vi.fn()}
      />
    )

    const headerCheckbox = screen.getByLabelText('Select all rows') as HTMLInputElement
    expect(headerCheckbox.indeterminate).toBe(false)
    expect(headerCheckbox.checked).toBe(true)
  })

  it('onRowSelectionChange fires with correct id set when a row is selected', async () => {
    const user = userEvent.setup()
    const data = makeRows(3)
    const onChange = vi.fn()

    render(
      <DataTable
        columns={columns}
        data={data}
        enableRowSelection
        selectedRowIds={new Set()}
        onRowSelectionChange={onChange}
      />
    )

    // Click the first row's checkbox (index 1 — index 0 is the header checkbox)
    const rowCheckboxes = screen.getAllByLabelText('Select row')
    await user.click(rowCheckboxes[0])

    expect(onChange).toHaveBeenCalledTimes(1)
    const selectedIds = onChange.mock.calls[0][0] as Set<string>
    expect(selectedIds).toEqual(new Set(['row-1']))
  })

  it('onRowSelectionChange fires with accumulated ids when adding to selection', async () => {
    const user = userEvent.setup()
    const data = makeRows(3)
    const onChange = vi.fn()

    render(
      <DataTable
        columns={columns}
        data={data}
        enableRowSelection
        selectedRowIds={new Set(['row-1'])}
        onRowSelectionChange={onChange}
      />
    )

    // Click the second row's checkbox to add it
    const rowCheckboxes = screen.getAllByLabelText('Select row')
    await user.click(rowCheckboxes[1])

    expect(onChange).toHaveBeenCalledTimes(1)
    const selectedIds = onChange.mock.calls[0][0] as Set<string>
    expect(selectedIds).toEqual(new Set(['row-1', 'row-2']))
  })

  it('selection persists across page changes (ids retained when data changes)', () => {
    const page1Data = makeRows(3)
    const onChange = vi.fn()

    const { rerender } = render(
      <DataTable
        columns={columns}
        data={page1Data}
        enableRowSelection
        selectedRowIds={new Set(['row-1', 'row-2'])}
        onRowSelectionChange={onChange}
        manualPagination
        pageCount={2}
        pagination={{ pageIndex: 0, pageSize: 3 }}
        onPaginationChange={vi.fn()}
      />
    )

    // Simulate page change — new data, same selectedRowIds (consumer-owned state)
    const page2Data: TestRow[] = [
      { id: 'row-4', name: 'Item 4' },
      { id: 'row-5', name: 'Item 5' },
      { id: 'row-6', name: 'Item 6' },
    ]

    rerender(
      <DataTable
        columns={columns}
        data={page2Data}
        enableRowSelection
        selectedRowIds={new Set(['row-1', 'row-2'])}
        onRowSelectionChange={onChange}
        manualPagination
        pageCount={2}
        pagination={{ pageIndex: 1, pageSize: 3 }}
        onPaginationChange={vi.fn()}
      />
    )

    // The consumer still holds the same selection — page 2's checkboxes are unchecked
    // because page 2 rows are not in the selectedRowIds set
    const rowCheckboxes = screen.getAllByLabelText('Select row')
    rowCheckboxes.forEach((checkbox) => {
      expect((checkbox as HTMLInputElement).checked).toBe(false)
    })

    // The onRowSelectionChange was NOT called during the page change — selection is stable
    expect(onChange).not.toHaveBeenCalled()
  })

  it('uses custom getRowId accessor when provided', async () => {
    const user = userEvent.setup()
    interface CustomRow {
      code: string
      label: string
    }
    const customColumns: ColumnDef<CustomRow, unknown>[] = [
      { accessorKey: 'label', header: 'Label' },
    ]
    const data: CustomRow[] = [
      { code: 'abc', label: 'First' },
      { code: 'def', label: 'Second' },
    ]
    const onChange = vi.fn()

    render(
      <DataTable
        columns={customColumns}
        data={data}
        enableRowSelection
        selectedRowIds={new Set()}
        onRowSelectionChange={onChange}
        getRowId={(row) => row.code}
      />
    )

    const rowCheckboxes = screen.getAllByLabelText('Select row')
    await user.click(rowCheckboxes[0])

    expect(onChange).toHaveBeenCalledTimes(1)
    const selectedIds = onChange.mock.calls[0][0] as Set<string>
    expect(selectedIds).toEqual(new Set(['abc']))
  })
})
