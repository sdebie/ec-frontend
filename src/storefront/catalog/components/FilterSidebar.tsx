import { useState, useEffect, useCallback } from 'react'

interface FilterSidebarProps {
  categories: Array<{ id: string; name: string; slug: string }>
  brands: Array<{ id: string; name: string; slug: string }>
  activeFilters: {
    search: string
    category: string
    brand: string
    sort: string
  }
  setFilter: (key: string, value: string) => void
  onClearAll: () => void
}

function FilterContent({
  categories,
  brands,
  activeFilters,
  setFilter,
  onClearAll,
}: FilterSidebarProps) {
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

      {/* Category Dropdown */}
      <div>
        <label htmlFor="filter-category" className="block text-sm font-medium text-(--sf-text) mb-1">
          Category
        </label>
        <select
          id="filter-category"
          value={activeFilters.category}
          onChange={(e) => setFilter('category', e.target.value)}
          className="w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brand Dropdown */}
      <div>
        <label htmlFor="filter-brand" className="block text-sm font-medium text-(--sf-text) mb-1">
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
      </div>

      {/* Sort Select */}
      <div>
        <label htmlFor="filter-sort" className="block text-sm font-medium text-(--sf-text) mb-1">
          Sort by
        </label>
        <select
          id="filter-sort"
          value={activeFilters.sort}
          onChange={(e) => setFilter('sort', e.target.value)}
          className="w-full rounded-md border border-(--sf-border) px-3 py-2 text-sm focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
        >
          <option value="name">Name A–Z</option>
          <option value="price-asc">Price Low–High</option>
          <option value="price-desc">Price High–Low</option>
        </select>
      </div>

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
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleClose = useCallback(() => {
    setDrawerOpen(false)
  }, [])

  return (
    <>
      {/* Desktop: inline sidebar (visible md+) */}
      <aside className="hidden md:block w-64 shrink-0">
        <FilterContent {...props} />
      </aside>

      {/* Mobile: Filters button + drawer (visible below md) */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-md border border-(--sf-border) bg-(--sf-panel) px-4 py-2 text-sm font-medium text-(--sf-text) hover:bg-(--sf-surface-muted)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
        </button>

        {/* Drawer overlay */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex">
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
                  className="rounded-md p-1 text-(--sf-muted-text) hover:text-(--sf-text)"
                  aria-label="Close filters"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <FilterContent {...props} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
