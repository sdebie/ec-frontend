import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import type { PaginationState } from '@tanstack/react-table'

import {
  DataTable,
  Segment,
  ConfirmationDialog,
  OrderStatusDisplay,
} from '@/shared/ui/components'
import type { ColumnDef } from '@/shared/ui/components'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { formatAmount } from '@/shared/utils/formatAmount'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'
import { useOrders, useUpdateOrderStatus } from '@/admin/hooks/orders'
import type { AdminOrderSummary } from '@/admin/hooks/orders'
import { OrderActionsMenu } from './components/OrderActionsMenu'
import { getAvailableTransitions } from './utils/getAvailableTransitions'

const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Paid' },
  { value: 'IN_STORE_PAYMENT', label: 'In-store Payment' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function OrderListPage() {
  const canMutate = useAdminAuthStore((s) => s.role) === 'SUPER_ADMIN'

  const [statusFilter, setStatusFilter] = useState('ALL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: 'cancel' | 'refund'
    orderId: string
  }>({ open: false, type: 'cancel', orderId: '' })

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
    updateOrderStatus({ orderId, payload: { status: OrderStatus.IN_TRANSIT } })
  }, [updateOrderStatus])

  const handleDeliver = useCallback((orderId: string) => {
    updateOrderStatus({ orderId, payload: { status: OrderStatus.DELIVERED } })
  }, [updateOrderStatus])

  const handleCancel = useCallback((orderId: string) => {
    setConfirmDialog({ open: true, type: 'cancel', orderId })
  }, [])

  const handleRefund = useCallback((orderId: string) => {
    setConfirmDialog({ open: true, type: 'refund', orderId })
  }, [])

  const handleConfirmAction = () => {
    const { type, orderId } = confirmDialog
    const status =
      type === 'cancel' ? OrderStatus.CANCELLED : OrderStatus.REFUNDED
    updateOrderStatus(
      { orderId, payload: { status } },
      { onSettled: () => setConfirmDialog((prev) => ({ ...prev, open: false })) },
    )
  }

  const handleCloseDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false }))
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
                    onShip={() => handleShip(order.id)}
                    onDeliver={() => handleDeliver(order.id)}
                    onCancel={() => handleCancel(order.id)}
                    onRefund={() => handleRefund(order.id)}
                  />
                )
              },
            } as ColumnDef<AdminOrderSummary, unknown>,
          ]
        : []),
    ],
    [canMutate, handleCancel, handleDeliver, handleRefund, handleShip],
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
        />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="from-date"
              className="text-sm text-(--c-text-muted)"
            >
              From
            </label>
            <input
              id="from-date"
              type="date"
              value={fromDate}
              onChange={handleFromDateChange}
              className="rounded-md border border-(--c-border) bg-(--c-panel) px-3 py-2 text-sm text-(--c-text)"
            />
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="to-date"
              className="text-sm text-(--c-text-muted)"
            >
              To
            </label>
            <input
              id="to-date"
              type="date"
              value={toDate}
              onChange={handleToDateChange}
              className="rounded-md border border-(--c-border) bg-(--c-panel) px-3 py-2 text-sm text-(--c-text)"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        manualPagination
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAction}
        title={confirmDialog.type === 'cancel' ? 'Cancel Order' : 'Refund Order'}
        description={
          confirmDialog.type === 'cancel'
            ? 'Are you sure you want to cancel this order?'
            : 'Are you sure you want to refund this order?'
        }
        variant="danger"
        confirmLabel={confirmDialog.type === 'cancel' ? 'Cancel Order' : 'Refund Order'}
        isLoading={isUpdatingStatus}
      />
    </div>
  )
}
