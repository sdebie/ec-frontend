import {Card} from '@/shared/ui/primitives'
import {formatAmount} from '@/shared/utils/formatAmount'
import {formatDateTime} from '@/shared/utils/formatDateTime'
import {OrderStatus} from '@/shared/types/enums/OrderStatus'
import type {OrderPaymentInfo, OrderStatusHistoryEntry} from '../types'

interface OrderPaymentPanelProps {
    payment: OrderPaymentInfo | null
    statusHistory: OrderStatusHistoryEntry[]
}

/**
 * The payment method actually used. An online gateway payment (PayFast today)
 * writes a PaymentLogEntity row on the backend, so `payment` carries full gateway
 * detail. An in-store payment never does — nothing calls the gateway webhook — so
 * its only trace on this page is the IN_STORE_PAYMENT status the order passed
 * through. Without that fallback, every in-store-paid order would show no payment
 * panel at all rather than a wrong one.
 */
export function OrderPaymentPanel({payment, statusHistory}: OrderPaymentPanelProps) {
    const wasInStore = statusHistory.some((entry) => entry.status === OrderStatus.IN_STORE_PAYMENT)

    if (!payment && !wasInStore) {
        return null
    }

    const paidEntry = statusHistory.find((entry) => entry.status === OrderStatus.PAID)

    const lines = payment
        ? [
            {
                label: 'Method',
                value: payment.gateway ?? 'Online'
            },
            {
                label: 'Reference',
                value: payment.externalReference ?? '—'
            },
            {
                label: 'Amount',
                value: formatAmount(payment.amountGross)
            },
            {
                label: 'Status',
                value: payment.status ?? '—'
            },
            {
                label: 'Received',
                value: formatDateTime(payment.receivedAt)
            },
        ]
        : [
            {
                label: 'Method',
                value: 'In-Store'
            },
            ...(paidEntry ? [{
                label: 'Received',
                value: formatDateTime(paidEntry.timestamp)
            }] : []),
        ]

    return (
        <Card as="section" variant="bordered" data-testid="order-payment-panel">
            <Card.Header className="m-0 px-5 py-4">
                Payment
            </Card.Header>
            <Card.Body className="p-5">
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
            </Card.Body>
        </Card>
    )
}
