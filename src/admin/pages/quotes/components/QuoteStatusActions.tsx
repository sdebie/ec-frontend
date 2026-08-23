import {Button} from '@/shared/ui/primitives'
import type {QuoteRequestStatus} from '@/shared/types/enums'

interface QuoteStatusActionsProps {
    status: QuoteRequestStatus
    onStatusChange: (status: QuoteRequestStatus) => void
    isPending: boolean
}

export function QuoteStatusActions({status, onStatusChange, isPending}: QuoteStatusActionsProps) {
    return (
        <div className="flex flex-wrap gap-3" data-testid="status-actions">
            {status === 'NEW' && (
                <>
                    <Button
                        variant="solid"
                        size="sm"
                        onClick={() => onStatusChange('IN_PROGRESS')}
                        disabled={isPending}
                    >
                        Start Processing
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStatusChange('CLOSED')}
                        disabled={isPending}
                    >
                        Close
                    </Button>
                </>
            )}
            {status === 'IN_PROGRESS' && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange('CLOSED')}
                    disabled={isPending}
                >
                    Close
                </Button>
            )}
        </div>
    )
}
