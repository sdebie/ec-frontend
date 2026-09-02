export const WholesaleCustomerStatus = {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    DISABLED: 'DISABLED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CONVERTED: 'CONVERTED',
} as const

export type WholesaleCustomerStatus =
    (typeof WholesaleCustomerStatus)[keyof typeof WholesaleCustomerStatus]

export const WholesaleCustomerStatusOptions: Record<WholesaleCustomerStatus, { label: string; color: string }> = {
    [WholesaleCustomerStatus.PENDING]: {
        label: 'Pending',
        color: 'blue'
    },
    [WholesaleCustomerStatus.ACTIVE]: {
        label: 'Active',
        color: 'green'
    },
    [WholesaleCustomerStatus.DISABLED]: {
        label: 'Disabled',
        color: 'red'
    },
    [WholesaleCustomerStatus.APPROVED]: {
        label: 'Approved',
        color: 'green'
    },
    [WholesaleCustomerStatus.REJECTED]: {
        label: 'Rejected',
        color: 'red'
    },
    [WholesaleCustomerStatus.CONVERTED]: {
        label: 'Converted',
        color: 'orange'
    },
}
