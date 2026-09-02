import {describe, it, expect} from 'vitest'
import {render, screen} from '@testing-library/react'
import {OrderStatus} from '@/shared/types/enums/OrderStatus'
import {formatDateTime} from '@/shared/utils/formatDateTime'
import {OrderPaymentPanel} from '../OrderPaymentPanel'

describe('OrderPaymentPanel', () => {
    it('renders nothing when there is no gateway payment and no in-store signal', () => {
        render(
            <OrderPaymentPanel
                payment={null}
                statusHistory={[{status: OrderStatus.CREATED, timestamp: '2026-01-01T10:00:00Z'}]}
            />,
        )

        expect(screen.queryByTestId('order-payment-panel')).not.toBeInTheDocument()
    })

    it('shows the gateway detail when a payment gateway callback is on record', () => {
        render(
            <OrderPaymentPanel
                payment={{
                    gateway: 'PAYFAST',
                    externalReference: 'pf-77001',
                    amountGross: 30250,
                    status: 'COMPLETE',
                    receivedAt: '2026-01-01T10:32:00Z',
                }}
                statusHistory={[]}
            />,
        )

        expect(screen.getByText('Payment')).toBeInTheDocument()
        expect(screen.getByText('PAYFAST')).toBeInTheDocument()
        expect(screen.getByText('pf-77001')).toBeInTheDocument()
        expect(screen.getByText('COMPLETE')).toBeInTheDocument()
    })

    /**
     * No PaymentLogEntity row is ever written for an in-store payment (only the
     * PayFast webhook writes one), so `payment` is null for every in-store order.
     * The only trace on this page is the IN_STORE_PAYMENT status having occurred.
     */
    it('shows "In-Store" as the method when payment is null but the order passed through IN_STORE_PAYMENT', () => {
        render(
            <OrderPaymentPanel
                payment={null}
                statusHistory={[
                    {status: OrderStatus.CREATED, timestamp: '2026-01-01T10:00:00Z'},
                    {status: OrderStatus.IN_STORE_PAYMENT, timestamp: '2026-01-01T10:01:00Z'},
                    {status: OrderStatus.PAID, timestamp: '2026-01-01T11:00:00Z', staffName: 'Staff User'},
                ]}
            />,
        )

        expect(screen.getByTestId('order-payment-panel')).toBeInTheDocument()
        expect(screen.getByText('In-Store')).toBeInTheDocument()
        // Received is derived from the PAID entry, since no gateway row supplies one.
        expect(screen.getByText(formatDateTime('2026-01-01T11:00:00Z'))).toBeInTheDocument()
    })

    it('omits Received for an in-store order that has not been marked paid yet', () => {
        render(
            <OrderPaymentPanel
                payment={null}
                statusHistory={[
                    {status: OrderStatus.CREATED, timestamp: '2026-01-01T10:00:00Z'},
                    {status: OrderStatus.IN_STORE_PAYMENT, timestamp: '2026-01-01T10:01:00Z'},
                ]}
            />,
        )

        expect(screen.getByText('In-Store')).toBeInTheDocument()
        expect(screen.queryByText('Received')).not.toBeInTheDocument()
    })
})
