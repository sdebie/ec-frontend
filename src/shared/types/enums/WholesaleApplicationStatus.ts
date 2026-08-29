export const WholesaleApplicationStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CONVERTED: 'CONVERTED',
} as const

export type WholesaleApplicationStatus =
    (typeof WholesaleApplicationStatus)[keyof typeof WholesaleApplicationStatus]

export const WholesaleApplicationStatusOptions: Record<WholesaleApplicationStatus, { label: string; color: string }> = {
    [WholesaleApplicationStatus.PENDING]: {
        label: 'Pending Review',
        color: 'blue'
    },
    [WholesaleApplicationStatus.APPROVED]: {
        label: 'Approved',
        color: 'green'
    },
    [WholesaleApplicationStatus.REJECTED]: {
        label: 'Rejected',
        color: 'red'
    },
    [WholesaleApplicationStatus.CONVERTED]: {
        label: 'Converted to Customer',
        color: 'orange'
    },
}
