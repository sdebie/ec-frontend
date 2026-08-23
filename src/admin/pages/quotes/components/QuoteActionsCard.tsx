import {CheckCircle2, Play} from 'lucide-react'
import {Button, Card} from '@/shared/ui/primitives'
import type {QuoteRequestStatus} from '@/shared/types/enums'

interface QuoteActionsCardProps {
    status: QuoteRequestStatus
    canMutate: boolean
    onStatusChange: (status: QuoteRequestStatus) => void
    isPending: boolean
}

/**
 * Only ever offers a transition the backend actually accepts (NEW → IN_PROGRESS → CLOSED,
 * one-way — see QuoteRequestService's transition map). CLOSED has no valid next status, so
 * a closed quote falls through to the empty state rather than a dead "Reopen" button.
 */
export function QuoteActionsCard({status, canMutate, onStatusChange, isPending}: QuoteActionsCardProps) {
    const showActions = canMutate && status !== 'CLOSED'

    return (
        <Card as="section" variant="bordered" className="flex h-full flex-col">
            <Card.Header className="m-0 px-5 py-4">Actions</Card.Header>
            <Card.Body className="flex flex-1 flex-col justify-center gap-3 p-5">
                {showActions ? (
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
                ) : (
                    <p className="text-sm text-(--c-text-muted)">
                        No actions available for this quote.
                    </p>
                )}
            </Card.Body>
        </Card>
    )
}
