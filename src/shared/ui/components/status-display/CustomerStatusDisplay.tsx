import * as React from 'react'
import {CustomerStatus, CustomerStatusOptions} from '@/shared/types/enums'
import {StatusBadge} from '@/shared/ui/components/status-badge/StatusBadge'

export interface CustomerStatusDisplayProps {
    status: CustomerStatus | string
}

export const CustomerStatusDisplay: React.FC<CustomerStatusDisplayProps> = ({status}) => {
    const option = CustomerStatusOptions[status as CustomerStatus]
    return <StatusBadge label={option?.label ?? status} color={option?.color ?? 'gray'}/>
}
