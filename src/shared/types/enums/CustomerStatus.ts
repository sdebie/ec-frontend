export const CustomerStatus = {
    ACTIVE: 'ACTIVE',
    DISABLED: 'DISABLED',
    PENDING: 'PENDING',
} as const

export type CustomerStatus = (typeof CustomerStatus)[keyof typeof CustomerStatus]

export const CustomerStatusOptions: Record<CustomerStatus, { label: string; color: string }> = {
    [CustomerStatus.ACTIVE]: {
        label: 'Active',
        color: 'green'
    },
    [CustomerStatus.PENDING]: {
        label: 'Pending',
        color: 'yellow'
    },
    [CustomerStatus.DISABLED]: {
        label: 'Disabled',
        color: 'red'
    },
}
