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
import {clsx} from 'clsx';
import {Input} from "@/components/shared/input/Input.tsx";
import {Button} from "@/components/shared/button/Button.tsx";

type DataTableProps<T> = {
    data: T[];
    columns: ColumnDef<T, any>[];
    isLoading?: boolean;
    title?: string;
    globalSearchPlaceholder?: string;
};

export function DataTable<T>({
                                 data,
                                 columns,
                                 isLoading,
                                 title,
                                 globalSearchPlaceholder = "Search...",
                             }: DataTableProps<T>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = React.useState("");

    const table = useReactTable({
        data,
        columns,
        state: {sorting, columnFilters, globalFilter},
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
                    <p className="text-sm text-slate-500">
                        {table.getFilteredRowModel().rows.length} result(s)
                    </p>
                </div>

                <div className="w-full sm:w-72">
                    <Input
                        value={globalFilter ?? ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder={globalSearchPlaceholder}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-y border-slate-200">
                    {table.getHeaderGroups().map((hg) => (
                        <tr key={hg.id}>
                            {hg.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className={clsx(
                                        "px-4 py-3 text-left font-medium text-slate-700 whitespace-nowrap",
                                        header.column.getCanSort() && "cursor-pointer select-none"
                                    )}
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    <div className="flex items-center gap-2">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {{
                                            asc: "▲",
                                            desc: "▼",
                                        }[header.column.getIsSorted() as string] ?? null}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>

                    <tbody>
                    {isLoading ? (
                        <tr>
                            <td className="px-4 py-6 text-slate-500" colSpan={columns.length}>
                                Loading...
                            </td>
                        </tr>
                    ) : table.getRowModel().rows.length ? (
                        table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-4 py-3 text-slate-700 whitespace-nowrap">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="px-4 py-6 text-slate-500" colSpan={columns.length}>
                                No results.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-600">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>

                <div className="flex items-center gap-2">
                    <select
                        className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                    >
                        {[10, 20, 50].map((s) => (
                            <option key={s} value={s}>
                                {s} / page
                            </option>
                        ))}
                    </select>

                    <Button
                        variant="secondary"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Prev
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}