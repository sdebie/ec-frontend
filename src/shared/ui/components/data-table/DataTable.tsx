import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type OnChangeFn,
    type PaginationState,
    type RowSelectionState,
    type SortingState,
    useReactTable,
} from '@tanstack/react-table'
import {ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight} from 'lucide-react'
import * as React from 'react'
import {Input, Skeleton} from '@/shared/ui/primitives'
import {cn} from '@/shared/utils/cn'
import {clampItemRange} from '@/shared/utils/pagination'

export type {ColumnDef} from '@tanstack/react-table'

export interface DataTableProps<TData> {
    columns: ColumnDef<TData, unknown>[]
    data: TData[]
    isLoading?: boolean
    toolbarAction?: React.ReactNode
    manualPagination?: boolean
    pageCount?: number
    /**
     * The true row count across every page, for the "Showing X to Y of Z" summary.
     * `data` under manualPagination is only the current page's rows, so without this the
     * summary's Z falls back to that page's length instead of the real total.
     */
    totalRowCount?: number
    pagination?: PaginationState
    onPaginationChange?: OnChangeFn<PaginationState>
    /** Server-driven sorting: the caller owns sorting state and refetches on change,
     * instead of DataTable re-sorting the current page's rows client-side. Only
     * meaningful alongside manualPagination — sorting one fetched page client-side
     * on a server-paginated table wouldn't sort the full result set. */
    manualSorting?: boolean
    sorting?: SortingState
    onSortingChange?: OnChangeFn<SortingState>
    /** Placeholder text for the global search input */
    globalSearchPlaceholder?: string
    /** Set to true to enable the built-in toolbar search input (only correct for fully client-side tables with no server pagination) */
    showSearch?: boolean
    /** Message shown when there are no rows */
    emptyMessage?: string
    /** Additional className for the root container */
    className?: string
    /** Initial page size for client-side pagination */
    initialPageSize?: number
    /**
     * Fires on double-clicking a row, with that row's data. Double-clicks that
     * land on an interactive element within the row (a button, link, checkbox)
     * are ignored, so an in-row action can't also trigger this.
     */
    onRowDoubleClick?: (row: TData) => void
    /** Enable built-in row selection with checkboxes. Default: false */
    enableRowSelection?: boolean
    /** Set of currently-selected row ids (controlled selection state) */
    selectedRowIds?: Set<string>
    /** Callback fired when selection changes, providing the updated set of selected ids */
    onRowSelectionChange?: (selectedIds: Set<string>) => void
    /**
     * Accessor function to get the unique row id. Default: reads a string `row.id`,
     * falling back to the row's index (with a dev warning) when TData has none.
     */
    getRowId?: (row: TData) => string
}

const DEFAULT_PAGE_SIZE = 10

/** Checkbox that supports the native indeterminate state via a ref + useEffect. */
function SelectionCheckbox({
    checked,
    indeterminate,
    onChange,
    'aria-label': ariaLabel,
}: {
    checked: boolean
    indeterminate: boolean
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    'aria-label'?: string
}) {
    const ref = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate
        }
    }, [indeterminate])

    return (
        <label className="group inline-flex items-center justify-center cursor-pointer">
            <input
                ref={ref}
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={onChange}
                aria-label={ariaLabel}
            />
            <span className="w-[18px] h-[18px] rounded-[4px] border-2 border-(--c-text-muted) bg-(--c-panel) group-has-[:checked]:bg-(--c-accent) group-has-[:checked]:border-(--c-accent) group-has-[:indeterminate]:bg-(--c-accent) group-has-[:indeterminate]:border-(--c-accent) flex items-center justify-center transition-colors duration-150">
                <svg className="w-3 h-3 text-transparent group-has-[:checked]:text-(--c-accent-text) pointer-events-none group-has-[:indeterminate]:hidden" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <svg className="w-3 h-3 text-transparent group-has-[:indeterminate]:text-(--c-accent-text) pointer-events-none hidden group-has-[:indeterminate]:block" viewBox="0 0 10 2" fill="none">
                    <path d="M1 1h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
            </span>
        </label>
    )
}

export function DataTable<TData>({
                                     columns,
                                     data,
                                     isLoading = false,
                                     toolbarAction,
                                     manualPagination = false,
                                     pageCount,
                                     totalRowCount,
                                     pagination: controlledPagination,
                                     onPaginationChange,
                                     manualSorting = false,
                                     sorting: controlledSorting,
                                     onSortingChange: onSortingChangeProp,
                                     globalSearchPlaceholder = 'Search...',
                                     showSearch = false,
                                     emptyMessage = 'No results found',
                                     className,
                                     initialPageSize = DEFAULT_PAGE_SIZE,
                                     onRowDoubleClick,
                                     enableRowSelection = false,
                                     selectedRowIds,
                                     onRowSelectionChange,
                                     getRowId: getRowIdProp,
                                 }: DataTableProps<TData>) {
    const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = React.useState('')

    const sorting = manualSorting && controlledSorting ? controlledSorting : internalSorting
    const handleSortingChange = manualSorting && onSortingChangeProp ? onSortingChangeProp : setInternalSorting

    // --- Row selection ---
    const getRowId = React.useCallback(
        (row: TData, index: number) => {
            if (getRowIdProp) return getRowIdProp(row)
            const id = (row as Record<string, unknown> | null)?.id
            if (typeof id === 'string') return id
            if (import.meta.env.DEV) {
                console.warn(
                    '[DataTable] enableRowSelection is set but a row has no string `id` field — ' +
                    'pass getRowId to derive a stable id. Falling back to the row index, which is ' +
                    'not stable across sorting, filtering, or pagination.',
                )
            }
            return String(index)
        },
        [getRowIdProp],
    )

    // Convert external Set<string> → tanstack-table's Record<string, boolean>
    const rowSelectionState: RowSelectionState = React.useMemo(() => {
        if (!enableRowSelection || !selectedRowIds) return {}
        const state: RowSelectionState = {}
        selectedRowIds.forEach((id) => { state[id] = true })
        return state
    }, [enableRowSelection, selectedRowIds])

    // Convert tanstack-table's internal format back to Set<string> on change
    const handleRowSelectionChange: OnChangeFn<RowSelectionState> = React.useCallback(
        (updaterOrValue) => {
            if (!onRowSelectionChange) return
            const next = typeof updaterOrValue === 'function'
                ? updaterOrValue(rowSelectionState)
                : updaterOrValue
            const ids = new Set<string>(Object.keys(next).filter((k) => next[k]))
            onRowSelectionChange(ids)
        },
        [onRowSelectionChange, rowSelectionState],
    )

    // Build the checkbox column injected as first column when selection is enabled
    const selectionColumn: ColumnDef<TData, unknown> = React.useMemo(
        () => ({
            id: 'selection',
            header: ({table: tbl}) => {
                const allSelected = tbl.getIsAllPageRowsSelected()
                const someSelected = tbl.getIsSomePageRowsSelected()
                return (
                    <SelectionCheckbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={tbl.getToggleAllPageRowsSelectedHandler()}
                        aria-label="Select all rows"
                    />
                )
            },
            cell: ({row}) => (
                <SelectionCheckbox
                    checked={row.getIsSelected()}
                    indeterminate={false}
                    onChange={row.getToggleSelectedHandler()}
                    aria-label={`Select row`}
                />
            ),
            enableSorting: false,
        }),
        [],
    )

    const effectiveColumns = React.useMemo(
        () => enableRowSelection ? [selectionColumn, ...columns] : columns,
        [enableRowSelection, selectionColumn, columns],
    )

    /*
      A server-paginated table holds one page of a larger result set, not the full thing.
      Sorting it locally can only reorder the rows already fetched, which answers a
      different question than "sort every matching row" — and because the sort state
      outlives that page, it goes on silently reordering every later fetch too. A table in
      this shape has no way to sort correctly, so every header must render as unsortable
      rather than offer a click nothing can honour. `manualSorting` is the caller stating it
      has wired up a real server sort (see `useTableSort`) instead of leaving this unset by
      omission.
    */
    const sortingDisabledByGuard = manualPagination && !manualSorting
    if (sortingDisabledByGuard && import.meta.env.DEV) {
        const stillSortable = columns.some((column) => column.enableSorting !== false)
        if (stillSortable) {
            console.warn(
                '[DataTable] manualPagination is set without manualSorting — every column is ' +
                'being rendered unsortable rather than sorting the current page locally, which ' +
                "would only reorder the rows already fetched. Wire up server-side sorting with " +
                'useTableSort (sorting + onSortingChange + manualSorting) if these columns should ' +
                'be sortable.',
            )
        }
    }

    const table = useReactTable({
        data,
        columns: effectiveColumns,
        getRowId: enableRowSelection ? (row, index) => getRowId(row, index) : undefined,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            ...(manualPagination && controlledPagination ? {pagination: controlledPagination} : {}),
            ...(enableRowSelection ? {rowSelection: rowSelectionState} : {}),
        },
        onSortingChange: handleSortingChange,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        ...(enableRowSelection ? {
            enableRowSelection: true,
            onRowSelectionChange: handleRowSelectionChange,
        } : {}),
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableSorting: !sortingDisabledByGuard,
        ...(manualSorting ? {manualSorting: true} : {}),
        ...(manualPagination
            ? {
                manualPagination: true,
                pageCount: pageCount ?? -1,
                onPaginationChange: onPaginationChange,
            }
            : {
                initialState: {pagination: {pageSize: initialPageSize}},
            }),
    })

    // Reset to page 0 when global filter changes
    React.useEffect(() => {
        table.setPageIndex(0)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalFilter])

    const currentPage = manualPagination && controlledPagination
        ? controlledPagination.pageIndex + 1
        : table.getState().pagination.pageIndex + 1
    const currentPageSize = manualPagination && controlledPagination
        ? controlledPagination.pageSize
        : table.getState().pagination.pageSize
    const totalPages = manualPagination
        ? (pageCount ?? 1)
        : table.getPageCount()
    const totalRows = manualPagination
        ? (totalRowCount ?? data.length)
        : table.getFilteredRowModel().rows.length

    const {start: startItem, end: endItem} = clampItemRange(currentPage, currentPageSize, totalRows)

    const getPageNumbers = () => {
        const maxPagesToShow = 5
        const pages: number[] = []

        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
        let endPage = startPage + maxPagesToShow - 1

        if (endPage > totalPages) {
            endPage = totalPages
            startPage = Math.max(1, endPage - maxPagesToShow + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }

        return pages
    }

    const renderSortIcon = (sorted: false | 'asc' | 'desc') => {
        if (sorted === 'asc') {
            return <ArrowUp className="h-3 w-3 text-(--c-text)"/>
        }
        if (sorted === 'desc') {
            return <ArrowDown className="h-3 w-3 text-(--c-text)"/>
        }
        return <ArrowUpDown className="h-3 w-3"/>
    }

    return (
        <div className={cn('w-full flex-1 flex flex-col', className)}>
            <div
                className="rounded-xl border border-(--c-border) overflow-hidden bg-(--c-table-row-bg) shadow-[0_1px_3px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.08)]">
                {/* Toolbar — hidden when showSearch=false and no toolbarAction */}
                {(showSearch || toolbarAction) && (
                    <div className="p-4 border-b border-(--c-border) bg-(--c-table-header-bg)">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                            {toolbarAction && (
                                <div className="order-1 sm:order-2 w-full shrink-0 sm:w-auto *:w-full sm:*:w-auto">
                                    {toolbarAction}
                                </div>
                            )}

                            {showSearch && (
                                <div className="order-2 sm:order-1 flex-1 min-w-0">
                                    <Input
                                        value={globalFilter ?? ''}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        placeholder={globalSearchPlaceholder}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-(--c-text)">
                        <thead
                            className="text-xs font-semibold text-(--c-text-muted) bg-(--c-table-header-bg) border-b border-(--c-border) shadow-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const canSort = header.column.getCanSort()
                                    const sorted = header.column.getIsSorted()
                                    const isActionsColumn = header.column.id === 'actions'
                                    const isCheckboxColumn = header.column.id === 'checkbox' || header.column.id === 'selection'
                                    const isThumbnailColumn = header.column.id === 'thumbnail'

                                    return (
                                        <th
                                            key={header.id}
                                            className={cn(
                                                'px-4 py-3 whitespace-nowrap tracking-wider',
                                                (isActionsColumn || isCheckboxColumn) && 'text-center w-10',
                                                isThumbnailColumn && 'text-center w-12',
                                                canSort && 'cursor-pointer select-none hover:text-(--c-text) transition-colors group'
                                            )}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={cn(
                                                        'flex items-center space-x-2',
                                                        (isActionsColumn || isCheckboxColumn || isThumbnailColumn) && 'w-full justify-center'
                                                    )}
                                                >
                            <span>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </span>
                                                    {canSort && (
                                                        <span
                                                            className="inline-flex text-(--c-text-muted)/50 group-hover:text-(--c-text-muted) transition-colors">
                                {renderSortIcon(sorted)}
                              </span>
                                                    )}
                                                </div>
                                            )}
                                        </th>
                                    )
                                })}
                            </tr>
                        ))}
                        </thead>

                        <tbody>
                        {isLoading ? (
                            Array.from({length: 6}).map((_, i) => (
                                <tr key={i}
                                    className="border-b border-(--c-border) last:border-0 bg-(--c-table-row-bg)">
                                    {effectiveColumns.map((_, j) => (
                                        <td key={j} className="px-4 py-3">
                                            <Skeleton.Bar />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={effectiveColumns.length}
                                    className="h-36 text-center text-(--c-text-muted) bg-(--c-table-row-bg)"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    onDoubleClick={onRowDoubleClick ? (e) => {
                                        // A double click that lands on a button/link/input
                                        // inside the row is that element's own action, not
                                        // a row-level one — e.g., don't navigate away while
                                        // the user is double-clicking a Delete icon.
                                        const target = e.target as HTMLElement
                                        if (target.closest('button, a, input, [role="button"]')) return
                                        onRowDoubleClick(row.original)
                                    } : undefined}
                                    className="border-b border-(--c-border) last:border-0 bg-(--c-table-row-bg) hover:bg-(--c-table-row-hover) transition-colors duration-100"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                                            {cell.column.id === 'actions' || cell.column.id === 'checkbox' || cell.column.id === 'selection' || cell.column.id === 'thumbnail' ? (
                                                <div className="flex items-center justify-center w-full">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </div>
                                            ) : (
                                                flexRender(cell.column.columnDef.cell, cell.getContext())
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                {!isLoading && (
                    <div
                        className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-(--c-border) bg-(--c-table-header-bg) gap-4">
                        <div className="text-sm text-(--c-text-muted)">
                            Showing{' '}
                            <span className="font-medium text-(--c-text)">{startItem}</span> to{' '}
                            <span className="font-medium text-(--c-text)">{endItem}</span> of{' '}
                            <span className="font-medium text-(--c-text)">{totalRows}</span> results
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                className="h-9 rounded-md border border-(--c-border) bg-(--c-panel) px-3 text-sm text-(--c-text)"
                                value={currentPageSize}
                                onChange={(e) => table.setPageSize(Number(e.target.value))}
                            >
                                {[10, 20, 50].map((size) => (
                                    <option key={size} value={size}>
                                        {size} / page
                                    </option>
                                ))}
                            </select>

                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="inline-flex items-center justify-center rounded-md p-1.5 text-(--c-text-muted) hover:text-(--c-text) hover:bg-(--c-surface-hover) disabled:opacity-50 disabled:pointer-events-none transition-colors"
                                    title="Previous Page"
                                >
                                    <ChevronLeft className="h-4 w-4"/>
                                    <span className="sr-only">Previous</span>
                                </button>

                                <div className="flex items-center space-x-1">
                                    {getPageNumbers().map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => table.setPageIndex(page - 1)}
                                            className={cn(
                                                'inline-flex items-center justify-center rounded-md w-8 h-8 text-sm transition-colors',
                                                currentPage === page
                                                    ? 'bg-(--c-accent) text-(--c-accent-text) font-medium shadow-sm'
                                                    : 'text-(--c-text) hover:bg-(--c-surface-hover)'
                                            )}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="inline-flex items-center justify-center rounded-md p-1.5 text-(--c-text-muted) hover:text-(--c-text) hover:bg-(--c-surface-hover) disabled:opacity-50 disabled:pointer-events-none transition-colors"
                                    title="Next Page"
                                >
                                    <ChevronRight className="h-4 w-4"/>
                                    <span className="sr-only">Next</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
