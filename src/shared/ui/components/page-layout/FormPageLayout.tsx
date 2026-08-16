import type {ReactNode} from 'react'
import {cn} from '@/shared/utils/cn'
import {PageBackButton} from './PageBackButton'

export interface FormPageLayoutProps {
    /** Page title rendered as a h1, beside the back button. */
    title: string
    /** Optional subtitle rendered below the title. */
    subtitle?: string
    /** Optional slot rendered at the far right of the header, e.g. a status badge. */
    action?: ReactNode
    /** Page content — typically a Card wrapping a form or a detail view. */
    children: ReactNode
    /** Additional CSS classes. */
    className?: string
}

/**
 * Shared chrome for create/edit/detail screens: a back button beside the
 * page title, spaced the same distance from the top as PageLayout's list
 * pages. Content stays whatever the caller renders — this only standardises
 * what sits above it.
 */
export function FormPageLayout({title, subtitle, action, children, className}: FormPageLayoutProps) {
    return (
        <div className={cn('space-y-3 mt-3', className)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <PageBackButton className="mt-1"/>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-(--c-text)">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-1 text-sm text-(--c-text-muted)">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
            <div>
                {children}
            </div>
        </div>
    )
}
