import type {ReactNode} from 'react'
import {cn} from '@/shared/utils/cn'
import {CONTACT_SECTIONS, type ContactSectionKey} from './contactSections'

interface ContactSectionNavProps {
    active: ContactSectionKey
    onSelect: (key: ContactSectionKey) => void
    /** Only sections with a truthy count show a badge — a "0" pill is noise, not information. */
    counts: Partial<Record<ContactSectionKey, number>>
}

/**
 * Vertical on md+ (a left rail matching the page shell), a horizontally
 * scrollable row below it — same role="tab" semantics as a horizontal Tabs
 * bar, just with aria-orientation="vertical" and its own icon+badge visual,
 * which the shared Tabs primitive has no slot for.
 */
export function ContactSectionNav({active, onSelect, counts}: ContactSectionNavProps) {
    return (
        <nav
            role="tablist"
            aria-orientation="vertical"
            aria-label="Contact settings sections"
            className="flex gap-1 overflow-x-auto pb-2 md:w-56 md:shrink-0 md:flex-col md:overflow-visible md:pb-0"
        >
            {CONTACT_SECTIONS.map(({key, label, icon}) => {
                const isActive = active === key
                const count = counts[key]
                return (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        id={`contact-nav-${key}`}
                        aria-selected={isActive}
                        aria-controls={`contact-panel-${key}`}
                        onClick={() => onSelect(key)}
                        className={cn(
                            'flex shrink-0 items-center gap-3 whitespace-nowrap rounded-(--c-radius) px-3 py-2 text-sm font-medium transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring)',
                            isActive
                                ? 'bg-(--c-accent) text-(--c-accent-text)'
                                : 'text-(--c-text-muted) hover:bg-(--c-surface-hover) hover:text-(--c-text)',
                        )}
                    >
                        <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4" aria-hidden="true">
                            {icon}
                        </span>
                        <span>{label}</span>
                        {!!count && (
                            // aria-hidden: a count must never change the tab's accessible
                            // name (queries and screen readers alike key off the label
                            // alone) — same treatment as the icon span above it.
                            <span
                                aria-hidden="true"
                                className={cn(
                                    'ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium',
                                    isActive
                                        ? 'bg-(--c-accent-text)/20 text-(--c-accent-text)'
                                        : 'bg-(--c-surface-hover) text-(--c-text-muted)',
                                )}
                            >
                                {count}
                            </span>
                        )}
                    </button>
                )
            })}
        </nav>
    )
}

interface ContactSectionPanelProps {
    sectionKey: ContactSectionKey
    active: ContactSectionKey
    children: ReactNode
}

/**
 * `hidden` attribute, not conditional rendering — keeps every section mounted
 * (and its field state/scroll position) across nav switches, same rationale
 * as the shared Tabs.TabContent. Not built on top of Tabs itself: it manages
 * ids via its own internal useId(), which a sibling nav outside its tree has
 * no way to read, and this page needs to set aria-controls/id explicitly.
 */
export function ContactSectionPanel({sectionKey, active, children}: ContactSectionPanelProps) {
    return (
        <div
            role="tabpanel"
            id={`contact-panel-${sectionKey}`}
            aria-labelledby={`contact-nav-${sectionKey}`}
            hidden={sectionKey !== active}
        >
            {children}
        </div>
    )
}
