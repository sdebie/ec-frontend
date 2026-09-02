import {useMemo} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {Eye} from 'lucide-react'
import type {OnChangeFn, PaginationState, SortingState} from '@tanstack/react-table'

import type {ColumnDef} from '@/shared/ui/components'
import {DataTable, OrderStatusDisplay, RowActionButton} from '@/shared/ui/components'
import {formatAmount} from '@/shared/utils/formatAmount'
import {formatDateTime} from '@/shared/utils/formatDateTime'
import type {AdminOrderSummary} from '../types'

interface OrderTableProps {
    data: AdminOrderSummary[]
    isLoading: boolean
    pageCount: number
    totalRowCount: number
    pagination: PaginationState
    onPaginationChange: OnChangeFn<PaginationState>
    sorting: SortingState
    onSortingChange: OnChangeFn<SortingState>
}

/**
 * Row actions are view-only — status transitions live on the order detail page's
 * Order Actions panel, not in a row-level menu.
 */
export function OrderTable({
                               data,
                               isLoading,
                               pageCount,
                               totalRowCount,
                               pagination,
                               onPaginationChange,
                               sorting,
                               onSortingChange,
                           }: OrderTableProps) {
    const navigate = useNavigate()

    const columns = useMemo<ColumnDef<AdminOrderSummary, unknown>[]>(
        () => [
            {
                // accessorKey stays 'placedAt' — TanStack only makes a header clickable
                // when the column has a real accessorFn (getCanSort() checks it
                // explicitly), and accessorKey is what produces one. id is overridden to
                // 'createdAt', the entity's real column, because that id is sent to the
                // server unmodified as the sort key — see useTableSort's contract.
                accessorKey: 'placedAt',
                id: 'createdAt',
                header: 'Order Date',
                cell: ({row}) => (
                    <span className="whitespace-nowrap">
                        {formatDateTime(row.original.placedAt)}
                    </span>
                ),
            },
            {
                accessorKey: 'reference',
                header: 'Reference',
                // Not sortable: derived from the id (see OrderEntity.getReference()), not a
                // stored column, and a UUID carries no chronological order to sort by
                // anyway.
                enableSorting: false,
                cell: ({row}) => (
                    <Link
                        to={`/admin/orders/${row.original.id}`}
                        className="font-mono uppercase text-(--c-accent) hover:underline"
                    >
                        {row.original.reference}
                    </Link>
                ),
            },
            {
                accessorKey: 'customerName',
                header: 'Customer',
                // Not sortable: falls back from the customer's name to the checkout
                // contact's, so there is no single backend column it means.
                enableSorting: false,
                cell: ({row}) => row.original.customerName?.trim() || 'Guest',
            },
            {
                // Not sortable: the sum of line quantities, computed per order, not a
                // column — same shape as Quote Requests' itemCount.
                accessorKey: 'itemCount',
                header: 'Items',
                enableSorting: false,
            },
            {
                // Same accessorKey/id split as Order Date: 'total' produces the accessorFn
                // a clickable header needs, 'totalAmount' is the real column sent as the
                // sort key.
                accessorKey: 'total',
                id: 'totalAmount',
                header: 'Total',
                cell: ({row}) => formatAmount(row.original.total),
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({row}) => <OrderStatusDisplay status={row.original.status}/>,
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({row}: { row: { original: AdminOrderSummary } }) => {
                    const order = row.original
                    return (
                        <Link to={`/admin/orders/${order.id}`} aria-label={`View order ${order.reference}`}>
                            <RowActionButton as="span" title="View order">
                                <Eye className="h-4 w-4"/>
                            </RowActionButton>
                        </Link>
                    )
                },
            } as ColumnDef<AdminOrderSummary, unknown>,
        ],
        [],
    )

    return (
        <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            onRowDoubleClick={(order) => navigate(`/admin/orders/${order.id}`)}
            manualPagination
            pageCount={pageCount}
            totalRowCount={totalRowCount}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            manualSorting
            sorting={sorting}
            onSortingChange={onSortingChange}
        />
    )
}
