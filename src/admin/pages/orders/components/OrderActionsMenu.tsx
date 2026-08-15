import { EllipsisVertical } from 'lucide-react'

import type { AdminOrderSummary } from '@/admin/pages/orders/types'
import { DropdownMenu, DropdownItem, RowActionButton } from '@/shared/ui/components'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'
import { getAvailableTransitions } from '@/admin/pages/orders/utils/getAvailableTransitions'

export interface OrderActionsMenuProps {
  order: AdminOrderSummary
  /**
   * Invoked with the status the staff member picked. One callback rather than one
   * prop per action: the workflow has fourteen transitions, and a named handler for
   * each made adding a step a change in four files.
   */
  onSelect: (target: OrderStatus) => void
  canMutate: boolean
}

/**
 * How each target status reads as an action. Keyed by target so it stays aligned
 * with `getAvailableTransitions`, which decides what is offered at all — this map
 * only names the offer. `destructive` marks the ones that end an order.
 */
const ACTION_LABELS: Partial<Record<OrderStatus, { label: string; destructive?: boolean }>> = {
  [OrderStatus.IN_STORE_PAYMENT]: { label: 'Await In-Store Payment' },
  [OrderStatus.PAID]: { label: 'Mark Paid' },
  [OrderStatus.PROCESSING]: { label: 'Start Processing' },
  [OrderStatus.READY_TO_SHIP]: { label: 'Ready to Ship' },
  [OrderStatus.READY_FOR_COLLECTION]: { label: 'Ready for Collection' },
  [OrderStatus.IN_TRANSIT]: { label: 'Ship' },
  [OrderStatus.DELIVERED]: { label: 'Deliver' },
  [OrderStatus.COLLECTED]: { label: 'Mark Collected' },
  [OrderStatus.DELIVERY_FAILED]: { label: 'Delivery Failed' },
  [OrderStatus.RETURNED_TO_ORIGIN]: { label: 'Returned to Store' },
  [OrderStatus.USER_CANCELED]: { label: 'Cancel — Customer', destructive: true },
  [OrderStatus.ADMIN_CANCELED]: { label: 'Cancel — Store', destructive: true },
  [OrderStatus.PARTIALLY_REFUNDED]: { label: 'Partial Refund', destructive: true },
  [OrderStatus.REFUNDED]: { label: 'Refund', destructive: true },
}

export function OrderActionsMenu({ order, onSelect, canMutate }: OrderActionsMenuProps) {
  const availableTransitions = getAvailableTransitions(order.status)

  if (!canMutate || availableTransitions.length === 0) {
    return null
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
          const action = ACTION_LABELS[transition]
          if (!action) return null

          return (
            <div key={transition} data-testid={`action-${action.label.toLowerCase()}`}>
              <DropdownItem onClick={() => onSelect(transition)} destructive={action.destructive}>
                {action.label}
              </DropdownItem>
            </div>
          )
        })}
      </DropdownMenu>
    </div>
  )
}
