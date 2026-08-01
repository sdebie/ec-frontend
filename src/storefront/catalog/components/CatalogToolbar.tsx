import type {ReactNode} from 'react'
import {SlidersHorizontal} from 'lucide-react'
import {Select} from '@/shared/ui/components/form/Select'
import type {SortOption} from '../hooks/useProducts'

const SORT_OPTIONS = [
    {value: 'name', label: 'Name A–Z'},
    {value: 'price-asc', label: 'Price: low–high'},
    {value: 'price-desc', label: 'Price: high–low'},
]

interface CatalogToolbarProps {
    /** Number of active filters (search, category, brand, availability — each counting one when active) */
    activeFilterCount: number
    /** Current sort option */
    sort: SortOption
    /** Called when sort changes — updates URL param and resets page */
    onSortChange: (sort: SortOption) => void
    /** Called when the filter button is clicked (opens drawer below md, toggles sidebar on md+) */
    onFilterToggle: () => void
    /** Called by the toolbar "Clear all" button; rendered only while filters are active */
    onClearAll?: () => void
    /** Slot for ActiveFilterChips */
    chips?: ReactNode
    /** Slot for view toggle (task 5.1) */
    viewToggle?: ReactNode
}

export function CatalogToolbar({
                                   activeFilterCount,
                                   sort,
                                   onSortChange,
                                   onFilterToggle,
                                   onClearAll,
                                   chips,
                                   viewToggle,
                               }: CatalogToolbarProps) {
    // Desktop: one wrapping row — Filters, chips + Clear all beside it, sort + view toggle right.
    // Mobile: Filters + Clear all share the first line, sort row stacks below.
    // The bottom border is the thin divider separating the control strip from the grid.
    return (
        <div className="mb-5 flex flex-col gap-3 border-b border-(--sf-border) pb-4 sm:flex-row sm:flex-wrap sm:items-center">
            {/* Mobile line 1: Filters button + Clear all; dissolves into the desktop row */}
            {/* Mobile line 2 (order-2 puts it below the sort row); dissolves into the desktop row */}
            <div className="order-2 flex items-center justify-between gap-3 sm:order-none sm:contents">
                <button
                    type="button"
                    onClick={onFilterToggle}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-(--sf-border) bg-(--sf-panel) px-3 py-2 text-sm font-medium text-(--sf-text) hover:bg-(--sf-surface-muted) transition-colors sm:flex-none sm:justify-start"
                    aria-label={
                        activeFilterCount > 0
                            ? `Filters (${activeFilterCount} active)`
                            : 'Filters'
                    }
                >
                    <SlidersHorizontal className="h-4 w-4" aria-hidden="true"/>
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span
                            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-(--sf-accent) px-1.5 text-xs font-semibold text-(--sf-accent-text)">
                  {activeFilterCount}
                </span>
                    )}
                </button>

                {/* Mobile-only Clear all, sharing the Filters line */}
                {activeFilterCount > 0 && onClearAll && (
                    <button
                        type="button"
                        onClick={onClearAll}
                        className="text-sm font-medium text-(--sf-accent) hover:underline sm:hidden"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Desktop: chips + Clear all flow beside the Filters button (hidden on
                mobile — the Filters badge already carries the count) */}
            {activeFilterCount > 0 && (
                <div className="hidden sm:flex flex-wrap items-center gap-3">
                    {chips}
                    {onClearAll && (
                        <button
                            type="button"
                            onClick={onClearAll}
                            className="text-sm font-medium text-(--sf-accent) hover:underline"
                        >
                            Clear all
                        </button>
                    )}
                </div>
            )}

            {/* Sort select — shared form-layer Select so every storefront dropdown
            shares one styled control (native <select> option lists are
            OS-rendered and can never match the design system) */}
            {/* Sort row — mobile: label left, dropdown fills the remaining width,
                view toggle pinned right at its fixed width; desktop: compact row
                pushed to the right edge */}
            <div className="order-1 flex items-center gap-2 sm:order-none sm:ml-auto">
          <span className="shrink-0 text-sm text-(--sf-muted-text)" aria-hidden="true">
            Sort by
          </span>
                <Select
                    ariaLabel="Sort by"
                    options={SORT_OPTIONS}
                    value={sort}
                    onChange={(value) => onSortChange(value as SortOption)}
                    fullWidth={false}
                    className="min-w-0 flex-1 sm:flex-none sm:w-44"
                />

                {/* View toggle slot (task 5.1) */}
                <div className="shrink-0">{viewToggle}</div>
            </div>
        </div>
    )
}
