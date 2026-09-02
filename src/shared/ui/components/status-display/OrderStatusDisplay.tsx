import * as React from 'react'
import {OrderStatus, OrderStatusOptions} from '@/shared/types/enums'
import {StatusBadge} from '@/shared/ui/components/status-badge/StatusBadge'

export interface OrderStatusDisplayProps {
    status: OrderStatus | string
}

export const OrderStatusDisplay: React.FC<OrderStatusDisplayProps> = ({status}) => {
    const option = OrderStatusOptions[status as OrderStatus]
    if (!option?.note) {
        return <StatusBadge label={option?.label ?? status} color={option?.color ?? 'gray'}/>
    }
    return (
        <span className="inline-flex items-center gap-2">
            <StatusBadge label={option.label} color={option.color}/>
            {/* Muted and unbadged: a qualifier is context for the status, not a second one. */}
            <span className="text-xs text-(--c-text-muted)">
                {option.note}
            </span>
        </span>
    )
}
