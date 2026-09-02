import * as React from 'react'
import {QuoteRequestStatus, QuoteRequestStatusOptions} from '@/shared/types/enums'
import {StatusBadge} from '@/shared/ui/components/status-badge/StatusBadge'

export interface QuoteRequestStatusDisplayProps {
    status: QuoteRequestStatus | string
    /** Page-header usages render a larger badge than the table/summary default. */
    className?: string
}

export const QuoteRequestStatusDisplay: React.FC<QuoteRequestStatusDisplayProps> = ({status, className}) => {
    const option = QuoteRequestStatusOptions[status as QuoteRequestStatus]
    return <StatusBadge label={option?.label ?? status} color={option?.color ?? 'gray'} className={className}/>
}
