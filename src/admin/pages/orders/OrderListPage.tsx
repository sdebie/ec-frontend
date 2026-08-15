import {useCallback, useMemo, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {Eye} from 'lucide-react'
import type {PaginationState} from '@tanstack/react-table'
import type {ColumnDef} from '@/shared/ui/components'
import {DataTable, Label, OrderStatusDisplay, RowActionButton, Select,} from '@/shared/ui/components'
import {Input} from '@/shared/ui/primitives'
import {useCan} from '@/shared/auth/adminPermissions'
import {formatAmount} from '@/shared/utils/formatAmount'
import {formatDate, formatTime} from '@/shared/utils/formatDateTime'
import {OrderStatus, OrderStatusOptions} from '@/shared/types/enums/OrderStatus'
import {useOrders} from './hooks/useOrders'
import {useUpdateOrderStatus} from './hooks/useUpdateOrderStatus'
import type {AdminOrderSummary} from '@/admin/pages/orders/types'
import {OrderActionsMenu} from './components/OrderActionsMenu'
import {useOrderStatusConfirmation} from './hooks/useOrderStatusConfirmation'
import type {ConfirmedAction} from './utils/confirmedActions'
import {OrderStatusConfirmationDialog} from './components/OrderStatusConfirmationDialog'

/**
 * Derived from the status vocabulary itself so a new status cannot become unfilterable,
 * and so no option can offer a status the backend does not have.
 *
 * The legacy values are excluded: no order can reach them any more, so offering them
 * gives staff filters that are empty for every order placed since the workflow changed.
 * They stay in the enum only so historic rows still render.
 */
const LEGACY_STATUSES: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.CANCELLED]

const STATUS_FILTER_OPTIONS = [
    {value: 'ALL', label: 'All'},
    ...Object.entries(OrderStatusOptions)
        .filter(([value]) => !LEGACY_STATUSES.includes(value as OrderStatus))
        .map(([value, {label}]) => ({value, label})),
]

export function OrderListPage() {
    const navigate = useNavigate()
    const canMutate = useCan('order:write')

    const [statusFilter, setStatusFilter] = useState('ALL')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    })

    const confirmation = useOrderStatusConfirmation()

    const {mutate: updateOrderStatus, isPending: isUpdatingStatus} = useUpdateOrderStatus()

    const {data, isLoading} = useOrders({
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
    })

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value)
        setPagination((prev) => ({...prev, pageIndex: 0}))
    }

    const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFromDate(e.target.value)
        setPagination((prev) => ({...prev, pageIndex: 0}))
    }

    const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setToDate(e.target.value)
        setPagination((prev) => ({...prev, pageIndex: 0}))
    }

    const askToConfirm = confirmation.ask

    /**
     * The transitions that ask before they run, by target status. Anything absent is a
     * forward fulfilment step: reversible by moving forward again, with nothing
     * outward-facing to warn about, so it goes straight through.
     */
    const CONFIRMED_BY_TARGET: Partial<Record<OrderStatus, ConfirmedAction>> = useMemo(
        () => ({
            [OrderStatus.IN_STORE_PAYMENT]: 'await-in-store-payment',
            [OrderStatus.USER_CANCELED]: 'cancel-customer',
            [OrderStatus.ADMIN_CANCELED]: 'cancel-staff',
            [OrderStatus.RETURNED_TO_ORIGIN]: 'return-to-origin',
            [OrderStatus.PARTIALLY_REFUNDED]: 'refund-partial',
            [OrderStatus.REFUNDED]: 'refund',
        }),
        [],
    )

    const handleSelect = useCallback(
        (orderId: string, fromStatus: OrderStatus, target: OrderStatus) => {
            const confirmed = CONFIRMED_BY_TARGET[target]
            if (confirmed) {
                askToConfirm(confirmed, orderId, fromStatus)
                return
            }
            updateOrderStatus({orderId, status: target})
        },
        [CONFIRMED_BY_TARGET, askToConfirm, updateOrderStatus],
    )

    const handleConfirmAction = () => {
        updateOrderStatus(confirmation.buildPayload(), {onSettled: confirmation.close})
    }

    const columns = useMemo<ColumnDef<AdminOrderSummary, unknown>[]>(
        () => [
            {
                accessorKey: 'placedAt',
                header: 'Order Date',
                cell: ({row}) => (
                    <span className="whitespace-nowrap">{formatDateTime(row.original.placedAt)}</span>
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
                // Guest checkout is a first-class path here, so an order with no linked customer
                // is ordinary rather than broken — it reads as "Guest", never as a blank cell the
                // reader has to interpret.
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
                            {/*
                A link rather than a button so it behaves like one — middle-click and
                open-in-new-tab both work, which matters on a list somebody works
                through. Rendered as a span inside it because RowActionButton would
                otherwise nest a button in the anchor.
              */}
                            <Link to={`/admin/orders/${order.id}`} aria-label={`View order ${order.reference}`}>
                                <RowActionButton as="span" title="View order">
                                    <Eye className="h-4 w-4"/>
                                </RowActionButton>
                            </Link>
                            {/*
                Gated separately from the view action: viewing is not mutating, so a
                VIEWER keeps the eye and loses only this.
              */}
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
        ],
        [canMutate, handleSelect],
    )

    const pageCount = data ? Math.ceil(data.total / pagination.pageSize) : 0

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold text-(--c-text)">Orders</h1>

            {/* Filters — status sits alongside the date range, all three on one row. */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <Label htmlFor="status-filter" className="mb-0">
                        Status
                    </Label>
                    <Select
                        options={STATUS_FILTER_OPTIONS}
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        ariaLabel="Filter by status"
                        className="min-w-56"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="from-date" className="mb-0">
                        From
                    </Label>
                    <Input
                        id="from-date"
                        type="date"
                        value={fromDate}
                        onChange={handleFromDateChange}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="to-date" className="mb-0">
                        To
                    </Label>
                    <Input
                        id="to-date"
                        type="date"
                        value={toDate}
                        onChange={handleToDateChange}
                    />
                </div>
            </div>

            <DataTable
                columns={columns}
                data={data?.data ?? []}
                isLoading={isLoading}
                onRowDoubleClick={(order) => navigate(`/admin/orders/${order.id}`)}
                manualPagination
                pageCount={pageCount}
                pagination={pagination}
                onPaginationChange={setPagination}
            />

            <OrderStatusConfirmationDialog
                state={confirmation.state}
                onConfirm={handleConfirmAction}
                onClose={confirmation.close}
                isLoading={isUpdatingStatus}
            />
        </div>
    )
}
