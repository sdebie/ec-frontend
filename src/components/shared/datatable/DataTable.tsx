import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    ColumnFiltersState,
    useReactTable,
} from "@tanstack/react-table";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react";

import {cn} from "@/utils/cn";
import {Input} from "@/components/shared/input/Input.tsx";

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
                             }: DataTableProps<T>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = React.useState("");

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: initialPageSize,
            },
        },
    });

    React.useEffect(() => {
        table.setPageIndex(0);
    }, [globalFilter, data.length, table]);

    const currentPage = table.getState().pagination.pageIndex + 1;
    const pageSize = table.getState().pagination.pageSize;
    const totalPages = table.getPageCount();
    const totalRows = table.getFilteredRowModel().rows.length;

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
            return <ArrowUp className="h-3 w-3 text-admin-text"/>;
        }

        if (sorted === "desc") {
            return <ArrowDown className="h-3 w-3 text-admin-text"/>;
        }

        return <ArrowUpDown className="h-3 w-3"/>;
    };

    return (
        <div className={cn("w-full flex-1 flex flex-col", className)}>
            <div className="rounded-md border border-admin-border overflow-hidden bg-admin-panel shadow-sm">
                <>
                    <div className="p-4 border-b border-admin-border bg-admin-panel">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                            {toolbarAction && (
                                <div className="order-1 sm:order-2 w-full shrink-0 sm:w-auto *:w-full sm:*:w-auto">
                                    {toolbarAction}
                                </div>
                            )}

                            <div className="order-2 sm:order-1 flex-1 min-w-0">
                                <Input
                                    value={globalFilter ?? ""}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    placeholder={globalSearchPlaceholder}
                                />
                            </div>

                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-admin-text">
                            <thead
                                className="text-xs uppercase font-semibold text-admin-text-muted bg-admin-sidebar-hover border-b border-admin-border shadow-sm">
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
                                                    "cursor-pointer select-none hover:text-admin-text transition-colors group"
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
                                                                className="inline-flex text-admin-text-muted/50 group-hover:text-admin-text-muted transition-colors">
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
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="h-48 text-center bg-admin-panel"
                                    >
                                        <Loader2 className="h-6 w-6 animate-spin text-admin-text-muted mx-auto"/>
                                    </td>
                                </tr>
                            ) : errorMsg ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="h-48 text-center text-admin-text-muted bg-admin-panel"
                                    >
                                        {errorMsg}
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="h-48 text-center text-admin-text-muted bg-admin-panel"
                                    >
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className={cn(
                                            "border-b border-admin-border last:border-0 bg-admin-panel transition-colors",
                                            highlightRows && "hover:bg-admin-sidebar-hover"
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
                            className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-admin-border bg-admin-panel rounded-b-md gap-4">
                            <div className="text-sm text-admin-text-muted">
                                Showing{" "}
                                <span className="font-medium text-admin-text">{startItem}</span> to{" "}
                                <span className="font-medium text-admin-text">{endItem}</span> of{" "}
                                <span className="font-medium text-admin-text">{totalRows}</span> results
                            </div>

                            <div className="flex items-center gap-3">
                                <select
                                    className="h-9 rounded-md border border-admin-border bg-admin-panel px-3 text-sm text-admin-text"
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
                                        className="inline-flex items-center justify-center rounded-md p-1.5 text-admin-text-muted hover:text-admin-text hover:bg-admin-sidebar-hover disabled:opacity-50 disabled:pointer-events-none transition-colors"
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
                                                        : "text-admin-text hover:bg-admin-sidebar-hover"
                                                )}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                        className="inline-flex items-center justify-center rounded-md p-1.5 text-admin-text-muted hover:text-admin-text hover:bg-admin-sidebar-hover disabled:opacity-50 disabled:pointer-events-none transition-colors"
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