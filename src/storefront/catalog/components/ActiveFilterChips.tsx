interface ActiveFilterChipsProps {
  search: string
  categoryName: string | null
  brandName: string | null
  available?: boolean
  onClearSearch: () => void
  onClearCategory: () => void
  onClearBrand: () => void
  onClearAvailability?: () => void
}

export function ActiveFilterChips({
  search,
  categoryName,
  brandName,
  available,
  onClearSearch,
  onClearCategory,
  onClearBrand,
  onClearAvailability,
}: ActiveFilterChipsProps) {
  const hasFilters = search.length > 0 || categoryName != null || brandName != null || !!available

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
      {available && onClearAvailability && (
        <FilterChip label="In stock" onClear={onClearAvailability} />
      )}
    </div>
  )
}

function FilterChip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-(--sf-surface-muted) px-3 py-1 text-sm text-(--sf-text)">
      {label}
      <button
        type="button"
        onClick={onClear}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-(--sf-muted-text) hover:bg-(--sf-surface-muted) hover:text-(--sf-text)"
        aria-label={`Remove ${label} filter`}
      >
        ×
      </button>
    </span>
  )
}
