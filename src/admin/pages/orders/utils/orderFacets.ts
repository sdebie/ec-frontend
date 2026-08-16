/**
 * The two questions staff ask of an order's status, as filter vocabularies.
 *
 * Mirrors `PaymentState` and `FulfilmentState` in ec-common, which are the authority — the
 * server resolves each value back to the statuses that report it, and rejects anything
 * outside its enum. Keep the values in step; only the labels live here.
 *
 * `ALL` is the UI's clear-the-filter sentinel, not a server value.
 */
export const PAYMENT_STATE_OPTIONS = [
    {value: 'ALL', label: 'Any payment'},
    {value: 'AWAITING', label: 'Awaiting payment'},
    {value: 'FAILED', label: 'Payment failed'},
    {value: 'PAID', label: 'Paid'},
    {value: 'PARTIALLY_REFUNDED', label: 'Partially refunded'},
    {value: 'REFUNDED', label: 'Refunded'},
    {value: 'CANCELLED', label: 'Cancelled'},
]

export const FULFILMENT_STATE_OPTIONS = [
    {value: 'ALL', label: 'Any fulfilment'},
    {value: 'NOT_STARTED', label: 'Not started'},
    {value: 'PROCESSING', label: 'Processing'},
    {value: 'READY', label: 'Ready'},
    {value: 'IN_TRANSIT', label: 'In transit'},
    {value: 'PROBLEM', label: 'Delivery problem'},
    {value: 'COMPLETED', label: 'Completed'},
    {value: 'CANCELLED', label: 'Cancelled'},
]
