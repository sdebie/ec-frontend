import {useState} from 'react'
import {Eye, PenLine, Send} from 'lucide-react'

import {Dialog, DialogHeader, DialogContent, DialogFooter, Textarea} from '@/shared/ui/components'
import {Button, Input} from '@/shared/ui/primitives'
import {formatAmount} from '@/shared/utils/formatAmount'
import type {QuoteRequestItem} from '../hooks/useQuoteRequestDetail'
import {useGenerateAndSendQuote} from '../hooks/useGenerateAndSendQuote'
import {usePreviewQuoteEmail} from '../hooks/usePreviewQuoteEmail'
import type {QuoteItemPrice} from '../hooks/quoteItemPrice'

export interface GenerateQuoteDialogProps {
    open: boolean
    onClose: () => void
    quoteRequestId: string
    items: QuoteRequestItem[]
}

/** A price string is valid input the moment it parses to a finite number >= 0. */
function parsePrice(raw: string): number | null {
    if (raw.trim() === '') return null
    const value = Number(raw)
    return Number.isFinite(value) && value >= 0 ? value : null
}

export function GenerateQuoteDialog({open, onClose, quoteRequestId, items}: GenerateQuoteDialogProps) {
    const [prices, setPrices] = useState<Record<string, string>>({})
    const [notes, setNotes] = useState('')
    const [previewHtml, setPreviewHtml] = useState<string | null>(null)

    const previewMutation = usePreviewQuoteEmail()
    const sendMutation = useGenerateAndSendQuote()

    const parsedPrices: Record<string, number | null> = {}
    for (const item of items) {
        parsedPrices[item.id] = parsePrice(prices[item.id] ?? '')
    }
    const allPricesValid = items.length > 0 && items.every((item) => parsedPrices[item.id] !== null)
    const total = allPricesValid
        ? items.reduce((sum, item) => sum + (parsedPrices[item.id] as number) * item.quantity, 0)
        : null

    const buildItemPrices = (): QuoteItemPrice[] =>
        items.map((item) => ({itemId: item.id, unitPrice: parsedPrices[item.id] as number}))

    const handleClose = () => {
        setPrices({})
        setNotes('')
        setPreviewHtml(null)
        onClose()
    }

    const handlePreview = () => {
        previewMutation.mutate(
            {id: quoteRequestId, items: buildItemPrices(), notes: notes.trim() || null},
            {onSuccess: setPreviewHtml},
        )
    }

    const handleSend = () => {
        sendMutation.mutate(
            {id: quoteRequestId, items: buildItemPrices(), notes: notes.trim() || null},
            {onSuccess: handleClose},
        )
    }

    return (
        <Dialog open={open} onClose={handleClose} size="xl" aria-label="Generate and send quote">
            <DialogHeader
                title="Generate Quote"
                description="Price every requested item, then preview the email before sending it to the customer."
            />
            <DialogContent>
                {previewHtml !== null ? (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-(--c-text-muted)">
                            This is exactly what the customer will receive.
                        </p>
                        <iframe
                            title="Quote email preview"
                            srcDoc={previewHtml}
                            className="h-96 w-full rounded-(--c-radius) border border-(--c-border) bg-white"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        <div className="overflow-hidden rounded-(--c-radius) border border-(--c-border)">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-(--c-border) bg-(--c-panel-secondary)">
                                        <th className="px-4 py-2 text-left font-medium text-(--c-text-muted)">Product</th>
                                        <th className="px-4 py-2 text-right font-medium text-(--c-text-muted)">Qty</th>
                                        <th className="px-4 py-2 text-right font-medium text-(--c-text-muted)">Unit Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} className="border-b border-(--c-border) last:border-b-0">
                                            <td className="px-4 py-2 text-(--c-text)">
                                                {item.productNameSnapshot}
                                                {item.variantSkuSnapshot && (
                                                    <span className="ml-2 text-xs text-(--c-text-muted)">
                                                        {item.variantSkuSnapshot}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-right text-(--c-text)">{item.quantity}</td>
                                            <td className="px-4 py-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="text-right"
                                                    value={prices[item.id] ?? ''}
                                                    onChange={(e) =>
                                                        setPrices((prev) => ({...prev, [item.id]: e.target.value}))
                                                    }
                                                    aria-label={`Unit price for ${item.productNameSnapshot}`}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex items-center justify-end gap-2 text-sm">
                            <span className="text-(--c-text-muted)">Total</span>
                            <span className="text-base font-semibold text-(--c-text)">
                                {formatAmount(total)}
                            </span>
                        </div>

                        <div>
                            <Textarea
                                label="Notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g. Valid 14 days, excludes delivery"
                                rows={3}
                            />
                        </div>
                    </div>
                )}
            </DialogContent>
            <DialogFooter>
                {previewHtml !== null ? (
                    <>
                        <Button variant="outline" onClick={() => setPreviewHtml(null)} leftIcon={<PenLine className="h-4 w-4"/>}>
                            Back to Edit
                        </Button>
                        <Button
                            variant="solid"
                            onClick={handleSend}
                            disabled={sendMutation.isPending}
                            leftIcon={<Send className="h-4 w-4"/>}
                        >
                            Send Quote
                        </Button>
                    </>
                ) : (
                    <>
                        <Button variant="ghost" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handlePreview}
                            disabled={!allPricesValid || previewMutation.isPending}
                            leftIcon={<Eye className="h-4 w-4"/>}
                        >
                            Preview Email
                        </Button>
                    </>
                )}
            </DialogFooter>
        </Dialog>
    )
}
