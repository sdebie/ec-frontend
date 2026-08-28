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
    /** When provided, renders a PageBackButton above the title */
    onBack?: () => void
    /** Custom label for the back button. Defaults to PageBackButton's own 'Back'. */
    backLabel?: string
    /** Width cap for the content Container. Defaults to 'xl' for wide, table-heavy pages. */
    size?: ContainerProps['size']
    /** Optional action bar pinned to the bottom of the viewport at all times — e.g. a Save button for a settings form. */
    stickyFooter?: ReactNode
}

export function PageLayout({
                               title,
                               subtitle,
                               action,
                               children,
                               className,
                               onBack,
                               backLabel,
                               size = 'xl',
                               stickyFooter,
                           }: PageLayoutProps) {
    return (
        <div className={cn('space-y-3 mt-3', className)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    {onBack && <PageBackButton onClick={onBack} label={backLabel} className="mb-2"/>}
                    <h1 className="text-2xl font-bold tracking-tight text-(--c-text)">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-(--c-text-muted)">
                            {subtitle}
                        </p>
                    )}
                </div>
                {action && <div className="shrink-0">{action}</div>}
            </div>
            <Container size={size} padded={false}>
                {children}
            </Container>
            {stickyFooter && (
                <>
                    {/* Space reservation only — see the stickyFooter doc comment. */}
                    <div aria-hidden="true" className="invisible border-t px-4 py-6 md:px-6">
                        {stickyFooter}
                    </div>
                    <div
                        className="fixed inset-x-0 bottom-0 z-10 border-t border-(--c-border) bg-admin-sidebar-bg px-4 py-6 shadow-(--c-shadow-sm) md:px-6">
                        {stickyFooter}
                    </div>
                </>
            )}
        </div>
    )
}
