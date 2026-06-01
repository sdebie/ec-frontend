import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    ColumnFiltersState,
    PaginationState,
    useReactTable,
} from "@tanstack/react-table";
import {
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import * as React from "react";

import {Input} from '@/primitives/input';
import {cn} from "@/utils/cn";

type DataTableProps<T> = {
    data: T[];
    columns: ColumnDef<T, any>[];
    isLoading?: boolean;
    globalSearchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
    initialPageSize?: number;
    errorMsg?: string;
    highlightRows?: boolean;
    toolbarAction?: React.ReactNode;
    // Server-side pagination (opt-in)
    manualPagination?: boolean;
    serverPageCount?: number;
    serverTotalRows?: number;
    serverPageIndex?: number;
    serverPageSize?: number;
    onServerPageChange?: (pageIndex: number) => void;
    onServerPageSizeChange?: (pageSize: number) => void;
    /** When provided (together with manualPagination), search is delegated to the
     *  server instead of being applied client-side by TanStack Table. */
    onServerSearchChange?: (search: string) => void;
};

export function DataTable<T>({
                                 data,
                                 columns,
                                 isLoading = false,
                                 globalSearchPlaceholder = "Search...",
                                 emptyMessage = "No results found",
                                 className,
                                 initialPageSize = 10,
                                 errorMsg = "",
                                 highlightRows = false,
                                 toolbarAction,
                                 manualPagination = false,
                                 serverPageCount,
                                 serverTotalRows,
                                 serverPageIndex,
                                 serverPageSize,
                                 onServerPageChange,
                                 onServerPageSizeChange,
                                 onServerSearchChange,
                             }: DataTableProps<T>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = React.useState("");

    // Controlled pagination state used when manualPagination is true
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: serverPageIndex ?? 0,
        pageSize: serverPageSize ?? initialPageSize,
    });

    // Sync controlled pagination with server-driven props
    React.useEffect(() => {
        if (manualPagination) {
            setPagination({
                pageIndex: serverPageIndex ?? 0,
                pageSize: serverPageSize ?? initialPageSize,
            });
        }
    }, [manualPagination, serverPageIndex, serverPageSize, initialPageSize]);

    const handleServerPaginationChange = React.useCallback(
        (updater: PaginationState | ((prev: PaginationState) => PaginationState)) => {
            setPagination((prev) => {
                const next = typeof updater === "function" ? updater(prev) : updater;
                if (next.pageSize !== prev.pageSize) {
                    onServerPageSizeChange?.(next.pageSize);
                    onServerPageChange?.(0);
                    return {...next, pageIndex: 0};
                }
                if (next.pageIndex !== prev.pageIndex) {
                    onServerPageChange?.(next.pageIndex);
                }
                return next;
            });
        },
        [onServerPageChange, onServerPageSizeChange]
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            ...(manualPagination && {pagination}),
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        // When the server handles search, disable client-side filtering so
        // TanStack Table does not filter the already-paginated page rows.
        ...(manualPagination && onServerSearchChange ? {manualFiltering: true} : {}),
        ...(manualPagination
            ? {
                manualPagination: true,
                pageCount: serverPageCount ?? -1,
                onPaginationChange: handleServerPaginationChange,
            }
            : {
                initialState: {pagination: {pageSize: initialPageSize}},
            }),
    });

    // Reset to page 0 only when the global search filter changes.
    // data.length must NOT be a dependency: for server-side pagination every new
    // page may have a different number of rows, which would incorrectly reset the
    // page index back to 0 immediately after loading page 2+.
    React.useEffect(() => {
        table.setPageIndex(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalFilter]);

    const currentPage = manualPagination
        ? pagination.pageIndex + 1
        : table.getState().pagination.pageIndex + 1;
    const pageSize = manualPagination
        ? pagination.pageSize
        : table.getState().pagination.pageSize;
    const totalPages = manualPagination
        ? (serverPageCount ?? 1)
        : table.getPageCount();
    const totalRows = manualPagination
        ? (serverTotalRows ?? 0)
        : table.getFilteredRowModel().rows.length;

    const startItem = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalRows);

    const getPageNumbers = () => {
        const maxPagesToShow = 5;
        const pages: number[] = [];

        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = startPage + maxPagesToShow - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    const renderSortIcon = (sorted: false | "asc" | "desc") => {
        if (sorted === "asc") {
            return <ArrowUp className="h-3 w-3 text-(--c-text)"/>;
        }

        if (sorted === "desc") {
            return <ArrowDown className="h-3 w-3 text-(--c-text)"/>;
        }

        return <ArrowUpDown className="h-3 w-3"/>;
    };

    return (
        <div className={cn("w-full flex-1 flex flex-col", className)}>
            <div className="rounded-md border border-(--c-border) overflow-hidden bg-(--c-panel) shadow-sm">
                <>
                    <div className="p-4 border-b border-(--c-border) bg-(--c-panel)">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                            {toolbarAction && (
                                <div className="order-1 sm:order-2 w-full shrink-0 sm:w-auto *:w-full sm:*:w-auto">
                                    {toolbarAction}
                                </div>
                            )}

                            <div className="order-2 sm:order-1 flex-1 min-w-0">
                                <Input
                                    value={globalFilter ?? ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setGlobalFilter(value);
                                        if (manualPagination && onServerSearchChange) {
                                            onServerSearchChange(value);
                                        }
                                    }}
                                    placeholder={globalSearchPlaceholder}
                                />
                            </div>

                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-(--c-text)">
                            <thead
                                className="text-xs font-semibold text-(--c-text-muted) bg-(--c-surface-hover) border-b border-(--c-border) shadow-sm">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const canSort = header.column.getCanSort();
                                        const sorted = header.column.getIsSorted();
                                        const isActionsColumn = header.column.id === "actions";

                                        return (
                                            <th
                                                key={header.id}
                                                className={cn(
                                                    "px-6 py-4 whitespace-nowrap tracking-wider",
                                                    isActionsColumn && "text-center",
                                                    canSort &&
                                                    "cursor-pointer select-none hover:text-(--c-text) transition-colors group"
                                                )}
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        className={cn(
                                                            "flex items-center space-x-2",
                                                            isActionsColumn && "w-full justify-center"
                                                        )}
                                                    >
                                                        <span>
                                                            {flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
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
                                        );
                                    })}
                                </tr>
                            ))}
                            </thead>

                            <tbody>
                            {isLoading ? (
                                Array.from({length: 6}).map((_, i) => (
                                    <tr key={i} className="border-b border-(--c-border) last:border-0">
                                        {columns.map((_, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <div className="h-4 rounded bg-(--c-border) animate-pulse"/>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : errorMsg ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="h-48 text-center text-(--c-text-muted) bg-(--c-panel)"
                                    >
                                        {errorMsg}
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="h-48 text-center text-(--c-text-muted) bg-(--c-panel)"
                                    >
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={cn(
                                            "border-b border-(--c-border) last:border-0 bg-(--c-panel) transition-colors",
                                            highlightRows && "hover:bg-(--c-surface-hover)"
                                        )}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                key={cell.id}
                                                className="px-6 py-4 whitespace-nowrap"
                                            >
                                                {cell.column.id === "actions" ? (
                                                    <div className="flex items-center justify-center w-full">
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </div>
                                                ) : (
                                                    flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {!isLoading && (
                        <div
                            className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-(--c-border) bg-(--c-panel) rounded-b-md gap-4">
                            <div className="text-sm text-(--c-text-muted)">
                                Showing{" "}
                                <span className="font-medium text-(--c-text)">{startItem}</span> to{" "}
                                <span className="font-medium text-(--c-text)">{endItem}</span> of{" "}
                                <span className="font-medium text-(--c-text)">{totalRows}</span> results
                            </div>

                            <div className="flex items-center gap-3">
                                <select
                                    className="h-9 rounded-md border border-(--c-border) bg-(--c-panel) px-3 text-sm text-(--c-text)"
                                    value={pageSize}
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
                                                    "inline-flex items-center justify-center rounded-md w-8 h-8 text-sm transition-colors",
                                                    currentPage === page
                                                        ? "bg-primary text-white font-medium shadow-sm"
                                                        : "text-(--c-text) hover:bg-(--c-surface-hover)"
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
                </>
            </div>
        </div>
    );
}