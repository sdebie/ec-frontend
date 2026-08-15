import type {ReactNode} from 'react'
import {cn} from '@/shared/utils/cn'

export interface PageLayoutProps {
    /** Page title rendered as a h1 */
    title: string
    /** Optional subtitle rendered below the title */
    subtitle?: string
    /** Optional action slot rendered to the right of the title */
    action?: ReactNode
    /** Page content */
    children: ReactNode
    /** Additional CSS classes */
    className?: string
}

export function PageLayout({
                               title,
                               subtitle,
                               action,
                               children,
                               className,
                           }: PageLayoutProps) {
    return (
        <div className={cn('space-y-3 mt-3', className)}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{color: 'var(--c-text)'}}>
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-(--c-text-muted)">
                            {subtitle}
                        </p>
                    )}
                </div>
                {action &&
                    <div>
                        {action}
                    </div>
                }
            </div>
            <div>
                {children}
            </div>
        </div>
    )
}
