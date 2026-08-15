import type { OrderStatusHistoryEntry } from '@/admin/pages/orders/types'
import { OrderStatusDisplay } from '@/shared/ui/components'

export interface OrderStatusHistoryProps {
  history: OrderStatusHistoryEntry[]
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function OrderStatusHistory({ history }: OrderStatusHistoryProps) {
  if (history.length === 0) {
    return null
  }

  return (
    <div className="relative" data-testid="order-status-history">
      <ul className="space-y-0">
        {history.map((entry, index) => {
          const isLast = index === history.length - 1

          return (
            <li key={index} className="relative flex gap-4">
              {/* Vertical connecting line */}
              {!isLast && (
                <div
                  className="absolute left-3 top-6 bottom-0 w-px bg-(--c-border)"
                  aria-hidden="true"
                />
              )}

              {/* Timeline dot */}
              <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-(--c-border)" />
              </div>

              {/* Entry content */}
              <div className="flex flex-col gap-1 pb-6">
                <OrderStatusDisplay status={entry.status} />
                <span className="text-xs text-(--c-text-muted)">
                  {formatTimestamp(entry.timestamp)}
                </span>
                {entry.staffName && (
                  <span className="text-xs text-(--c-text-muted)">
                    by {entry.staffName}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
