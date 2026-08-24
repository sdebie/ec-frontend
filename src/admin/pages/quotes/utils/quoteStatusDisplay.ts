import type {QuoteRequestStatus} from '@/shared/types/enums'
import {QuoteRequestStatusOptions} from '@/shared/types/enums'

export function getQuoteStatusColor(status: QuoteRequestStatus): string {
    return QuoteRequestStatusOptions[status]?.color ?? 'blue'
}

export function getQuoteStatusLabel(status: QuoteRequestStatus): string {
    return QuoteRequestStatusOptions[status]?.label ?? status
}
