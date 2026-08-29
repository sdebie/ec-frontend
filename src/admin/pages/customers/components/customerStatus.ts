import {CircleCheck, CircleX, Clock, type LucideIcon} from 'lucide-react'
import {CustomerStatus, CustomerStatusOptions} from '@/shared/types/enums'

interface CustomerStatusConfig {
    label: string
    color: string
    icon: LucideIcon
    description: string
}

/**
 * Icon + description only — label/color come from the shared CustomerStatusOptions
 * (@/shared/types/enums/CustomerStatus.ts), the same source CustomerStatusDisplay
 * renders from, so this panel's status treatment can never drift from the badge's.
 */
const CUSTOMER_STATUS_ICONS: Record<CustomerStatus, LucideIcon> = {
    [CustomerStatus.ACTIVE]: CircleCheck,
    [CustomerStatus.PENDING]: Clock,
    [CustomerStatus.DISABLED]: CircleX,
}

const CUSTOMER_STATUS_DESCRIPTIONS: Record<CustomerStatus, string> = {
    [CustomerStatus.ACTIVE]: 'Account is active and can place orders.',
    [CustomerStatus.PENDING]: 'Awaiting activation.',
    [CustomerStatus.DISABLED]: 'Account is suspended and cannot place orders.',
}

export function resolveCustomerStatusConfig(status: CustomerStatus): CustomerStatusConfig {
    return {
        ...CustomerStatusOptions[status],
        icon: CUSTOMER_STATUS_ICONS[status],
        description: CUSTOMER_STATUS_DESCRIPTIONS[status],
    }
}
