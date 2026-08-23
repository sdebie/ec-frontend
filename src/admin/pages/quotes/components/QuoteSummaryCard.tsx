import {Card} from '@/shared/ui/primitives'
import {StatusBadge} from '@/shared/ui/components'
import type {QuoteRequestStatus} from '@/shared/types/enums'
import {formatDisplayDateTime} from '@/shared/utils/formatDateTime'
import {InfoRow} from '@/admin/pages/customers/components/InfoRow'
import {getQuoteStatusColor, getQuoteStatusLabel} from '../utils/quoteStatusDisplay'

interface QuoteSummaryCardProps {
    id: string
    createdAt: string
    statusChangedAt: string | null
    itemCount: number
    totalQuantity: number
    status: QuoteRequestStatus
}

/** The metadata a staff member needs to triage a request at a glance — dates, size, and state. */
export function QuoteSummaryCard({
                                      id,
                                      createdAt,
                                      statusChangedAt,
                                      itemCount,
                                      totalQuantity,
                                      status,
                                  }: QuoteSummaryCardProps) {
    return (
        <Card as="section" variant="bordered" className="flex h-full flex-col">
            <Card.Header className="m-0 px-5 py-4">Quote Summary</Card.Header>
            <Card.Body className="divide-y divide-(--c-border) px-5 py-1">
                <InfoRow label="Submitted" value={formatDisplayDateTime(createdAt)}/>
                <InfoRow
                    label="Last Updated"
                    value={statusChangedAt ? formatDisplayDateTime(statusChangedAt) : '—'}
                />
                <InfoRow label="Total Items" value={itemCount}/>
                <InfoRow label="Total Quantity" value={totalQuantity}/>
                <InfoRow
                    label="Status"
                    value={<StatusBadge label={getQuoteStatusLabel(status)} color={getQuoteStatusColor(status)}/>}
                />
                <InfoRow
                    label="Quote ID"
                    value={<span className="break-all font-mono text-xs">{id}</span>}
                />
            </Card.Body>
        </Card>
    )
}
