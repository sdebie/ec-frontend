import {type KeyboardEvent, type ReactNode, useId, useRef, useState} from 'react'
import {CircleAlert, CircleCheck, Menu} from 'lucide-react'
import {cn} from '@/shared/utils/cn'
import {Drawer, DrawerContent, DrawerHeader} from '../drawer/Drawer'

export interface SectionTabItem {
    id: string
    label: string
    description?: string
    icon?: ReactNode
    content: ReactNode
    disabled?: boolean
    status?: 'default' | 'error' | 'complete'
    badge?: string | number
}

export interface SectionTabsProps {
    sections: SectionTabItem[]
    activeSectionId: string
    onActiveSectionChange: (id: string) => void
    /** Optional slot above the workspace body (left side of the header bar). */
    header?: ReactNode
    /** Optional contextual actions (right side of the header bar). */
    actions?: ReactNode
    /** Optional slot below the workspace body — typically the flow's buttons. */
    footer?: ReactNode
    className?: string
}

/**
 * Status is conveyed by an icon plus screen-reader text, never colour alone.
 */
function SectionStatusIndicator({status}: { status: SectionTabItem['status'] }) {
    if (status === 'error') {
        return (
            <span className="ml-auto text-(--c-error)">
                <CircleAlert className="h-4 w-4" aria-hidden="true"/>
                <span className="sr-only">has errors</span>
            </span>
        )
    }
    if (status === 'complete') {
        return (
            <span className="ml-auto text-(--c-success)">
                <CircleCheck className="h-4 w-4" aria-hidden="true"/>
                <span className="sr-only">complete</span>
            </span>
        )
    }
    return null
}

function SectionBadge({badge}: { badge: SectionTabItem['badge'] }) {
    if (badge === undefined || badge === '') return null
    return (
        <span
            className="ml-auto rounded-full bg-(--c-surface-hover) px-2 py-0.5 text-xs font-medium text-(--c-text-muted)">
            {badge}
        </span>
    )
}

/**
 * Generic sectioned edit-flow shell: a device-aware navigation menu of
 * sections beside a single active content panel, with optional header,
 * contextual-action and footer slots.
 *
 * Deliberately owns NO form state, validation, saving or unsaved-change
 * logic — the consuming feature keeps those and drives this component via
 * `activeSectionId` / `onActiveSectionChange`.
 *
 * Every section panel stays mounted (inactive ones go invisible, not
 * unmounted) so consumer state living in the DOM — registered form fields,
 * scroll positions, uncontrolled inputs — survives section switches.
 *
 * Colours use --c-* tokens only, so it themes on any surface that scopes
 * the admin token set.
 */
export function SectionTabs({
                                sections,
                                activeSectionId,
                                onActiveSectionChange,
                                header,
                                actions,
                                footer,
                                className,
                            }: SectionTabsProps) {
    const idPrefix = useId()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const tabRefs = useRef(new Map<string, HTMLButtonElement>())

    const activeSection = sections.find((section) => section.id === activeSectionId)
    const tabId = (sectionId: string) => `${idPrefix}-tab-${sectionId}`
    const panelId = (sectionId: string) => `${idPrefix}-panel-${sectionId}`

    const selectSection = (section: SectionTabItem) => {
        if (section.disabled) return
        onActiveSectionChange(section.id)
    }

    // Roving focus with automatic activation; disabled sections are skipped.
    const handleTabListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const enabled = sections.filter((section) => !section.disabled)
        if (enabled.length === 0) return

        const currentIndex = enabled.findIndex((section) => section.id === activeSectionId)
        let nextIndex: number
        switch (event.key) {
            case 'ArrowDown':
                nextIndex = (currentIndex + 1) % enabled.length
                break
            case 'ArrowUp':
                nextIndex = (currentIndex - 1 + enabled.length) % enabled.length
                break
            case 'Home':
                nextIndex = 0
                break
            case 'End':
                nextIndex = enabled.length - 1
                break
            default:
                return
        }
        event.preventDefault()
        const next = enabled[nextIndex]
        onActiveSectionChange(next.id)
        tabRefs.current.get(next.id)?.focus()
    }

    return (
        <div
            className={cn(
                'flex flex-col overflow-hidden rounded-xl border border-(--c-border) bg-(--c-panel)',
                className,
            )}
        >
            {(header || actions) && (
                <div className="flex items-center justify-between gap-4 border-b border-(--c-border) p-4 sm:px-6">
                    <div className="min-w-0">{header}</div>
                    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
                </div>
            )}

            <div className="flex flex-1 flex-col md:flex-row">
                <div
                    role="tablist"
                    aria-label="Sections"
                    aria-orientation="vertical"
                    onKeyDown={handleTabListKeyDown}
                    className="hidden w-64 shrink-0 flex-col gap-1 border-r border-(--c-border) p-6 md:flex"
                >
                    {sections.map((section) => {
                        const isActive = section.id === activeSectionId
                        return (
                            <button
                                key={section.id}
                                ref={(el) => {
                                    if (el) tabRefs.current.set(section.id, el)
                                    else tabRefs.current.delete(section.id)
                                }}
                                type="button"
                                role="tab"
                                id={tabId(section.id)}
                                aria-selected={isActive}
                                aria-controls={panelId(section.id)}
                                disabled={section.disabled}
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => selectSection(section)}
                                className={cn(
                                    // Active treatment matches the admin sidebar's item language
                                    // (subtle tint, primary text), not a solid accent fill.
                                    'w-full rounded-[var(--c-radius)] px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring)',
                                    isActive
                                        ? 'bg-primary-subtle font-semibold text-primary'
                                        : 'text-(--c-text-muted) hover:bg-(--c-surface-hover) hover:text-(--c-text)',
                                    section.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-(--c-text-muted)',
                                )}
                            >
                                <span className="flex items-center gap-3">
                                    {section.icon && (
                                        <span
                                            className="flex h-5 w-5 shrink-0 items-center justify-center [&_svg]:h-5 [&_svg]:w-5"
                                            aria-hidden="true"
                                        >
                                            {section.icon}
                                        </span>
                                    )}
                                    <span className="truncate">{section.label}</span>
                                    <SectionStatusIndicator status={section.status}/>
                                    {section.status !== 'error' && section.status !== 'complete' && (
                                        <SectionBadge badge={section.badge}/>
                                    )}
                                </span>
                                {section.description && (
                                    <span className="mt-0.5 block truncate text-xs font-normal text-(--c-text-muted)">
                                        {section.description}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>

                <div className="border-b border-(--c-border) p-4 md:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-expanded={mobileMenuOpen}
                        aria-label="Open section menu"
                        className="inline-flex w-full items-center gap-2 rounded-md border border-(--c-border) px-3 py-2 text-sm font-medium text-(--c-text) hover:bg-(--c-surface-hover)"
                    >
                        <Menu className="h-4 w-4 shrink-0" aria-hidden="true"/>
                        <span className="truncate">{activeSection?.label ?? 'Sections'}</span>
                        {activeSection?.status === 'error' && (
                            <span className="ml-auto text-(--c-error)">
                                <CircleAlert className="h-4 w-4" aria-hidden="true"/>
                                <span className="sr-only">has errors</span>
                            </span>
                        )}
                    </button>
                </div>

                {/* All panels stack in ONE grid cell, and inactive ones hide via
                    visibility rather than display — they still occupy layout, so
                    the workspace body always sizes to the TALLEST section and
                    never resizes when switching. `inert` + aria-hidden keep the
                    invisible panels non-interactive and out of the a11y tree. */}
                <div className="grid min-w-0 flex-1">
                    {sections.map((section) => {
                        const isActive = section.id === activeSectionId
                        return (
                            <div
                                key={section.id}
                                role="tabpanel"
                                id={panelId(section.id)}
                                aria-labelledby={tabId(section.id)}
                                aria-hidden={!isActive || undefined}
                                inert={!isActive || undefined}
                                className={cn('[grid-area:1/1] min-w-0 p-6 sm:p-8', !isActive && 'invisible')}
                            >
                                <div className="mb-5">
                                    <h3 className="text-base font-semibold text-(--c-text)">{section.label}</h3>
                                    {section.description && (
                                        <p className="mt-0.5 text-sm text-(--c-text-muted)">{section.description}</p>
                                    )}
                                </div>
                                {section.content}
                            </div>
                        )
                    })}
                </div>
            </div>

            {footer && (
                <div className="border-t border-(--c-border) p-4 sm:px-6">
                    {footer}
                </div>
            )}

            <Drawer
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                position="left"
                size="sm"
                className="md:hidden"
            >
                <DrawerHeader title="Sections"/>
                <DrawerContent className="p-4">
                    <ul className="flex flex-col gap-1">
                        {sections.map((section) => {
                            const isActive = section.id === activeSectionId
                            return (
                                <li key={section.id}>
                                    <button
                                        type="button"
                                        disabled={section.disabled}
                                        aria-current={isActive ? 'true' : undefined}
                                        onClick={() => {
                                            selectSection(section)
                                            if (!section.disabled) setMobileMenuOpen(false)
                                        }}
                                        className={cn(
                                            'flex w-full items-center gap-3 rounded-[var(--c-radius)] px-3 py-2 text-left text-sm transition-colors',
                                            isActive
                                                ? 'bg-primary-subtle font-semibold text-primary'
                                                : 'text-(--c-text-muted) hover:bg-(--c-surface-hover) hover:text-(--c-text)',
                                            section.disabled && 'cursor-not-allowed opacity-50',
                                        )}
                                    >
                                        {section.icon && (
                                            <span
                                                className="flex h-5 w-5 shrink-0 items-center justify-center [&_svg]:h-5 [&_svg]:w-5"
                                                aria-hidden="true"
                                            >
                                                {section.icon}
                                            </span>
                                        )}
                                        <span className="truncate">{section.label}</span>
                                        <SectionStatusIndicator status={section.status}/>
                                        {section.status !== 'error' && section.status !== 'complete' && (
                                            <SectionBadge badge={section.badge}/>
                                        )}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </DrawerContent>
            </Drawer>
        </div>
    )
}
