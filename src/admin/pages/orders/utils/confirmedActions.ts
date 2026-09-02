import {OrderStatus} from '@/shared/types/enums/OrderStatus'

/**
 * Every status transition asks before it runs. Descriptions state customer-email
 * behavior only — no transition emails the store today, so none of these claim it does.
 * The order list page has no row-level status actions; this is consumed by the detail
 * page's Order Actions panel only.
 */
export const CONFIRMED_ACTIONS = {
    'await-in-store-payment': {
        status: OrderStatus.IN_STORE_PAYMENT,
        title: 'Await In-Store Payment',
        description: 'This confirms the order for payment on collection and emails the customer their order confirmation. Mark it Paid once they have paid.',
        confirmLabel: 'Await In-Store Payment',
        variant: 'default',
    },
    'mark-paid': {
        status: OrderStatus.PAID,
        title: 'Mark Paid',
        description: 'Confirms this order as paid and emails the customer their order confirmation.',
        confirmLabel: 'Mark Paid',
        variant: 'default',
    },
    'start-processing': {
        status: OrderStatus.PROCESSING,
        title: 'Start Processing',
        description: 'Marks this order as being processed. No notification is sent to the customer.',
        confirmLabel: 'Start Processing',
        variant: 'default',
    },
    'ready-to-ship': {
        status: OrderStatus.READY_TO_SHIP,
        title: 'Ready to Ship',
        description: 'Marks this order ready to ship. No notification is sent to the customer.',
        confirmLabel: 'Ready to Ship',
        variant: 'default',
    },
    'ready-for-collection': {
        status: OrderStatus.READY_FOR_COLLECTION,
        title: 'Ready for Collection',
        description: 'Tells the customer their order is ready to collect in-store.',
        confirmLabel: 'Ready for Collection',
        variant: 'default',
    },
    deliver: {
        status: OrderStatus.DELIVERED,
        title: 'Mark Delivered',
        description: 'Marks this order as delivered and emails the customer.',
        confirmLabel: 'Mark Delivered',
        variant: 'default',
    },
    'mark-collected': {
        status: OrderStatus.COLLECTED,
        title: 'Mark Collected',
        description: 'Marks this order as collected and emails the customer.',
        confirmLabel: 'Mark Collected',
        variant: 'default',
    },
    'delivery-failed': {
        status: OrderStatus.DELIVERY_FAILED,
        title: 'Delivery Failed',
        description: 'Records that delivery failed and emails the customer about the problem.',
        confirmLabel: 'Delivery Failed',
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
