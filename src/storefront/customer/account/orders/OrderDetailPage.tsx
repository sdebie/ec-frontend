import { Link, useParams } from 'react-router-dom'
import { useOrderDetail } from '../hooks/useOrderDetail'
import { formatAmount } from '@/shared/utils/formatAmount'
import type { OrderStatusEvent } from '../hooks/useOrderDetail'

const STATUS_BADGE_CLASSES: Record<string, string> = {
  CREATED: 'bg-gray-100 text-gray-700',
  PAID: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-amber-100 text-amber-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function sortTimelineAscending(events: OrderStatusEvent[]): OrderStatusEvent[] {
  return [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const { data, isLoading, isError } = useOrderDetail(orderId ?? '')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 animate-pulse rounded bg-(--sf-surface-muted)" />
        <div className="h-8 w-64 animate-pulse rounded bg-(--sf-surface-muted)" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-(--sf-surface-muted)" />
          ))}
        </div>
      </div>
    )
  }

  const order = data?.getOrderDetail ?? null

  if (isError || !order) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-(--sf-text)">Order not found</h1>
        <p className="text-sm text-(--sf-muted-text)">
          We couldn't find this order. It may have been removed or you may not have access.
        </p>
        <Link
          to="/account/orders"
          className="inline-block text-sm font-medium text-(--sf-accent) hover:opacity-80"
        >
          Back to orders
        </Link>
      </div>
    )
  }

  const { orderDate, status, shippingAddress, lineItems, totalAmount, statusHistory } = order
  const sortedHistory = sortTimelineAscending(statusHistory ?? [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/account/orders"
            className="text-sm text-(--sf-accent) hover:opacity-80"
          >
            ← Back to orders
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-(--sf-text)">
            Order Details
          </h1>
        </div>
        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_BADGE_CLASSES[status] ?? 'bg-gray-100 text-gray-700'}`}
        >
          {status}
        </span>
      </div>

      {/* Order info */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-medium text-(--sf-muted-text)">Order Date</h2>
          <p className="mt-1 text-sm text-(--sf-text)">{formatDate(orderDate)}</p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-(--sf-muted-text)">Shipping Address</h2>
          <address className="mt-1 text-sm not-italic text-(--sf-text)">
            <p>{shippingAddress.line1}</p>
            {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
            {shippingAddress.suburb && <p>{shippingAddress.suburb}</p>}
            <p>
              {shippingAddress.city}, {shippingAddress.province}
            </p>
            <p>{shippingAddress.postalCode}</p>
          </address>
        </div>
      </div>

      {/* Line items */}
      <div>
        <h2 className="text-lg font-semibold text-(--sf-text)">Items</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-(--sf-border) text-(--sf-muted-text)">
              <tr>
                <th className="pb-2 pr-4 font-medium">Product</th>
                <th className="pb-2 pr-4 font-medium">Variant</th>
                <th className="pb-2 pr-4 text-right font-medium">Qty</th>
                <th className="pb-2 text-right font-medium">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--sf-border)">
              {lineItems.map((item, index) => (
                <tr key={index}>
                  <td className="py-3 pr-4 text-(--sf-text)">{item.productName}</td>
                  <td className="py-3 pr-4 text-(--sf-muted-text)">{item.variantName}</td>
                  <td className="py-3 pr-4 text-right text-(--sf-text)">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-(--sf-text)">
                    {formatAmount(item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="mt-4 flex justify-end border-t border-(--sf-border) pt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-(--sf-muted-text)">Total</span>
            <span className="text-lg font-semibold text-(--sf-text)">
              {formatAmount(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Status timeline */}
      {sortedHistory.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-(--sf-text)">Status Timeline</h2>
          <ol className="mt-4 space-y-4">
            {sortedHistory.map((event, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full ${STATUS_BADGE_CLASSES[event.status]?.split(' ')[0] ?? 'bg-(--sf-surface-muted)'}`}
                  />
                  {index < sortedHistory.length - 1 && (
                    <div className="mt-1 h-6 w-px bg-(--sf-border)" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-(--sf-text)">
                    {event.status}
                  </p>
                  <p className="text-xs text-(--sf-muted-text)">
                    {formatTimestamp(event.timestamp)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
