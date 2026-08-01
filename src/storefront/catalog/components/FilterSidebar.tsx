import { useState, useEffect } from 'react'
import { CategoryTreeFilter } from './CategoryTreeFilter'
import { FilterGroup } from './FilterGroup'
import { AvailabilityFilter } from './AvailabilityFilter'

interface FilterSidebarProps {
  brands: Array<{ id: string; name: string; slug: string }>
  activeFilters: {
    search: string
    category: string
    brand: string
    available?: boolean
  }
  setFilter: (key: string, value: string) => void
  onClearAll: () => void
  /** Controlled drawer state (mobile) — driven by CatalogToolbar's filter button */
  drawerOpen?: boolean
  /** Callback to close the drawer */
  onDrawerClose?: () => void
  /** Controls desktop sidebar visibility (toggled by toolbar filter button on md+) */
  sidebarVisible?: boolean
}

function FilterContent({
  brands,
  activeFilters,
  setFilter,
  onClearAll,
}: Omit<FilterSidebarProps, 'drawerOpen' | 'onDrawerClose'>) {
  const [searchValue, setSearchValue] = useState(activeFilters.search)
  const [debouncedValue, setDebouncedValue] = useState(activeFilters.search)

  // Keep local value in sync with external changes (e.g. "Clear all filters")
  const externalSearch = activeFilters.search
  if (debouncedValue !== externalSearch && searchValue !== externalSearch) {
    setSearchValue(externalSearch)
    setDebouncedValue(externalSearch)
  }

  // Debounce search input — 350ms delay before firing filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(searchValue)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchValue])

  // Fire the setFilter callback when the debounced value settles
  useEffect(() => {
    if (debouncedValue !== activeFilters.search) {
      setFilter('search', debouncedValue)
    }
  }, [debouncedValue, activeFilters.search, setFilter])

  return (
    <div className="flex flex-col gap-5">
      {/* Search Input */}
      <div>
        <label htmlFor="filter-search" className="block text-sm font-medium text-(--sf-text) mb-1">
          Search
        </label>
        <input
          id="filter-search"
          type="text"
          placeholder="Search products..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm placeholder-(--sf-muted-text) focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
        />
      </div>

      {/* Category Tree */}
      <FilterGroup title="Category" defaultOpen isActive={!!activeFilters.category}>
        <CategoryTreeFilter activeSlug={activeFilters.category} setFilter={setFilter} />
      </FilterGroup>

      {/* Brand Dropdown */}
      <FilterGroup title="Brand" defaultOpen={false} isActive={!!activeFilters.brand}>
        <label htmlFor="filter-brand" className="sr-only">
          Brand
        </label>
        <select
          id="filter-brand"
          value={activeFilters.brand}
          onChange={(e) => setFilter('brand', e.target.value)}
          className="w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </select>
      </FilterGroup>

      {/* Availability */}
      <FilterGroup title="Availability" defaultOpen={false} isActive={!!activeFilters.available}>
        <AvailabilityFilter
          checked={!!activeFilters.available}
          onChange={(checked) => setFilter('available', checked ? '1' : '')}
        />
      </FilterGroup>

      {/* Clear All Filters */}
      <button
        type="button"
        onClick={onClearAll}
        className="mt-2 w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm font-medium text-(--sf-text) hover:bg-(--sf-surface-muted) transition-colors"
      >
        Clear all filters
      </button>
    </div>
  )
}

export function FilterSidebar(props: FilterSidebarProps) {
  const { drawerOpen = false, onDrawerClose, sidebarVisible = true } = props
  const filterContentProps = {
    brands: props.brands,
    activeFilters: props.activeFilters,
    setFilter: props.setFilter,
    onClearAll: props.onClearAll,
  }

  const handleClose = () => {
    onDrawerClose?.()
  }

  return (
    <>
      {/* Desktop: inline sidebar (visible md+ when sidebarVisible is true) */}
      {sidebarVisible && (
        <aside className="hidden md:block w-64 shrink-0">
          <FilterContent {...filterContentProps} />
        </aside>
      )}

      {/* Mobile: Drawer (controlled by toolbar's filter button) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-(--sf-panel) p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-(--sf-text)">Filters</h2>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-(--sf-accent) hover:text-(--sf-accent)/80 transition-colors"
              >
                View results
              </button>
            </div>

            <FilterContent {...filterContentProps} />
          </div>
        </div>
      )}
    </>
  )
}
