import {formatAmount} from '@/shared/utils/formatAmount'
import {formatDateTime} from '@/shared/utils/formatDateTime'
import type {OrderPaymentInfo} from '../types'

interface OrderPaymentPanelProps {
    payment: OrderPaymentInfo
}

/**
 * The most recent gateway callback recorded against this order — absent
 * entirely until PayFast (or another gateway) has actually written one.
 */
export function OrderPaymentPanel({payment}: OrderPaymentPanelProps) {
    const lines = [
        {label: 'Gateway', value: payment.gateway ?? '—'},
        {label: 'Reference', value: payment.externalReference ?? '—'},
        {label: 'Amount', value: formatAmount(payment.amountGross)},
        {label: 'Status', value: payment.status ?? '—'},
        {label: 'Received', value: formatDateTime(payment.receivedAt)},
    ]

    return (
        <div className="rounded-(--c-radius) border border-(--c-border) bg-(--c-panel-secondary) p-4">
            <h2 className="mb-3 text-sm font-semibold text-(--c-text)">
                Latest Payment
            </h2>
            <dl className="space-y-2 text-sm">
                {lines.map(({label, value}) => (
                    <div key={label} className="flex justify-between">
                        <dt className="text-(--c-text-muted)">
                            {label}
                        </dt>
                        <dd className="font-medium text-(--c-text)">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    )
}
