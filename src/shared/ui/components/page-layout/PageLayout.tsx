import type {ReactNode} from 'react'
import {cn} from '@/shared/utils/cn'
import {Container, type ContainerProps} from '@/shared/ui/primitives'
import {usePageBackAction} from '@/admin/context/PageBackActionContext'

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
    /** When provided, registers a back button in the admin header (see PageBackActionContext). */
    onBack?: () => void
    /** Custom label for the back button. Defaults to PageBackButton's own 'Back'. */
    backLabel?: string
    /** Width cap for the content Container. Defaults to 'xl' for wide, table-heavy pages. */
    size?: ContainerProps['size']
    /** Optional action bar pinned to the bottom of the page's own scroll region — e.g. a Save button for a settings form. */
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
    usePageBackAction(onBack, backLabel)

    return (
        // pb-4/md:pb-6 only when there's no stickyFooter: `main` (the scrolling ancestor)
        // carries none of its own, since a sticky element's `bottom:0` is inset by ITS
        // scrolling ancestor's padding — trailing padding here, after the footer, would
        // reproduce the same gap one level up. Pages without a footer still get the
        // breathing room; the footer, when present, is the true last thing in the flow.
        <div className={cn('space-y-3 mt-3', !stickyFooter && 'pb-4 md:pb-6', className)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                {action && <div className="shrink-0">{action}</div>}
            </div>
            <Container size={size} padded={false}>
                {children}
            </Container>
            {stickyFooter && (
                // The bar cancels main's own px-4/md:px-6 with matching negative margins so
                // its background/border-t reach the true edges of the content column (flush
                // against the sidebar on the left, the viewport edge on the right) — not just
                // the padded area main's own content sits in. The inner wrapper reapplies that
                // same px-4/md:px-6 so the footer's content still lines up with page content.
                <div className="sticky bottom-0 z-10 -mx-4 border-t border-(--c-border) bg-admin-sidebar-bg shadow-(--c-shadow-sm) md:-mx-6">
                    <div className="px-4 py-6 md:px-6">
                        {stickyFooter}
                    </div>
                </div>
            )}
        </div>
    )
}
