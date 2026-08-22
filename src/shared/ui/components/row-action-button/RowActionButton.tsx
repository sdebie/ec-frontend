import * as React from 'react'
import {cn} from '@/shared/utils/cn'

export interface RowActionButtonProps {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    /** Hover color: accent for normal actions, danger (red) for destructive ones. */
    variant?: 'default' | 'danger'
    /**
     * DropdownMenu's `trigger` prop renders inside its own <button>, so a kebab
     * trigger must render as a <span> here to avoid nesting a button inside a
     * button. onClick/disabled are ignored in this mode — DropdownMenu owns
     * the click behaviour.
     */
    as?: 'button' | 'span'
    className?: string
    'aria-label'?: string
    title?: string
    'data-testid'?: string
}

export function RowActionButton({
                                    children,
                                    onClick,
                                    disabled,
                                    variant = 'default',
                                    as = 'button',
                                    className,
                                    ...rest
                                }: RowActionButtonProps) {
    const classes = cn(
        'inline-flex items-center justify-center p-1 rounded-lg text-(--c-text-muted) transition-colors duration-150',
        'hover:bg-(--c-surface-hover)',
        variant === 'danger' ? 'hover:text-(--c-danger)' : 'hover:text-(--c-accent)',
        'disabled:opacity-50 disabled:pointer-events-none',
        className,
    )

    if (as === 'span') {
        return (
            <span className={classes} {...rest}>
        {children}
      </span>
        )
    }

    return (
        <button type="button" onClick={onClick} disabled={disabled} className={classes} {...rest}>
            {children}
        </button>
    )
}
