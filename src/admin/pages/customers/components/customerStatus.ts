import {CircleCheck, CircleX, Clock, type LucideIcon} from 'lucide-react'
import type {CustomerStatus} from '@/admin/pages/customers/types'

interface CustomerStatusConfig {
    label: string
    color: string
    icon: LucideIcon
    description: string
}

/**
 * Single source of truth for how a customer account status reads across the
 * page, mirroring applicationStatus.ts's role for wholesale applications.
 */
const CUSTOMER_STATUS_CONFIG: Record<CustomerStatus, CustomerStatusConfig> = {
    ACTIVE: {
        label: 'Active',
        color: 'green',
        icon: CircleCheck,
        description: 'Account is active and can place orders.',
    },
    PENDING: {
        label: 'Pending',
        color: 'yellow',
        icon: Clock,
        description: 'Awaiting activation.',
    },
    DISABLED: {
        label: 'Disabled',
        color: 'red',
        icon: CircleX,
        description: 'Account is suspended and cannot place orders.',
    },
}

export function resolveCustomerStatusConfig(status: CustomerStatus): CustomerStatusConfig {
    return CUSTOMER_STATUS_CONFIG[status]
}
