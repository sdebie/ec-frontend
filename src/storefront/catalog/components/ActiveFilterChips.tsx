interface ActiveFilterChipsProps {
  search: string
  categoryName: string | null
  brandName: string | null
  onClearSearch: () => void
  onClearCategory: () => void
  onClearBrand: () => void
}

export function ActiveFilterChips({
  search,
  categoryName,
  brandName,
  onClearSearch,
  onClearCategory,
  onClearBrand,
}: ActiveFilterChipsProps) {
  const hasFilters = search.length > 0 || categoryName != null || brandName != null

  if (!hasFilters) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {search.length > 0 && (
        <FilterChip label={`Search: ${search}`} onClear={onClearSearch} />
      )}
      {categoryName != null && (
        <FilterChip label={`Category: ${categoryName}`} onClear={onClearCategory} />
      )}
      {brandName != null && (
        <FilterChip label={`Brand: ${brandName}`} onClear={onClearBrand} />
      )}
    </div>
  )
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
      {label}
      <button
        type="button"
        onClick={onClear}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600"
        aria-label={`Remove ${label} filter`}
      >
        ×
      </button>
    </span>
  )
}
