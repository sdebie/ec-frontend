import {useState} from 'react'
import {ChevronLeft, ChevronRight} from 'lucide-react'

import {Thumbnail} from '@/shared/ui/components'
import {formatAmount} from '@/shared/utils/formatAmount'
import type {OrderLineItem} from '@/admin/pages/orders/types'

interface OrderLineItemsTableProps {
    lineItems: OrderLineItem[]
}

/**
 * Six keeps the table roughly the height of the summary panel beside it, so a long order of
 * pages rather than pushing everything below it off the screen.
 */
const PAGE_SIZE = 6

export function OrderLineItemsTable({lineItems}: OrderLineItemsTableProps) {

    const [page, setPage] = useState(0)
    const pageCount = Math.max(1, Math.ceil(lineItems.length / PAGE_SIZE))
    const current = Math.min(page, pageCount - 1)
    const start = current * PAGE_SIZE
    const visible = lineItems.slice(start, start + PAGE_SIZE)

    return (
        <div className="flex flex-col gap-3">
            <div className="overflow-x-auto rounded-md border border-(--c-border)">
                <table className="w-full text-sm text-left text-(--c-text)">
                    <thead
                        className="text-xs font-semibold text-(--c-text-muted) bg-(--c-surface-hover) border-b border-(--c-border)">
                    <tr>
                        <th className="px-4 py-3">
                            Product
                        </th>
                        <th className="px-4 py-3">
                            SKU
                        </th>
                        <th className="px-4 py-3 text-right">
                            Unit Price
                        </th>
                        <th className="px-4 py-3 text-right">
                            Qty
                        </th>
                        <th className="px-4 py-3 text-right">
                            Line Total
                        </th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-(--c-border)">
                    {visible.map((item) => {

                        const productName = item.productName ?? 'Product no longer in catalogue'

                        return (
                            <tr key={item.id}>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Thumbnail logoUrl={item.thumbnailUrl} name={productName} size="sm"/>
                                        <span className="font-medium">
                                            {productName}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-(--c-text-muted)">
                                    {item.variantSku ?? '—'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {formatAmount(item.unitPrice)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {item.quantity}
                                </td>
                                <td className="px-4 py-3 text-right font-medium">
                                    {formatAmount(item.lineTotal)}
                                </td>
                            </tr>
                        )
                    })}

                    {pageCount > 1 && Array.from({length: PAGE_SIZE - visible.length}).map((_, i) => (
                        <tr key={`filler-${i}`} aria-hidden="true">
                            <td className="px-4 py-3" colSpan={5}>
                                {/* Matches a populated row: the thumbnail is the tallest thing in one. */}
                                <div className="h-8"/>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Nothing to page through on a short order, so the controls stay out of the way. */}
            {pageCount > 1 && (
                <div className="flex items-center justify-between text-xs text-(--c-text-muted)">
                    <span>
                        {start + 1}–{start + visible.length} of {lineItems.length}
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => setPage(current - 1)}
                            disabled={current === 0}
                            aria-label="Previous page of line items"
                            className="inline-flex items-center justify-center rounded-md p-1 hover:bg-(--c-surface-hover) disabled:opacity-40 disabled:pointer-events-none"
                        >
                            <ChevronLeft className="h-4 w-4"/>
                        </button>
                        <span>
                            {current + 1} / {pageCount}
                        </span>
                        <button
                            type="button"
                            onClick={() => setPage(current + 1)}
                            disabled={current >= pageCount - 1}
                            aria-label="Next page of line items"
                            className="inline-flex items-center justify-center rounded-md p-1 hover:bg-(--c-surface-hover) disabled:opacity-40 disabled:pointer-events-none"
                        >
                            <ChevronRight className="h-4 w-4"/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
