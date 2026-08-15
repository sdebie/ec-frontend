import { useParams, Link } from 'react-router-dom'

import {
  PageLoadingSpinner,
  OrderStatusDisplay,
} from '@/shared/ui/components'
import { Button } from '@/shared/ui/primitives'
import { useCan } from '@/shared/auth/adminPermissions'
import { formatAmount } from '@/shared/utils/formatAmount'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'
import { useOrderDetail, useUpdateOrderStatus } from '@/admin/hooks/orders'
import { OrderLineItemsTable } from './components/OrderLineItemsTable'
import { OrderStatusHistory } from './components/OrderStatusHistory'
import { getAvailableTransitions } from './utils/getAvailableTransitions'
import type { ConfirmedAction } from './utils/confirmedActions'
import { useOrderStatusConfirmation } from './hooks/useOrderStatusConfirmation'
import { OrderStatusConfirmationDialog } from './components/OrderStatusConfirmationDialog'

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
  const canMutate = useCan('order:write')
  const updateStatus = useUpdateOrderStatus()

  const confirmation = useOrderStatusConfirmation()

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

  // Guest checkout can reach payment without an address, and any single part of
  // one may be missing, so build the block from whatever is actually there
  // rather than rendering stray commas around blanks. The whole object is
  // nullable in the schema, not just its parts — an empty list renders the same
  // "no address" state either way.
  const { street, city, province, postalCode } = order.shippingAddress ?? {}
  const addressLines = [street, [city, province, postalCode].filter(Boolean).join(', ')].filter(
    (line): line is string => !!line,
  )

  const askToConfirm = (type: ConfirmedAction) => () => {
    confirmation.ask(type, order.id, order.status)
  }

  const moveTo = (status: OrderStatus) => () => {
    updateStatus.mutate({ orderId: order.id, status })
  }

  const handleConfirmAction = () => {
    updateStatus.mutate(confirmation.buildPayload(), { onSettled: confirmation.close })
  }

  /**
   * One entry per status a staff member can move an order to, filtered below against
   * the transitions the order's current status actually allows. A forward fulfilment
   * step goes straight through; anything that ends an order, or emails the customer,
   * asks first.
   */
  const transitionButtons: {
    target: OrderStatus
    label: string
    handler: () => void
    variant: 'solid' | 'secondary' | 'outline'
  }[] = [
    {
      target: OrderStatus.IN_STORE_PAYMENT,
      label: 'Await In-Store Payment',
      handler: askToConfirm('await-in-store-payment'),
      variant: 'solid',
    },
    { target: OrderStatus.PAID, label: 'Mark Paid', handler: moveTo(OrderStatus.PAID), variant: 'solid' },
    {
      target: OrderStatus.PROCESSING,
      label: 'Start Processing',
      handler: moveTo(OrderStatus.PROCESSING),
      variant: 'solid',
    },
    {
      target: OrderStatus.READY_TO_SHIP,
      label: 'Ready to Ship',
      handler: moveTo(OrderStatus.READY_TO_SHIP),
      variant: 'solid',
    },
    {
      target: OrderStatus.READY_FOR_COLLECTION,
      label: 'Ready for Collection',
      handler: moveTo(OrderStatus.READY_FOR_COLLECTION),
      variant: 'solid',
    },
    { target: OrderStatus.IN_TRANSIT, label: 'Ship', handler: moveTo(OrderStatus.IN_TRANSIT), variant: 'solid' },
    { target: OrderStatus.DELIVERED, label: 'Deliver', handler: moveTo(OrderStatus.DELIVERED), variant: 'solid' },
    {
      target: OrderStatus.COLLECTED,
      label: 'Mark Collected',
      handler: moveTo(OrderStatus.COLLECTED),
      variant: 'solid',
    },
    {
      target: OrderStatus.DELIVERY_FAILED,
      label: 'Delivery Failed',
      handler: moveTo(OrderStatus.DELIVERY_FAILED),
      variant: 'outline',
    },
    {
      target: OrderStatus.RETURNED_TO_ORIGIN,
      label: 'Returned to Store',
      handler: askToConfirm('return-to-origin'),
      variant: 'outline',
    },
    {
      target: OrderStatus.USER_CANCELED,
      label: 'Cancel — Customer',
      handler: askToConfirm('cancel-customer'),
      variant: 'outline',
    },
    {
      target: OrderStatus.ADMIN_CANCELED,
      label: 'Cancel — Store',
      handler: askToConfirm('cancel-staff'),
      variant: 'outline',
    },
    {
      target: OrderStatus.PARTIALLY_REFUNDED,
      label: 'Partial Refund',
      handler: askToConfirm('refund-partial'),
      variant: 'outline',
    },
    { target: OrderStatus.REFUNDED, label: 'Refund', handler: askToConfirm('refund'), variant: 'outline' },
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
            {addressLines.length === 0 ? (
              <p className="text-sm text-(--c-text-muted)">No address captured</p>
            ) : (
              addressLines.map((line) => (
                <p key={line} className="text-sm text-(--c-text-muted)">
                  {line}
                </p>
              ))
            )}
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

      <OrderStatusConfirmationDialog
        state={confirmation.state}
        onConfirm={handleConfirmAction}
        onClose={confirmation.close}
        isLoading={updateStatus.isPending}
      />
    </div>
  )
}
