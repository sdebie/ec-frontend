import {CircleCheck, CircleX, Clock, type LucideIcon, UserCheck} from 'lucide-react'

interface ApplicationStatusConfig {
    label: string
    color: string
    icon: LucideIcon
    description: string
}

/**
 * Single source of truth for how a status reads across the page: the header
 * badge and the status panel both key off this, so a status can't show one
 * colour in one place and a different one in the other.
 */
const APPLICATION_STATUS_CONFIG: Record<string, ApplicationStatusConfig> = {
    PENDING: {label: 'Pending', color: 'yellow', icon: Clock, description: 'Awaiting review and decision'},
    APPROVED: {label: 'Approved', color: 'green', icon: CircleCheck, description: 'This application has been approved'},
    REJECTED: {label: 'Rejected', color: 'red', icon: CircleX, description: 'This application has been rejected'},
    CONVERTED: {
        label: 'Converted',
        color: 'blue',
        icon: UserCheck,
        description: 'Applicant has been converted to a wholesale customer',
    },
}

/** Falls back to PENDING's config for any status not in the map, rather than rendering blank. */
export function resolveApplicationStatusConfig(status: string): ApplicationStatusConfig {
    return APPLICATION_STATUS_CONFIG[status] ?? APPLICATION_STATUS_CONFIG.PENDING
}

// Mirrors StatusBadge's own colour → token mapping, scoped to text/icon colour only.
export const STATUS_ACCENT_CLASS: Record<string, string> = {
    yellow: 'text-(--c-status-yellow-text)',
    green: 'text-(--c-status-green-text)',
    red: 'text-(--c-status-red-text)',
    blue: 'text-(--c-status-yellow-text)',
}
