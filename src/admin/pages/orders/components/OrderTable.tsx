import {useCallback, useMemo} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {Eye} from 'lucide-react'
import type {OnChangeFn, PaginationState} from '@tanstack/react-table'

import type {ColumnDef} from '@/shared/ui/components'
import {DataTable, OrderStatusDisplay, RowActionButton} from '@/shared/ui/components'
import {formatAmount} from '@/shared/utils/formatAmount'
import {formatDateTime} from '@/shared/utils/formatDateTime'
import {OrderStatus} from '@/shared/types/enums/OrderStatus'
import type {AdminOrderSummary} from '../types'
import {useUpdateOrderStatus} from '../hooks/useUpdateOrderStatus'
import {useOrderStatusConfirmation} from '../hooks/useOrderStatusConfirmation'
import type {ConfirmedAction} from '../utils/confirmedActions'
import {OrderActionsMenu} from './OrderActionsMenu'
import {OrderStatusConfirmationDialog} from './OrderStatusConfirmationDialog'

/**
 * The transitions that ask before they run, by target status. Anything absent is a forward
 * fulfilment step: reversible by moving forward again, with nothing outward-facing to warn
 * about, so it goes straight through.
 */
const CONFIRMED_BY_TARGET: Partial<Record<OrderStatus, ConfirmedAction>> = {
    [OrderStatus.IN_STORE_PAYMENT]: 'await-in-store-payment',
    [OrderStatus.USER_CANCELED]: 'cancel-customer',
    [OrderStatus.ADMIN_CANCELED]: 'cancel-staff',
    [OrderStatus.RETURNED_TO_ORIGIN]: 'return-to-origin',
    [OrderStatus.PARTIALLY_REFUNDED]: 'refund-partial',
    [OrderStatus.REFUNDED]: 'refund',
}

interface OrderTableProps {
    data: AdminOrderSummary[]
    isLoading: boolean
    canMutate: boolean
    pageCount: number
    pagination: PaginationState
    onPaginationChange: OnChangeFn<PaginationState>
}

/**
 * Owns the status transitions it offers, along with the dialog that confirms the
 * destructive ones — the row action and its consequence are one concern, and splitting
 * them across the page boundary would put half of it out of view of the other half.
 */
export function OrderTable({
                               data,
                               isLoading,
                               canMutate,
                               pageCount,
                               pagination,
                               onPaginationChange,
                           }: OrderTableProps) {
    const navigate = useNavigate()
    const confirmation = useOrderStatusConfirmation()
    const {mutate: updateOrderStatus, isPending: isUpdatingStatus} = useUpdateOrderStatus()

    const askToConfirm = confirmation.ask

    const handleSelect = useCallback(
        (orderId: string, fromStatus: OrderStatus, target: OrderStatus) => {
            const confirmed = CONFIRMED_BY_TARGET[target]
            if (confirmed) {
                askToConfirm(confirmed, orderId, fromStatus)
                return
            }
            updateOrderStatus({orderId, status: target})
        },
        [askToConfirm, updateOrderStatus],
    )

    const handleConfirmAction = () => {
        updateOrderStatus(confirmation.buildPayload(), {onSettled: confirmation.close})
    }

    const columns = useMemo<ColumnDef<AdminOrderSummary, unknown>[]>(() => {
        const definitions: ColumnDef<AdminOrderSummary, unknown>[] = [
            {
                accessorKey: 'placedAt',
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
                cell: ({row}) => row.original.customerName?.trim() || 'Guest',
            },
            {
                accessorKey: 'itemCount',
                header: 'Items',
            },
            {
                accessorKey: 'total',
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
                cell: ({row}: { row: { original: AdminOrderSummary } }) => {
                    const order = row.original
                    return (
                        <div className="flex items-center gap-1">
                            <Link to={`/admin/orders/${order.id}`} aria-label={`View order ${order.reference}`}>
                                <RowActionButton as="span" title="View order">
                                    <Eye className="h-4 w-4"/>
                                </RowActionButton>
                            </Link>

                            {canMutate && (
                                <OrderActionsMenu
                                    order={order}
                                    canMutate={canMutate}
                                    onSelect={(target) => handleSelect(order.id, order.status, target)}
                                />
                            )}
                        </div>
                    )
                },
            } as ColumnDef<AdminOrderSummary, unknown>,
        ]

        // The server orders newest first and pages against that order, so no column here is
        // sortable. A client-side sort can only reach the rows already fetched — it would
        // reorder this page of ten and leave the rest of the result set where it was, which
        // answers a different question from the one the header appears to ask. The state
        // also outlives the rows, so a sort clicked once silently reorders every later
        // filter and page. Sorting by a column has to be asked of the server first.
        return definitions.map((column) => ({...column, enableSorting: false}))
    }, [canMutate, handleSelect])

    return (
        <>
            <DataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
                onRowDoubleClick={(order) => navigate(`/admin/orders/${order.id}`)}
                manualPagination
                pageCount={pageCount}
                pagination={pagination}
                onPaginationChange={onPaginationChange}
            />

            <OrderStatusConfirmationDialog
                state={confirmation.state}
                onConfirm={handleConfirmAction}
                onClose={confirmation.close}
                isLoading={isUpdatingStatus}
            />
        </>
    )
}
