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
    type SortingState,
    useReactTable,
} from '@tanstack/react-table'
import {ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight} from 'lucide-react'
import * as React from 'react'
import {Input} from '@/shared/ui/primitives'
import {cn} from '@/shared/utils/cn'

export type {ColumnDef} from '@tanstack/react-table'

export interface DataTableProps<TData> {
    columns: ColumnDef<TData, unknown>[]
    data: TData[]
    isLoading?: boolean
    toolbarAction?: React.ReactNode
    manualPagination?: boolean
    pageCount?: number
    pagination?: PaginationState
    onPaginationChange?: OnChangeFn<PaginationState>
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
}

const DEFAULT_PAGE_SIZE = 10

export function DataTable<TData>({
                                     columns,
                                     data,
                                     isLoading = false,
                                     toolbarAction,
                                     manualPagination = false,
                                     pageCount,
                                     pagination: controlledPagination,
                                     onPaginationChange,
                                     globalSearchPlaceholder = 'Search...',
                                     showSearch = false,
                                     emptyMessage = 'No results found',
                                     className,
                                     initialPageSize = DEFAULT_PAGE_SIZE,
                                 }: DataTableProps<TData>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = React.useState('')

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            ...(manualPagination && controlledPagination ? {pagination: controlledPagination} : {}),
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
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
        ? data.length
        : table.getFilteredRowModel().rows.length

    const startItem = totalRows === 0 ? 0 : (currentPage - 1) * currentPageSize + 1
    const endItem = Math.min(currentPage * currentPageSize, totalRows)

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
                className="rounded-xl border border-(--c-border) overflow-hidden bg-(--c-table-header-bg) shadow-[0_1px_3px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.08)]">
                {/* Toolbar — hidden when showSearch=false and no toolbarAction */}
                {(showSearch || toolbarAction) && (
                    <div className="p-4 border-b border-(--c-border) bg-(--c-table-row-bg)">
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
                    <table className="w-full text-xs text-left text-(--c-text)">
                        <thead
                            className="text-xs font-semibold text-(--c-text-muted) bg-(--c-table-row-bg) border-b border-(--c-border) shadow-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const canSort = header.column.getCanSort()
                                    const sorted = header.column.getIsSorted()
                                    const isActionsColumn = header.column.id === 'actions'
                                    const isCheckboxColumn = header.column.id === 'checkbox'
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
                                    className="border-b border-(--c-border) last:border-0 bg-(--c-table-header-bg)">
                                    {columns.map((_, j) => (
                                        <td key={j} className="px-4 py-3">
                                            <div className="h-4 rounded bg-(--c-border) animate-pulse"/>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="h-36 text-center text-(--c-text-muted) bg-(--c-table-header-bg)"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-b border-(--c-border) last:border-0 bg-(--c-table-header-bg) hover:bg-(--c-table-row-hover) transition-colors duration-100"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                                            {cell.column.id === 'actions' || cell.column.id === 'checkbox' || cell.column.id === 'thumbnail' ? (
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
                        className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-(--c-border) bg-(--c-table-row-bg) gap-4">
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
