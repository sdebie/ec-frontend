import {useState} from 'react'
import {CheckCircle2, Eye, Play, Receipt, XCircle, Zap} from 'lucide-react'
import {Button, Card} from '@/shared/ui/primitives'
import {ConfirmationDialog} from '@/shared/ui/components'
import type {QuoteRequestStatus} from '@/shared/types/enums'
import type {QuoteRequestItem} from '../hooks/useQuoteRequestDetail'
import {GenerateQuoteDialog} from './GenerateQuoteDialog'
import {ViewQuoteEmailDialog} from './ViewQuoteEmailDialog'

interface QuoteActionsCardProps {
    quoteRequestId: string
    status: QuoteRequestStatus
    customerEmail: string
    items: QuoteRequestItem[]
    quotedNotes: string | null
    canMutate: boolean
    onStatusChange: (status: QuoteRequestStatus) => void
    isPending: boolean
}

/**
 * The happy path is sequential, no skips: NEW → IN_PROGRESS (Start Processing) →
 * [QUOTE_DRAFTED (Save Draft) →]? QUOTE_SENT (Generate/Edit Quote, either straight from
 * IN_PROGRESS or from a saved draft) → CLOSED (Close Quote, only once a quote has actually
 * been sent). Cancel Quote is the other way out — available any time before a quote is sent
 * (NEW, IN_PROGRESS, or QUOTE_DRAFTED) and nowhere after; CLOSED and CANCELED are both
 * terminal. See QuoteRequestService's transition map, which enforces the identical chain
 * server-side.
 * <p>
 * Preview Quote (the read-only "what was sent" viewer) is a separate concern from the status
 * actions above it: it only makes sense once a quote has actually gone out, so it's gated on
 * the status being QUOTE_SENT or CLOSED — never on a saved-but-unsent draft, which has never
 * been shown to the customer and previews through Edit Quote's own in-dialog preview instead.
 */
export function QuoteActionsCard({
                                     quoteRequestId,
                                     status,
                                     customerEmail,
                                     items,
                                     quotedNotes,
                                     canMutate,
                                     onStatusChange,
                                     isPending
                                 }: QuoteActionsCardProps) {
    const [generateOpen, setGenerateOpen] = useState(false)
    const [viewOpen, setViewOpen] = useState(false)
    const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)

    const showTransitionActions = canMutate && status !== 'CLOSED' && status !== 'CANCELED'
    const canGenerateQuote = status === 'IN_PROGRESS' || status === 'QUOTE_DRAFTED'
    const isEditingDraft = status === 'QUOTE_DRAFTED'
    const canClose = status === 'QUOTE_SENT'
    const canCancel = status === 'NEW' || status === 'IN_PROGRESS' || status === 'QUOTE_DRAFTED'
    const wasSent = status === 'QUOTE_SENT' || status === 'CLOSED'
    const hasQuote = items.some((item) => item.unitPrice !== null)
    // Both conditions matter separately: wasSent excludes an unsent draft (has pricing, never
    // shown to the customer); hasQuote excludes a legacy CLOSED request that was closed
    // before this pricing feature existed and was never actually priced at all.
    const showPreview = canMutate && wasSent && hasQuote
    const showEmptyState = !showTransitionActions && !showPreview

    const handleConfirmCancel = () => {
        setConfirmCancelOpen(false)
        onStatusChange('CANCELED')
    }

    return (
        <>
            <Card as="section" variant="bordered" className="flex h-full flex-col">
                <Card.Header className="m-0 flex items-center gap-3 px-5 py-4">
                    <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--c-accent-subtle) text-(--c-accent)">
                        <Zap className="h-4 w-4" aria-hidden="true"/>
                    </span>
                    <span>Actions</span>
                </Card.Header>
                <Card.Body className="p-5">
                    <div className="flex flex-col gap-3">
                        {showTransitionActions && (
                            <div className="flex flex-col gap-3" data-testid="status-actions">
                                {status === 'NEW' && (
                                    <Button
                                        variant="solid"
                                        size="sm"
                                        onClick={() => onStatusChange('IN_PROGRESS')}
                                        disabled={isPending}
                                        leftIcon={<Play className="h-4 w-4"/>}
                                        className="w-full"
                                    >
                                        Start Processing
                                    </Button>
                                )}
                                {canGenerateQuote && (
                                    <Button
                                        variant="solid"
                                        size="sm"
                                        onClick={() => setGenerateOpen(true)}
                                        disabled={isPending}
                                        leftIcon={<Receipt className="h-4 w-4"/>}
                                        className="w-full"
                                    >
                                        {isEditingDraft ? 'Edit Quote' : 'Generate Quote'}
                                    </Button>
                                )}
                                {canClose && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onStatusChange('CLOSED')}
                                        disabled={isPending}
                                        leftIcon={<CheckCircle2 className="h-4 w-4"/>}
                                        className="w-full"
                                    >
                                        Close Quote
                                    </Button>
                                )}
                                {canCancel && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setConfirmCancelOpen(true)}
                                        disabled={isPending}
                                        leftIcon={<XCircle className="h-4 w-4"/>}
                                        className="w-full"
                                    >
                                        Cancel Quote
                                    </Button>
                                )}
                            </div>
                        )}
                        {showPreview && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewOpen(true)}
                                leftIcon={<Eye className="h-4 w-4"/>}
                                className="w-full"
                            >
                                Preview Quote
                            </Button>
                        )}
                        {showEmptyState && (
                            <p className="py-3 text-center text-xs text-(--c-text-muted)">
                                No actions available for this quote.
                            </p>
                        )}
                    </div>
                </Card.Body>
            </Card>

            <GenerateQuoteDialog
                open={generateOpen}
                onClose={() => setGenerateOpen(false)}
                quoteRequestId={quoteRequestId}
                customerEmail={customerEmail}
                items={items}
                quotedNotes={quotedNotes}
            />

            <ViewQuoteEmailDialog
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                quoteRequestId={quoteRequestId}
                items={items}
                quotedNotes={quotedNotes}
            />

            <ConfirmationDialog
                open={confirmCancelOpen}
                onClose={() => setConfirmCancelOpen(false)}
                onConfirm={handleConfirmCancel}
                title="Cancel this quote request?"
                description="This ends the request permanently — it can't be reopened or sent a quote afterward."
                confirmLabel="Cancel Quote"
                variant="danger"
                isLoading={isPending}
            />
        </>
    )
}
