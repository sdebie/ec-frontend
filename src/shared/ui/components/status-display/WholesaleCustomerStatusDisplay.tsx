import * as React from 'react'
import {WholesaleCustomerStatus, WholesaleCustomerStatusOptions} from '@/shared/types/enums'
import {StatusBadge} from '@/shared/ui/components/status-badge/StatusBadge'

export interface WholesaleCustomerStatusDisplayProps {
    status: WholesaleCustomerStatus | string
}

export const WholesaleCustomerStatusDisplay: React.FC<WholesaleCustomerStatusDisplayProps> = ({status}) => {
    const option = WholesaleCustomerStatusOptions[status as WholesaleCustomerStatus]
    return <StatusBadge label={option?.label ?? status} color={option?.color ?? 'gray'}/>
}
