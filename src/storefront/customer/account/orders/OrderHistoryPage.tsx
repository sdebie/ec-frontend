import { Link, useNavigate } from 'react-router-dom'
import { useMyOrders } from '../hooks/useMyOrders'
import { formatAmount } from '@/shared/utils/formatAmount'
import { orderStatusBadgeClasses } from '../orderStatusBadge'

export function OrderHistoryPage() {
  const { data, isLoading, isError, refetch } = useMyOrders()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-(--sf-surface-muted)" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-(--sf-surface-muted)" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-(--sf-text)">Order History</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">
            Something went wrong while loading your orders.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const orders = data?.myOrders ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-(--sf-text)">Order History</h1>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-(--sf-border) p-6 text-center">
          <p className="text-(--sf-muted-text)">No orders yet</p>
          <Link
            to="/products"
            className="mt-2 inline-block text-sm font-medium text-(--sf-accent) hover:opacity-80"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => navigate(`/account/orders/${order.id}`)}
              className="flex w-full items-center justify-between rounded-lg border border-(--sf-border) p-4 text-left transition-colors hover:bg-(--sf-surface-muted)"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm text-(--sf-muted-text)">
                  {new Date(order.orderDate).toLocaleDateString('en-ZA', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${orderStatusBadgeClasses(order.status)}`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-(--sf-muted-text)">
                  {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="text-sm font-medium text-(--sf-text)">
                  {formatAmount(order.totalAmount)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
