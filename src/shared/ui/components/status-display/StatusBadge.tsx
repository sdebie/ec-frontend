import * as React from 'react'
import {cn} from '@/shared/utils/cn'

/**
 * Every value resolves to `--c-status-*` tokens, which the admin surface maps from
 * `--admin-status-*` in index.css. Light and dark therefore come from one place, and
 * nothing here needs a `dark:` variant — hard-coding one would put a second palette
 * outside the theme layer, where it could not follow a preset.
 *
 * Only red, green and yellow surfaces exist, so the vocabulary maps onto them by meaning
 * rather than by hue name:
 *   red    → cancelled or errored
 *   green  → completed, paid, succeeded
 *   yellow → pending, processing, in transit, needing attention
 *   gray   → not started, or information carrying no state
 */
const colorTokens: Record<string, string> = {
    // A neutral badge borrows the surface tokens rather than a status colour: "Created"
    // is the absence of a state, and an amber pill said otherwise.
    gray: 'bg-(--c-panel-secondary) text-(--c-text-muted) border-(--c-border)',
    yellow: 'bg-(--c-status-yellow-bg) text-(--c-status-yellow-text) border-(--c-status-yellow-border)',
    green: 'bg-(--c-status-green-bg) text-(--c-status-green-text) border-(--c-status-green-border)',
    // In-progress, not done: blue previously borrowed the green tokens, which made an
    // order still in transit look identical to one already delivered.
    blue: 'bg-(--c-status-yellow-bg) text-(--c-status-yellow-text) border-(--c-status-yellow-border)',
    red: 'bg-(--c-status-red-bg) text-(--c-status-red-text) border-(--c-status-red-border)',
    orange: 'bg-(--c-status-yellow-bg) text-(--c-status-yellow-text) border-(--c-status-yellow-border)',
}

const neutralClasses = colorTokens.gray

export interface StatusBadgeProps {
    label: string
    color: string
    className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({label, color, className}) => {
    return (
        <span
            data-testid="status-badge"
            className={cn(
                // Compact enough to sit inside a table row without becoming the loudest
                // thing in it: tight padding, an explicit line height so the text centres
                // on its own line box, and a low-contrast border that gives the tint an
                // edge instead of relying on a heavier fill.
                'inline-flex items-center justify-center whitespace-nowrap rounded-full border',
                'px-2.5 py-1 text-xs font-semibold leading-4',
                colorTokens[color] ?? neutralClasses,
                className,
            )}
        >
            {label}
        </span>
    )
}
