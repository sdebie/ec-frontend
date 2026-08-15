import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import type { PaginationState } from '@tanstack/react-table'

import {
  DataTable,
  Segment,
  Label,
  OrderStatusDisplay,
} from '@/shared/ui/components'
import type { ColumnDef } from '@/shared/ui/components'
import { Input } from '@/shared/ui/primitives'
import { useCan } from '@/shared/auth/adminPermissions'
import { formatAmount } from '@/shared/utils/formatAmount'
import { OrderStatus, OrderStatusOptions } from '@/shared/types/enums/OrderStatus'
import { useOrders, useUpdateOrderStatus } from '@/admin/hooks/orders'
import type { AdminOrderSummary } from '@/admin/hooks/orders'
import { OrderActionsMenu } from './components/OrderActionsMenu'
import { getAvailableTransitions } from './utils/getAvailableTransitions'
import { useOrderStatusConfirmation } from './hooks/useOrderStatusConfirmation'
import { OrderStatusConfirmationDialog } from './components/OrderStatusConfirmationDialog'

// Derived from the status vocabulary itself so a new status cannot become
// unfilterable, and so no option can offer a status the backend does not have.
const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All' },
  ...Object.entries(OrderStatusOptions).map(([value, { label }]) => ({ value, label })),
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function OrderListPage() {
  const canMutate = useCan('order:write')

  const [statusFilter, setStatusFilter] = useState('ALL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const confirmation = useOrderStatusConfirmation()

  const { mutate: updateOrderStatus, isPending: isUpdatingStatus } = useUpdateOrderStatus()

  const { data, isLoading } = useOrders({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  })

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(e.target.value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToDate(e.target.value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleShip = useCallback((orderId: string) => {
    updateOrderStatus({ orderId, status: OrderStatus.IN_TRANSIT })
  }, [updateOrderStatus])

  const handleDeliver = useCallback((orderId: string) => {
    updateOrderStatus({ orderId, status: OrderStatus.DELIVERED })
  }, [updateOrderStatus])

  const askToConfirm = confirmation.ask

  const handleConfirmAction = () => {
    updateOrderStatus(confirmation.buildPayload(), { onSettled: confirmation.close })
  }

  const columns = useMemo<ColumnDef<AdminOrderSummary, unknown>[]>(
    () => [
      {
        accessorKey: 'reference',
        header: 'Reference',
        cell: ({ row }) => (
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
      },
      {
        accessorKey: 'placedAt',
        header: 'Order Date',
        cell: ({ row }) => formatDate(row.original.placedAt),
      },
      {
        accessorKey: 'itemCount',
        header: 'Items',
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => formatAmount(row.original.total),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <OrderStatusDisplay status={row.original.status} />,
      },
      ...(canMutate
        ? [
            {
              id: 'actions',
              header: 'Actions',
              cell: ({ row }: { row: { original: AdminOrderSummary } }) => {
                const order = row.original
                const transitions = getAvailableTransitions(order.status)
                if (transitions.length === 0) return null
                return (
                  <OrderActionsMenu
                    order={order}
                    canMutate={canMutate}
                    onMarkPaidInStore={() => askToConfirm('mark-paid-in-store', order.id, order.status)}
                    onShip={() => handleShip(order.id)}
                    onDeliver={() => handleDeliver(order.id)}
                    onCancel={() => askToConfirm('cancel', order.id, order.status)}
                    onRefund={() => askToConfirm('refund', order.id, order.status)}
                  />
                )
              },
            } as ColumnDef<AdminOrderSummary, unknown>,
          ]
        : []),
    ],
    [askToConfirm, canMutate, handleDeliver, handleShip],
  )

  const pageCount = data ? Math.ceil(data.total / pagination.pageSize) : 0

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-(--c-text)">Orders</h1>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <Segment
          options={STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="max-w-full overflow-x-auto"
        />

        <div className="flex items-center gap-4">
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
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        manualPagination
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

      <OrderStatusConfirmationDialog
        state={confirmation.state}
        restockItems={confirmation.restockItems}
        onRestockChange={confirmation.setRestockItems}
        onConfirm={handleConfirmAction}
        onClose={confirmation.close}
        isLoading={isUpdatingStatus}
      />
    </div>
  )
}
