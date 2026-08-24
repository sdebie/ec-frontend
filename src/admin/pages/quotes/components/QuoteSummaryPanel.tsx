import type {ComponentType} from 'react'
import {
    CalendarClock,
    CalendarDays,
    CircleDollarSign,
    FileText,
    Hash,
    MessageSquareText,
    Package,
    ShoppingBag,
    UserRound,
} from 'lucide-react'
import {Card} from '@/shared/ui/primitives'
import {StatusBadge} from '@/shared/ui/components'
import type {QuoteRequestStatus} from '@/shared/types/enums'
import {formatDateTime} from '@/shared/utils/formatDateTime'
import {formatAmount} from '@/shared/utils/formatAmount'
import {getQuoteStatusColor, getQuoteStatusLabel} from '../utils/quoteStatusDisplay'

interface QuoteSummaryPanelProps {
    id: string
    createdAt: string
    statusChangedAt: string | null
    itemCount: number
    totalQuantity: number
    status: QuoteRequestStatus
    quotedAmount: number | null
    quotedNotes: string | null
    quotedByName: string | null
}

interface SummaryFieldProps {
    icon?: ComponentType<{ className?: string }>
    label: string
    value: React.ReactNode
}

/** Muted label above, prominent value below — one entry in a divided field group. */
function SummaryField({icon: Icon, label, value}: SummaryFieldProps) {
    return (
        <div className="flex items-center gap-3 py-2 first:pt-0 last:pb-0 sm:px-4 sm:py-0 sm:first:pl-0">
            {Icon && (
                <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--c-accent-subtle) text-(--c-accent)">
                    <Icon className="h-4 w-4" aria-hidden="true"/>
                </span>
            )}
            <div className="min-w-0">
                <p className="text-xs text-(--c-text-muted)">{label}</p>
                <div className="mt-0.5 text-sm font-medium text-(--c-text)">{value}</div>
            </div>
        </div>
    )
}

/** Compact logical groups replace a long vertical key/value list: identity, then activity,
 * then (once a quote exists) the priced-reply facts, then the free-text notes. */
export function QuoteSummaryPanel({
                                      id,
                                      createdAt,
                                      statusChangedAt,
                                      itemCount,
                                      totalQuantity,
                                      status,
                                      quotedAmount,
                                      quotedNotes,
                                      quotedByName,
                                  }: QuoteSummaryPanelProps) {
    return (
        <Card as="section" variant="bordered">
            <Card.Header className="m-0 flex items-center gap-3 px-5 py-4">
                <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--c-accent-subtle) text-(--c-accent)">
                    <FileText className="h-4 w-4" aria-hidden="true"/>
                </span>
                <span>Quote Summary</span>
            </Card.Header>
            <Card.Body className="px-5 py-4">
                <div
                    className="grid divide-y divide-(--c-border) sm:grid-flow-col sm:auto-cols-fr sm:divide-y-0 sm:divide-x">
                    <SummaryField
                        icon={Hash}
                        label="Quote ID"
                        value={<span className="break-all font-mono text-xs">{id}</span>}
                    />
                    <SummaryField
                        label="Status"
                        value={<StatusBadge label={getQuoteStatusLabel(status)} color={getQuoteStatusColor(status)}/>}
                    />
                    {quotedByName && (
                        <SummaryField icon={UserRound} label="Quoted By" value={quotedByName}/>
                    )}
                </div>

                <div
                    className="mt-4 grid divide-y divide-(--c-border) border-t border-(--c-border) pt-4 sm:grid-flow-col sm:auto-cols-fr sm:divide-y-0 sm:divide-x">
                    <SummaryField icon={CalendarDays} label="Submitted" value={formatDateTime(createdAt)}/>
                    <SummaryField
                        icon={CalendarClock}
                        label="Last Updated"
                        value={statusChangedAt ? formatDateTime(statusChangedAt) : '—'}
                    />
                    <SummaryField icon={Package} label="Total Items" value={itemCount}/>
                    <SummaryField icon={ShoppingBag} label="Total Quantity" value={totalQuantity}/>
                    {quotedAmount !== null && (
                        <SummaryField icon={CircleDollarSign} label="Quoted Amount" value={formatAmount(quotedAmount)}/>
                    )}
                </div>

                {quotedNotes && (
                    <div className="mt-4 border-t border-(--c-border) pt-4">
                        <div className="flex items-center gap-2 text-xs text-(--c-text-muted)">
                            <MessageSquareText className="h-4 w-4"/>
                            <span>Quote Notes</span>
                        </div>
                        <p className="mt-1.5 whitespace-pre-wrap text-sm text-(--c-text)">{quotedNotes}</p>
                    </div>
                )}
            </Card.Body>
        </Card>
    )
}
