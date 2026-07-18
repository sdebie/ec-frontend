import { Link } from 'react-router-dom'
import { useCustomerProfile } from './hooks/useCustomerProfile'
import { useMyOrders } from './hooks/useMyOrders'
import { useWishlist } from './hooks/useWishlist'
import { formatAmount } from '@/shared/utils/formatAmount'
import { orderStatusBadgeClasses } from './orderStatusBadge'

export function AccountDashboardPage() {
  const { data: profile, isLoading: profileLoading } = useCustomerProfile()
  const { data: ordersData, isLoading: ordersLoading } = useMyOrders()
  const { data: wishlist, isLoading: wishlistLoading } = useWishlist()

  const isLoading = profileLoading || ordersLoading || wishlistLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-(--sf-surface-muted)" />
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded bg-(--sf-surface-muted)" />
          <div className="h-16 animate-pulse rounded bg-(--sf-surface-muted)" />
          <div className="h-16 animate-pulse rounded bg-(--sf-surface-muted)" />
        </div>
        <div className="h-12 w-40 animate-pulse rounded bg-(--sf-surface-muted)" />
      </div>
    )
  }

  const orders = ordersData?.myOrders ?? []
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 3)

  const wishlistCount = wishlist?.size ?? 0

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-(--sf-text)">
        Welcome back{profile?.firstName ? `, ${profile.firstName}` : ''}
      </h1>

      {/* Recent Orders Section */}
      <section>
        <h2 className="mb-4 text-lg font-medium text-(--sf-text)">Recent Orders</h2>
        {recentOrders.length === 0 ? (
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
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="flex items-center justify-between rounded-lg border border-(--sf-border) p-4 transition-colors hover:bg-(--sf-surface-muted)"
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
                <span className="text-sm font-medium text-(--sf-text)">
                  {formatAmount(order.totalAmount)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Wishlist Summary */}
      <section>
        <div className="rounded-lg border border-(--sf-border) p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-(--sf-text)">Wishlist</h2>
              <p className="text-sm text-(--sf-muted-text)">
                {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            <Link
              to="/account/wishlist"
              className="text-sm font-medium text-(--sf-accent) hover:opacity-80"
            >
              View wishlist
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
