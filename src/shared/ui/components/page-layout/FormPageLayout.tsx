import type {ReactNode} from 'react'
import {cn} from '@/shared/utils/cn'
import {PageBackButton} from './PageBackButton'

export interface FormPageLayoutProps {
    /** Page title rendered as a h1, beside the back button. */
    title: string
    /** Optional subtitle rendered below the title. */
    subtitle?: string
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
export function FormPageLayout({title, subtitle, children, className}: FormPageLayoutProps) {
    return (
        <div className={cn('space-y-3 mt-3', className)}>
            <div>
                <div className="flex items-center gap-3">
                    <PageBackButton/>
                    <h1 className="text-2xl font-bold tracking-tight text-(--c-text)">
                        {title}
                    </h1>
                </div>
                {subtitle && (
                    <p className="mt-1 text-sm text-(--c-text-muted)">
                        {subtitle}
                    </p>
                )}
            </div>
            <div>
                {children}
            </div>
        </div>
    )
}
