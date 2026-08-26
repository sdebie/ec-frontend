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
    /**
     * Optional action bar pinned to the bottom of the viewport at all times
     * — e.g. a Save button for a settings form, so it's always reachable
     * without scrolling. Caller supplies the fully-formed content (buttons,
     * alignment) exactly as with `action`; this just handles the fixed
     * positioning and chrome (full-bleed border/background/shadow).
     *
     * `position: fixed`, not `sticky` — two earlier passes tried `sticky`
     * and each satisfied only one of two requirements that both turned out
     * to matter: forcing the page to at least one viewport tall (so sticky
     * had room to reach the bottom) left a dead band of empty background
     * between real content and the footer on short pages; leaving height
     * natural (so the page never scrolls more than its content needs) left
     * the footer sitting short of the bottom on those same pages, instead of
     * flush against it. `position: fixed` resolves both at once: it sits
     * outside normal document flow entirely, so it never affects
     * `scrollHeight` (the page still only ever scrolls as much as its real
     * content requires) while always rendering flush against the true
     * bottom of the viewport regardless of content length.
     *
     * Spans the full viewport width (`inset-x-0`), including underneath
     * `AdminSidebar` — deliberately, not a bug: the sidebar is `fixed` with
     * `z-50` and an opaque background (its mobile backdrop is `z-40`), and
     * this renders at `z-10`, well under both, so the sidebar's own already-
     * correct width/collapse/mobile-drawer handling covers the overlapping
     * portion for free. No sidebar-width bookkeeping needed here at all.
     *
     * Because a fixed element leaves no space in normal flow, an invisible
     * spacer carrying the identical content is rendered right where the
     * footer would otherwise sit — without it, real content would render
     * hidden underneath the fixed bar. It mirrors `stickyFooter` itself
     * rather than guessing a fixed pixel height, so it always matches
     * exactly regardless of how tall the caller's own content is.
     * `visibility:hidden`, not `display:none`, so it still occupies space —
     * and is why the duplicated content never causes `getByRole` etc. to see
     * two matching elements, since assistive-tech queries exclude
     * `visibility:hidden` subtrees by default.
     */
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
                        className="fixed inset-x-0 bottom-0 z-10 border-t border-(--c-border) bg-(--c-bg) px-4 py-6 shadow-(--c-shadow-sm) md:px-6">
                        {stickyFooter}
                    </div>
                </>
            )}
        </div>
    )
}
