import { Link, useNavigate } from 'react-router-dom'
import { useMyOrders } from '../hooks/useMyOrders'
import { formatAmount } from '@/shared/utils/formatAmount'

const STATUS_BADGE_CLASSES: Record<string, string> = {
  CREATED: 'bg-gray-100 text-gray-700',
  PAID: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-amber-100 text-amber-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export function OrderHistoryPage() {
  const { data, isLoading, isError, refetch } = useMyOrders()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Order History</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">
            Something went wrong while loading your orders.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
      <h1 className="text-2xl font-semibold text-gray-900">Order History</h1>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">No orders yet</p>
          <Link
            to="/products"
            className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
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
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {new Date(order.orderDate).toLocaleDateString('en-ZA', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[order.status] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                </span>
                <span className="text-sm font-medium text-gray-900">
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
