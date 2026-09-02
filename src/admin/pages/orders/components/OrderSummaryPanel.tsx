import {formatAmount} from '@/shared/utils/formatAmount'

interface OrderSummaryPanelProps {
    subtotal: number
    shippingCost: number
    vatAmount: number
    grandTotal: number
}

/**
 * The money, as the server computed it. Every figure arrives already totalled — nothing
 * here adds anything up, because a client that re-derives a total is a second answer to a
 * question that already has one.
 *
 * Rendered nested inside its own Order Summary card, so it carries no heading or border
 * of its own — the card it lives in already supplies both.
 */
export function OrderSummaryPanel({
                                      subtotal,
                                      shippingCost,
                                      vatAmount,
                                      grandTotal,
                                  }: OrderSummaryPanelProps) {
    const lines = [
        {
            label: 'Sub-Total',
            amount: subtotal
        },
        {
            label: 'Shipping',
            amount: shippingCost
        },
        {
            label: 'VAT',
            amount: vatAmount
        },
    ]

    return (
        <dl className="space-y-2 text-sm">
            {lines.map(({label, amount}) => (
                <div key={label} className="flex justify-between">
                    <dt className="text-(--c-text-muted)">
                        {label}
                    </dt>
                    <dd className="font-medium text-(--c-text)">
                        {formatAmount(amount)}
                    </dd>
                </div>
            ))}
            <div className="flex justify-between border-t border-(--c-border) pt-2">
                <dt className="font-semibold text-(--c-text)">
                    Total
                </dt>
                <dd className="font-semibold text-(--c-text)">
                    {formatAmount(grandTotal)}
                </dd>
            </div>
        </dl>
    )
}
