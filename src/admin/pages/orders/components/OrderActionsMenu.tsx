import { EllipsisVertical } from 'lucide-react'

import type { AdminOrderSummary } from '@/admin/hooks/orders'
import { DropdownMenu, DropdownItem, RowActionButton } from '@/shared/ui/components'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'
import { getAvailableTransitions } from '@/admin/pages/orders/utils/getAvailableTransitions'

export interface OrderActionsMenuProps {
  order: AdminOrderSummary
  onMarkPaidInStore: () => void
  onShip: () => void
  onDeliver: () => void
  onCancel: () => void
  onRefund: () => void
  canMutate: boolean
}

type OrderActionHandler = keyof Pick<
  OrderActionsMenuProps,
  'onMarkPaidInStore' | 'onShip' | 'onDeliver' | 'onCancel' | 'onRefund'
>

const transitionActions: Record<
  string,
  { label: string; handler: OrderActionHandler; destructive?: boolean }
> = {
  [OrderStatus.IN_STORE_PAYMENT]: { label: 'Mark Paid In Store', handler: 'onMarkPaidInStore' },
  [OrderStatus.IN_TRANSIT]: { label: 'Ship', handler: 'onShip' },
  [OrderStatus.DELIVERED]: { label: 'Deliver', handler: 'onDeliver' },
  [OrderStatus.CANCELLED]: { label: 'Cancel', handler: 'onCancel', destructive: true },
  [OrderStatus.REFUNDED]: { label: 'Refund', handler: 'onRefund', destructive: true },
}

export function OrderActionsMenu({
  order,
  onMarkPaidInStore,
  onShip,
  onDeliver,
  onCancel,
  onRefund,
  canMutate,
}: OrderActionsMenuProps) {
  const availableTransitions = getAvailableTransitions(order.status)

  if (!canMutate || availableTransitions.length === 0) {
    return null
  }

  const handlers: Record<OrderActionHandler, () => void> = {
    onMarkPaidInStore,
    onShip,
    onDeliver,
    onCancel,
    onRefund,
  }

  return (
    <div data-testid="order-actions-menu">
      <DropdownMenu
        trigger={
          <RowActionButton as="span">
            <EllipsisVertical className="h-5 w-5" />
          </RowActionButton>
        }
      >
        {availableTransitions.map((transition) => {
          const action = transitionActions[transition]
          if (!action) return null

          return (
            <div key={transition} data-testid={`action-${action.label.toLowerCase()}`}>
              <DropdownItem
                onClick={handlers[action.handler]}
                destructive={action.destructive}
              >
                {action.label}
              </DropdownItem>
            </div>
          )
        })}
      </DropdownMenu>
    </div>
  )
}
