import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'

import {
  PageBackButton,
  PageLoadingSpinner,
  OrderStatusDisplay,
} from '@/shared/ui/components'
import { Button, Card } from '@/shared/ui/primitives'
import { useCan } from '@/shared/auth/adminPermissions'
import { formatAmount } from '@/shared/utils/formatAmount'
import { formatDate, formatTime } from '@/shared/utils/formatDateTime'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'
import { useOrderDetail } from './hooks/useOrderDetail'
import { useUpdateOrderStatus } from './hooks/useUpdateOrderStatus'
import { OrderLineItemsTable } from './components/OrderLineItemsTable'
import { OrderStatusHistory } from './components/OrderStatusHistory'
import { getAvailableTransitions } from './utils/getAvailableTransitions'
import type { ConfirmedAction } from './utils/confirmedActions'
import { useOrderStatusConfirmation } from './hooks/useOrderStatusConfirmation'
import { OrderStatusConfirmationDialog } from './components/OrderStatusConfirmationDialog'
import { ShipOrderDialog } from './components/ShipOrderDialog'

/**
 * One headline figure. Neutral surface rather than the design's pastel blocks: those
 * colours carry no meaning here, and on the admin surface a colour that means nothing
 * competes with the status badges, which mean a great deal.
 */
function OrderStatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-(--c-border) bg-(--c-panel-secondary) p-4">
      <p className="text-xs font-medium text-(--c-text-muted)">{label}</p>
      <p className="mt-1 text-lg font-semibold text-(--c-text)">{value}</p>
      {sub && <p className="text-xs text-(--c-text-muted)">{sub}</p>}
    </div>
  )
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data, isLoading } = useOrderDetail(orderId!)
  const canMutate = useCan('order:write')
  const updateStatus = useUpdateOrderStatus()

  const confirmation = useOrderStatusConfirmation()
  const [shipOpen, setShipOpen] = useState(false)

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

  const handleShip = (tracking: { trackingNumber?: string; trackingCarrier?: string }) => {
    updateStatus.mutate(
      { orderId: order.id, status: OrderStatus.IN_TRANSIT, ...tracking },
      { onSettled: () => setShipOpen(false) },
    )
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
    { target: OrderStatus.IN_TRANSIT, label: 'Ship', handler: () => setShipOpen(true), variant: 'solid' },
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
    <div className="flex flex-col gap-6">
      {/*
        One card owns the page. Order Information, Customer Information and Order Tracking
        are panels inside it rather than three floating siblings, so the whole order reads
        as one document — which is what a staff member is actually looking at.
      */}
      <Card as="article" elevation="sm" className="p-5">
        <Card.Header className="flex flex-wrap items-center gap-3">
          <PageBackButton />
          <span className="text-xl font-semibold text-(--c-text)">Details</span>
        </Card.Header>

        <Card.Body className="flex flex-col gap-6">
          <Card as="section" elevation="none" className="p-5">
            <Card.Header>Order Information</Card.Header>
            <Card.Body className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="font-mono text-xl font-semibold uppercase text-(--c-text)">
                  {order.reference}
                </h1>
                <OrderStatusDisplay status={order.status} />
              </div>

              {/*
                Three figures a staff member wants before reading anything else.
                Deliberately not "Delivery Date" as in the design: an order carries no
                promised or actual delivery date, and a tile that is always empty is
                worse than one fewer tile.
              */}
              <div className="grid gap-4 sm:grid-cols-3">
                <OrderStatTile label="Order Date" value={formatDate(order.placedAt)} sub={formatTime(order.placedAt)} />
                <OrderStatTile label="Total Items" value={`${order.itemCount} pcs`} />
                <OrderStatTile label="Order Total" value={formatAmount(order.grandTotal)} />
              </div>

              {canMutate && availableTransitions.length > 0 && (
                <div className="flex flex-wrap gap-3" data-testid="order-action-buttons">
                  {transitionButtons
                    .filter((btn) => availableTransitions.includes(btn.target))
                    .map((btn) => (
                      <Button key={btn.target} variant={btn.variant} size="sm" onClick={btn.handler}>
                        {btn.label}
                      </Button>
                    ))}
                </div>
              )}

              {/* Lines and money side by side on a wide screen, stacked on a narrow one. */}
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="min-w-0">
                  <OrderLineItemsTable lineItems={order.lineItems} />
                </div>

                <div className="rounded-(--c-radius) border border-(--c-border) bg-(--c-panel-secondary) p-4">
                  <h2 className="mb-3 text-sm font-semibold text-(--c-text)">Order Summary</h2>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-(--c-text-muted)">Sub-Total</dt>
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
                      <dt className="font-semibold text-(--c-text)">Total</dt>
                      <dd className="font-semibold text-(--c-text)">{formatAmount(order.grandTotal)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card as="section" elevation="none" className="p-5">
            <Card.Header>Customer Information</Card.Header>
            <Card.Body className="flex flex-col gap-1">
              {/* Guest checkout is ordinary here, so an unnamed customer reads as Guest. */}
              <p className="font-medium text-(--c-text)">{order.customerName?.trim() || 'Guest'}</p>
              {order.customerEmail && (
                <p className="text-sm text-(--c-text-muted)">{order.customerEmail}</p>
              )}
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
              {(order.trackingNumber || order.trackingCarrier) && (
                <div className="mt-3 border-t border-(--c-border) pt-3">
                  <p className="text-sm font-medium text-(--c-text)">Tracking</p>
                  {order.trackingNumber && (
                    <p className="text-sm text-(--c-text-muted)">{order.trackingNumber}</p>
                  )}
                  {order.trackingCarrier && (
                    <p className="text-sm text-(--c-text-muted)">{order.trackingCarrier}</p>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>

          <Card as="section" elevation="none" className="p-5">
            <Card.Header>Order Tracking</Card.Header>
            <Card.Body>
              <OrderStatusHistory history={order.statusHistory} />
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      <OrderStatusConfirmationDialog
        state={confirmation.state}
        onConfirm={handleConfirmAction}
        onClose={confirmation.close}
        isLoading={updateStatus.isPending}
      />

      <ShipOrderDialog
        open={shipOpen}
        onClose={() => setShipOpen(false)}
        onConfirm={handleShip}
        isLoading={updateStatus.isPending}
      />
    </div>
  )
}
