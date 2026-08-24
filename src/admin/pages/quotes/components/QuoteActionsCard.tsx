import {useState} from 'react'
import {CheckCircle2, Eye, Play, Receipt, Zap} from 'lucide-react'
import {Button, Card} from '@/shared/ui/primitives'
import type {QuoteRequestStatus} from '@/shared/types/enums'
import type {QuoteRequestItem} from '../hooks/useQuoteRequestDetail'
import {GenerateQuoteDialog} from './GenerateQuoteDialog'
import {ViewQuoteEmailDialog} from './ViewQuoteEmailDialog'

interface QuoteActionsCardProps {
    quoteRequestId: string
    status: QuoteRequestStatus
    items: QuoteRequestItem[]
    quotedNotes: string | null
    canMutate: boolean
    onStatusChange: (status: QuoteRequestStatus) => void
    isPending: boolean
}

/**
 * Only ever offers a transition the backend actually accepts:
 * NEW → IN_PROGRESS, NEW/IN_PROGRESS → QUOTE_SENT (via Generate Quote, which carries the
 * pricing data a plain status change can't), NEW/IN_PROGRESS/QUOTE_SENT → CLOSED. CLOSED is
 * terminal — see QuoteRequestService's transition map. Generate Quote disappears once a
 * quote has been sent; this codebase's quote workflow has no regenerate/resend yet.
 * <p>
 * Preview Quote is a separate concern from the status actions above it: it's a read, not a
 * transition, so it stays available once a quote exists (hasQuote) regardless of status —
 * including after Close Quote, when the transition-action list above is otherwise empty.
 */
export function QuoteActionsCard({quoteRequestId, status, items, quotedNotes, canMutate, onStatusChange, isPending}: QuoteActionsCardProps) {
    const [generateOpen, setGenerateOpen] = useState(false)
    const [viewOpen, setViewOpen] = useState(false)

    const showTransitionActions = canMutate && status !== 'CLOSED'
    const canGenerateQuote = status === 'NEW' || status === 'IN_PROGRESS'
    const hasQuote = items.some((item) => item.unitPrice !== null)
    const showPreview = canMutate && hasQuote
    const showEmptyState = !showTransitionActions && !showPreview

    return (
        <>
            <Card as="section" variant="bordered" className="flex h-full flex-col">
                <Card.Header className="m-0 flex items-center gap-2 px-5 py-4">
                    <Zap className="h-5 w-5 text-(--c-text-muted)"/>
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
                                        Generate Quote
                                    </Button>
                                )}
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
                items={items}
            />

            <ViewQuoteEmailDialog
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                quoteRequestId={quoteRequestId}
                items={items}
                quotedNotes={quotedNotes}
            />
        </>
    )
}
