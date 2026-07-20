import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'

import {
  PageLoadingSpinner,
  OrderStatusDisplay,
  ConfirmationDialog,
} from '@/shared/ui/components'
import { Button } from '@/shared/ui/primitives'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { formatAmount } from '@/shared/utils/formatAmount'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'
import { useOrderDetail, useUpdateOrderStatus } from '@/admin/hooks/orders'
import { OrderLineItemsTable } from './components/OrderLineItemsTable'
import { OrderStatusHistory } from './components/OrderStatusHistory'
import { getAvailableTransitions } from './utils/getAvailableTransitions'

function formatTimestamp(dateString: string): string {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data, isLoading } = useOrderDetail(orderId!)
  const canMutate = useAdminAuthStore((s) => s.role) === 'SUPER_ADMIN'
  const updateStatus = useUpdateOrderStatus()

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: 'cancel' | 'refund'
  }>({ open: false, type: 'cancel' })

  // 404 guard
  if (!isLoading && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div
          className="w-full max-w-md rounded-xl p-8 text-center"
          style={{
            background: 'var(--c-panel, #ffffff)',
            border: '1px solid var(--c-border, #e5e7eb)',
            boxShadow: 'var(--c-shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
          }}
        >
          <h2
            className="mb-2 text-xl font-semibold"
            style={{ color: 'var(--c-text, #111827)' }}
          >
            Not Found
          </h2>
          <p
            className="mb-6 text-sm leading-relaxed"
            style={{ color: 'var(--c-text-muted, #6b7280)' }}
          >
            Order not found
          </p>
          <Link
            to="/admin/orders"
            className="inline-block rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              background: 'var(--c-accent, #2563eb)',
              color: 'var(--c-accent-text, #ffffff)',
            }}
          >
            Back to orders
          </Link>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return <PageLoadingSpinner />
  }

  // At this point data is defined
  const order = data!

  const availableTransitions = getAvailableTransitions(order.status)

  const handleShip = () => {
    updateStatus.mutate({ orderId: order.id, payload: { status: OrderStatus.IN_TRANSIT } })
  }

  const handleDeliver = () => {
    updateStatus.mutate({ orderId: order.id, payload: { status: OrderStatus.DELIVERED } })
  }

  const handleCancel = () => {
    setConfirmDialog({ open: true, type: 'cancel' })
  }

  const handleRefund = () => {
    setConfirmDialog({ open: true, type: 'refund' })
  }

  const handleConfirmAction = () => {
    const status =
      confirmDialog.type === 'cancel' ? OrderStatus.CANCELLED : OrderStatus.REFUNDED
    updateStatus.mutate(
      { orderId: order.id, payload: { status } },
      { onSettled: () => setConfirmDialog((prev) => ({ ...prev, open: false })) },
    )
  }

  const handleCloseDialog = () => {
    setConfirmDialog((prev) => ({ ...prev, open: false }))
  }

  const transitionButtons: {
    target: OrderStatus
    label: string
    handler: () => void
    variant: 'solid' | 'secondary' | 'outline'
  }[] = [
    { target: OrderStatus.IN_TRANSIT, label: 'Ship', handler: handleShip, variant: 'solid' },
    { target: OrderStatus.DELIVERED, label: 'Deliver', handler: handleDeliver, variant: 'solid' },
    { target: OrderStatus.CANCELLED, label: 'Cancel', handler: handleCancel, variant: 'outline' },
    { target: OrderStatus.REFUNDED, label: 'Refund', handler: handleRefund, variant: 'outline' },
  ]

  return (
    <div className="flex flex-col gap-8">
      {/* Top section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-mono text-2xl font-semibold uppercase text-(--c-text)">
            {order.reference}
          </h1>
          <OrderStatusDisplay status={order.status} />
        </div>
        <p className="text-sm text-(--c-text-muted)">
          Placed on {formatTimestamp(order.placedAt)}
        </p>
      </div>

      {/* Action buttons (SUPER_ADMIN only) */}
      {canMutate && availableTransitions.length > 0 && (
        <div className="flex flex-wrap gap-3" data-testid="order-action-buttons">
          {transitionButtons
            .filter((btn) => availableTransitions.includes(btn.target))
            .map((btn) => (
              <Button
                key={btn.target}
                variant={btn.variant}
                size="sm"
                onClick={btn.handler}
              >
                {btn.label}
              </Button>
            ))}
        </div>
      )}

      {/* Customer section */}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-(--c-text)">Customer</h2>
        <div className="rounded-lg border border-(--c-border) bg-(--c-panel) p-4">
          <p className="font-medium text-(--c-text)">{order.customerName}</p>
          <p className="text-sm text-(--c-text-muted)">{order.customerEmail}</p>
          <div className="mt-3 border-t border-(--c-border) pt-3">
            <p className="text-sm font-medium text-(--c-text)">Shipping Address</p>
            <p className="text-sm text-(--c-text-muted)">{order.shippingAddress.street}</p>
            <p className="text-sm text-(--c-text-muted)">
              {order.shippingAddress.city}, {order.shippingAddress.province},{' '}
              {order.shippingAddress.postalCode}
            </p>
            <p className="text-sm text-(--c-text-muted)">{order.shippingAddress.country}</p>
          </div>
        </div>
      </section>

      {/* Line items section */}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-(--c-text)">Line Items</h2>
        <OrderLineItemsTable lineItems={order.lineItems} />
      </section>

      {/* Order summary section */}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-(--c-text)">Order Summary</h2>
        <div className="rounded-lg border border-(--c-border) bg-(--c-panel) p-4">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-(--c-text-muted)">Subtotal</dt>
              <dd className="font-medium text-(--c-text)">{formatAmount(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-(--c-text-muted)">Shipping</dt>
              <dd className="font-medium text-(--c-text)">{formatAmount(order.shippingCost)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-(--c-text-muted)">VAT</dt>
              <dd className="font-medium text-(--c-text)">{formatAmount(order.vatAmount)}</dd>
            </div>
            <div className="flex justify-between border-t border-(--c-border) pt-2">
              <dt className="font-semibold text-(--c-text)">Grand Total</dt>
              <dd className="font-semibold text-(--c-text)">{formatAmount(order.grandTotal)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Status history section */}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-(--c-text)">Status History</h2>
        <OrderStatusHistory history={order.statusHistory} />
      </section>

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
        isLoading={updateStatus.isPending}
      />
    </div>
  )
}
