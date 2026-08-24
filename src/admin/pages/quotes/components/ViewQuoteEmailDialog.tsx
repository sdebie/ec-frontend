import {useEffect} from 'react'

import {Dialog, DialogHeader, DialogContent, DialogFooter} from '@/shared/ui/components'
import {Button} from '@/shared/ui/primitives'
import type {QuoteRequestItem} from '../hooks/useQuoteRequestDetail'
import {usePreviewQuoteEmail} from '../hooks/usePreviewQuoteEmail'

export interface ViewQuoteEmailDialogProps {
    open: boolean
    onClose: () => void
    quoteRequestId: string
    items: QuoteRequestItem[]
    quotedNotes: string | null
}

/**
 * Read-only: shows the email exactly as it was sent, from the prices already persisted on
 * the request — no form, no Send button. Reuses previewQuoteEmail rather than storing a
 * rendered copy of the email at send time, so this always reflects the real template, even
 * if the template changes after the quote was sent.
 */
export function ViewQuoteEmailDialog({open, onClose, quoteRequestId, items, quotedNotes}: ViewQuoteEmailDialogProps) {
    const previewMutation = usePreviewQuoteEmail()

    useEffect(() => {
        if (!open) return
        previewMutation.mutate({
            id: quoteRequestId,
            items: items
                .filter((item) => item.unitPrice !== null)
                .map((item) => ({itemId: item.id, unitPrice: item.unitPrice as number})),
            notes: quotedNotes,
        })
        // Re-run only when the dialog opens for a (potentially different) request — not on
        // every render, and not when the mutation object itself changes identity.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, quoteRequestId])

    const handleClose = () => {
        previewMutation.reset()
        onClose()
    }

    return (
        <Dialog open={open} onClose={handleClose} size="xl" aria-label="View sent quote email">
            <DialogHeader title="Quote Email" description="This is the email that was sent to the customer."/>
            <DialogContent>
                {previewMutation.isPending && (
                    <p className="py-8 text-center text-sm text-(--c-text-muted)">Loading preview…</p>
                )}
                {previewMutation.isError && (
                    <p className="py-8 text-center text-sm text-(--c-error)">
                        Failed to load the quote email.
                    </p>
                )}
                {previewMutation.data && (
                    <iframe
                        title="Quote email"
                        srcDoc={previewMutation.data}
                        className="h-96 w-full rounded-(--c-radius) border border-(--c-border) bg-white"
                    />
                )}
            </DialogContent>
            <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                    Close
                </Button>
            </DialogFooter>
        </Dialog>
    )
}
