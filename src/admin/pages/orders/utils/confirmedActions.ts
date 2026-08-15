import {OrderStatus} from '@/shared/types/enums/OrderStatus'

/**
 * Status changes that ask before they run: the ones that end an order, and setting
 * it to await payment in store — that one emails the customer their order
 * confirmation. Shared by the list and detail pages so both warn identically.
 *
 * The forward fulfilment steps are deliberately absent: they are
 * reversible-by-forward-transition and carry no outward-facing side effect.
 */
export const CONFIRMED_ACTIONS = {
    'await-in-store-payment': {
        status: OrderStatus.IN_STORE_PAYMENT,
        title: 'Await In-Store Payment',
        description: 'This confirms the order for payment on collection and emails the customer their order confirmation. Mark it Paid once they have paid.',
        confirmLabel: 'Await In-Store Payment',
        variant: 'default',
    },
    'cancel-customer': {
        status: OrderStatus.USER_CANCELED,
        title: 'Cancel — Customer Request',
        description: 'Records that the customer cancelled this order, and returns its items to stock. This cannot be undone.',
        confirmLabel: 'Cancel Order',
        variant: 'danger',
    },
    'cancel-staff': {
        status: OrderStatus.ADMIN_CANCELED,
        title: 'Cancel — Store Decision',
        description: 'Records that the store cancelled this order, and returns its items to stock. This cannot be undone.',
        confirmLabel: 'Cancel Order',
        variant: 'danger',
    },
    refund: {
        status: OrderStatus.REFUNDED,
        title: 'Refund Order',
        description: 'This records the order as fully refunded. It does not move any money — process the refund with the payment provider separately — and it does not return anything to stock.',
        confirmLabel: 'Refund Order',
        variant: 'danger',
    },
    'refund-partial': {
        status: OrderStatus.PARTIALLY_REFUNDED,
        title: 'Partially Refund Order',
        description: 'This records the order as partially refunded. It does not move any money — process the refund with the payment provider separately — and it does not return anything to stock.',
        confirmLabel: 'Partially Refund',
        variant: 'danger',
    },
    'return-to-origin': {
        status: OrderStatus.RETURNED_TO_ORIGIN,
        title: 'Mark Returned to Store',
        description: 'Records that the courier brought this order back. Its items are not returned to stock — check their condition and adjust stock yourself if they can be resold.',
        confirmLabel: 'Mark Returned',
        variant: 'default',
    },
} as const

export type ConfirmedAction = keyof typeof CONFIRMED_ACTIONS
