import * as React from 'react'
import {WholesaleApplicationStatus, WholesaleApplicationStatusOptions} from '@/shared/types/enums'
import {StatusBadge} from './StatusBadge'

export interface WholesaleApplicationStatusDisplayProps {
    status: WholesaleApplicationStatus | string
}

export const WholesaleApplicationStatusDisplay: React.FC<WholesaleApplicationStatusDisplayProps> = ({status}) => {
    const option = WholesaleApplicationStatusOptions[status as WholesaleApplicationStatus]
    return <StatusBadge label={option?.label ?? status} color={option?.color ?? 'gray'}/>
}
