import {CircleCheck, CircleX, Clock, type LucideIcon, UserCheck} from 'lucide-react'
import {WholesaleApplicationStatus, WholesaleApplicationStatusOptions} from '@/shared/types/enums'

interface ApplicationStatusConfig {
    label: string
    color: string
    icon: LucideIcon
    description: string
}

/**
 * Icon + description only — label/color come from the shared
 * WholesaleApplicationStatusOptions (@/shared/types/enums/WholesaleApplicationStatus.ts),
 * the same source WholesaleApplicationStatusDisplay renders from, so the header badge
 * and this status panel can never show a status two different ways again.
 */
const APPLICATION_STATUS_ICONS: Record<WholesaleApplicationStatus, LucideIcon> = {
    [WholesaleApplicationStatus.PENDING]: Clock,
    [WholesaleApplicationStatus.APPROVED]: CircleCheck,
    [WholesaleApplicationStatus.REJECTED]: CircleX,
    [WholesaleApplicationStatus.CONVERTED]: UserCheck,
}

const APPLICATION_STATUS_DESCRIPTIONS: Record<WholesaleApplicationStatus, string> = {
    [WholesaleApplicationStatus.PENDING]: 'Awaiting review and decision',
    [WholesaleApplicationStatus.APPROVED]: 'This application has been approved',
    [WholesaleApplicationStatus.REJECTED]: 'This application has been rejected',
    [WholesaleApplicationStatus.CONVERTED]: 'Applicant has been converted to a wholesale customer',
}

const isKnownStatus = (status: string): status is WholesaleApplicationStatus =>
    (Object.values(WholesaleApplicationStatus) as string[]).includes(status)

/** Falls back to PENDING's config for any status not in the map, rather than rendering blank. */
export function resolveApplicationStatusConfig(status: string): ApplicationStatusConfig {
    const known = isKnownStatus(status) ? status : WholesaleApplicationStatus.PENDING
    return {
        ...WholesaleApplicationStatusOptions[known],
        icon: APPLICATION_STATUS_ICONS[known],
        description: APPLICATION_STATUS_DESCRIPTIONS[known],
    }
}

// Mirrors StatusBadge's own colour → token mapping, scoped to text/icon colour only.
export const STATUS_ACCENT_CLASS: Record<string, string> = {
    yellow: 'text-(--c-status-yellow-text)',
    green: 'text-(--c-status-green-text)',
    red: 'text-(--c-status-red-text)',
    blue: 'text-(--c-status-yellow-text)',
    orange: 'text-(--c-status-yellow-text)',
}
