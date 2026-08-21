import type {ReactNode} from 'react'
import {cn} from '@/shared/utils/cn'
import {Container, type ContainerProps} from '@/shared/ui/primitives'
import {PageBackButton} from './PageBackButton'

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
    /** When provided, renders a PageBackButton beside the title */
    onBack?: () => void
    /** Width cap for the content Container. Defaults to 'xl' for wide, table-heavy pages. */
    size?: ContainerProps['size']
}

export function PageLayout({
                               title,
                               subtitle,
                               action,
                               children,
                               className,
                               onBack,
                               size = 'xl',
                           }: PageLayoutProps) {
    return (
        <div className={cn('space-y-3 mt-3', className)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    {onBack && <PageBackButton onClick={onBack} className="mt-1" />}
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
            <Container size={size} padded={false}>
                {children}
            </Container>
        </div>
    )
}
