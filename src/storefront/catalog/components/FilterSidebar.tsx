import {useEffect, useState} from 'react'
import {ChevronRight, X} from 'lucide-react'
import {Select} from '@/shared/ui/components/form/Select'
import {BrandPickerSheet} from './BrandPickerSheet'
import {CategoryTreeFilter} from './CategoryTreeFilter'
import {FilterGroup} from './FilterGroup'
import {AvailabilityFilter} from './AvailabilityFilter'

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
    const [brandPickerOpen, setBrandPickerOpen] = useState(false)

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
                <CategoryTreeFilter activeSlug={activeFilters.category} setFilter={setFilter}/>
            </FilterGroup>

            {/* Brand Dropdown */}
            <FilterGroup title="Brand" defaultOpen={false} isActive={!!activeFilters.brand}>
                {/* Desktop/tablet: shared form-layer Select */}
                <div className="hidden md:block">
                    <Select
                        ariaLabel="Brand"
                        options={[
                            {value: '', label: 'All Brands'},
                            ...brands.map((brand) => ({value: brand.slug, label: brand.name})),
                        ]}
                        value={activeFilters.brand}
                        onChange={(value) => setFilter('brand', value)}
                    />
                </div>

                {/* Mobile: a dropdown listbox is cramped inside the drawer — open the
            dedicated full-screen brand picker sheet instead */}
                <button
                    type="button"
                    onClick={() => setBrandPickerOpen(true)}
                    aria-haspopup="dialog"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-(--sf-border) bg-(--sf-panel) px-3 py-2 text-sm text-(--sf-text) md:hidden"
                >
          <span className="truncate">
            {brands.find((b) => b.slug === activeFilters.brand)?.name ?? 'All Brands'}
          </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-(--sf-muted-text)" aria-hidden="true"/>
                </button>
                {brandPickerOpen && (
                    <BrandPickerSheet
                        brands={brands}
                        activeSlug={activeFilters.brand}
                        onSelect={(slug) => setFilter('brand', slug)}
                        onClose={() => setBrandPickerOpen(false)}
                    />
                )}
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
    const {drawerOpen = false, onDrawerClose, sidebarVisible = true} = props
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
                <aside
                    className="hidden md:block w-64 shrink-0 self-start rounded-lg border border-(--sf-border) bg-(--sf-panel) p-4">
                    <FilterContent {...filterContentProps} />
                </aside>
            )}

            {/* Mobile: Drawer (controlled by toolbar's filter button).
          Structure: compact header (title + X) / single scrollable filter body /
          sticky footer with the primary "View results" action — so the CTA never
          scrolls away and the header stays short. */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    {/* Backdrop — dark enough that the catalogue behind stops competing */}
                    <div
                        className="fixed inset-0 bg-black/60"
                        onClick={handleClose}
                        aria-hidden="true"
                    />

                    {/* Drawer panel — ~88% of the viewport width */}
                    <div className="relative ml-auto flex h-full w-[88%] max-w-sm flex-col bg-(--sf-panel) shadow-xl">
                        {/* Compact header */}
                        <div className="flex items-center justify-between border-b border-(--sf-border) px-4 py-3">
                            <h2 className="text-base font-semibold text-(--sf-text)">Filters</h2>
                            <button
                                type="button"
                                onClick={handleClose}
                                aria-label="Close filters"
                                className="rounded-md p-1.5 text-(--sf-muted-text) hover:bg-(--sf-surface-muted) hover:text-(--sf-text) transition-colors"
                            >
                                <X className="h-5 w-5" aria-hidden="true"/>
                            </button>
                        </div>

                        {/* Scrollable filter body — the only scroll container in the drawer */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <FilterContent {...filterContentProps} />
                        </div>

                        {/* Sticky footer — primary action always visible */}
                        <div className="border-t border-(--sf-border) p-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="w-full rounded-lg bg-(--sf-accent) px-4 py-2.5 text-sm font-semibold text-(--sf-accent-text) hover:opacity-90 transition-opacity"
                            >
                                View results
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
