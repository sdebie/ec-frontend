import {useEffect, useState} from 'react'

import {Dialog, DialogContent, DialogFooter, DialogHeader,} from '@/shared/ui/components/dialog/Dialog'
import {Button} from '@/shared/ui/primitives'

export interface RejectApplicationDialogProps {
    open: boolean
    onClose: () => void
    onConfirm: (reason: string) => void
    isLoading?: boolean
}

export function RejectApplicationDialog({
                                            open,
                                            onClose,
                                            onConfirm,
                                            isLoading = false,
                                        }: RejectApplicationDialogProps) {
    const [reason, setReason] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        setReason('')
        setError('')
    }, [open])

    const handleSubmit = () => {
        if (reason.trim().length === 0) {
            setError('A rejection reason is required.')
            return
        }
        onConfirm(reason.trim())
    }

    return (
        <Dialog open={open} onClose={onClose} size="sm">
            <DialogHeader title="Reject Wholesale Application"/>

            <DialogContent>
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-(--c-text-muted)">
                        Please provide a reason for rejecting this application. This will be
                        shared with the applicant.
                    </p>

                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="reject-reason"
                            className="text-sm font-medium text-(--c-text)"
                        >
                            Reason
                        </label>
                        <textarea
                            id="reject-reason"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value)
                                if (error) setError('')
                            }}
                            placeholder="Enter reason for rejection…"
                            rows={4}
                            className="w-full resize-y rounded-lg border border-(--c-border) bg-(--c-panel) px-3 py-2 text-sm text-(--c-text) placeholder:text-(--c-text-muted) focus:border-(--c-accent) focus:outline-none focus:ring-2 focus:ring-(--c-ring)"
                            aria-invalid={!!error}
                            aria-describedby={error ? 'reject-reason-error' : undefined}
                        />
                        {error && (
                            <p
                                id="reject-reason-error"
                                className="text-xs text-(--c-danger,#ef4444)"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>

            <DialogFooter>
                <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>
                <Button
                    variant="solid"
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    className="bg-(--c-danger,#ef4444) hover:bg-(--c-danger-hover,#dc2626) text-(--c-danger-text,#fff) focus-visible:ring-(--c-danger,#ef4444)"
                >
                    Reject
                </Button>
            </DialogFooter>
        </Dialog>
    )
}
