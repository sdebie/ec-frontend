import {EllipsisVertical} from 'lucide-react'

import type {AdminOrderSummary} from '@/admin/pages/orders/types'
import {DropdownItem, DropdownMenu, RowActionButton} from '@/shared/ui/components'
import {OrderStatus} from '@/shared/types/enums/OrderStatus'
import {getAvailableTransitions} from '@/admin/pages/orders/utils/getAvailableTransitions'
import {TRANSITION_META} from '@/admin/pages/orders/utils/transitionMetadata'

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

export function OrderActionsMenu({order, onSelect, canMutate}: OrderActionsMenuProps) {
    const availableTransitions = getAvailableTransitions(order.status)

    if (!canMutate || availableTransitions.length === 0) {
        return null
    }

    return (
        <div data-testid="order-actions-menu">
            <DropdownMenu
                trigger={
                    <RowActionButton as="span">
                        <EllipsisVertical className="h-5 w-5"/>
                    </RowActionButton>
                }
            >
                {availableTransitions.map((transition) => {
                    const meta = TRANSITION_META.find(m => m.target === transition)

                    if (!meta) {
                        return null
                    }

                    return (
                        <div key={transition} data-testid={`action-${meta.label.toLowerCase()}`}>
                            <DropdownItem onClick={() => onSelect(transition)} destructive={meta.destructive}>
                                {meta.label}
                            </DropdownItem>
                        </div>
                    )
                })}
            </DropdownMenu>
        </div>
    )
}
