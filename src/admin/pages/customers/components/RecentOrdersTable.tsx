import type {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import {OrderStatusDisplay} from '@/shared/ui/components'
import {formatAmount} from '@/shared/utils/formatAmount'
import {formatDate} from '@/shared/utils/formatDateTime'
import type {AdminOrderRef} from '@/admin/pages/customers/types'

interface RecentOrdersTableProps {
    orders: AdminOrderRef[]
    /** Heading shown above the table. Omit when an ancestor already renders one. */
    title?: string
    emptyMessage?: string
    /** Replaces the plain-text empty message with richer markup (icon, muted copy) when provided. */
    emptyState?: ReactNode
}

/**
 * Shared read-only order-history table for the customer and wholesale-customer
 * detail pages — one implementation, not two.
 */
export function RecentOrdersTable({
                                      orders,
                                      title,
                                      emptyMessage = 'No orders yet.',
                                      emptyState,
                                  }: RecentOrdersTableProps) {
    return (
        <section className="flex flex-col gap-2">
            {title &&
                <h2 className="text-lg font-semibold text-(--c-text)">
                    {title}
                </h2>
            }
            {orders.length === 0 ? (
                emptyState ??
                <p className="text-sm text-(--c-text-muted)">
                    {emptyMessage}
                </p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-(--c-border) bg-(--c-panel)">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-(--c-border)">
                            <th className="px-4 py-3 text-left font-medium text-(--c-text-muted)">
                                Reference
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-(--c-text-muted)">
                                Date
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-(--c-text-muted)">
                                Total
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-(--c-text-muted)">
                                Status
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="border-b border-(--c-border) last:border-b-0">
                                <td className="px-4 py-3">
                                    <Link
                                        to={`/admin/orders/${order.id}`}
                                        className="font-medium text-(--c-accent) hover:underline"
                                    >
                                        {order.reference}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-(--c-text-muted)">
                                    {formatDate(order.placedAt)}
                                </td>
                                <td className="px-4 py-3 text-(--c-text)">
                                    {formatAmount(order.total)
                                    }</td>
                                <td className="px-4 py-3">
                                    <OrderStatusDisplay status={order.status}/>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}
