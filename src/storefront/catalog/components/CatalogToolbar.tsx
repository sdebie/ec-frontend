import type { ReactNode } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import type { SortOption } from '../hooks/useProducts'

interface CatalogToolbarProps {
  /** Number of active filters (search, category, brand, availability — each counting one when active) */
  activeFilterCount: number
  /** Current sort option */
  sort: SortOption
  /** Called when sort changes — updates URL param and resets page */
  onSortChange: (sort: SortOption) => void
  /** Called when the filter button is clicked (opens drawer below md, toggles sidebar on md+) */
  onFilterToggle: () => void
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
  chips,
  viewToggle,
}: CatalogToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3">
      {/* Top row: filter button, sort select, view toggle */}
      <div className="flex items-center gap-3">
        {/* Filter button with active-count badge */}
        <button
          type="button"
          onClick={onFilterToggle}
          className="inline-flex items-center gap-2 rounded-md border border-(--sf-border) bg-(--sf-panel) px-3 py-2 text-sm font-medium text-(--sf-text) hover:bg-(--sf-surface-muted) transition-colors"
          aria-label={
            activeFilterCount > 0
              ? `Filters (${activeFilterCount} active)`
              : 'Filters'
          }
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-(--sf-accent) px-1.5 text-xs font-semibold text-(--sf-accent-text)">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Sort select */}
        <div className="ml-auto flex items-center gap-3">
          <label htmlFor="toolbar-sort" className="sr-only">
            Sort by
          </label>
          <select
            id="toolbar-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="rounded-md border border-(--sf-border) bg-(--sf-panel) px-3 py-2 text-sm text-(--sf-text) focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
          >
            <option value="name">Name A–Z</option>
            <option value="price-asc">Price: low–high</option>
            <option value="price-desc">Price: high–low</option>
          </select>

          {/* View toggle slot (placeholder for task 5.1) */}
          {viewToggle}
        </div>
      </div>

      {/* Chips row */}
      {chips}
    </div>
  )
}
