import { useEffect, useState } from 'react'
import { ArrowLeft, Check, X } from 'lucide-react'

interface BrandPickerSheetProps {
  brands: Array<{ id: string; name: string; slug: string }>
  /** Currently selected brand slug ('' = all brands) */
  activeSlug: string
  /** Live-apply: selecting a brand filters immediately (standing owner decision) */
  onSelect: (slug: string) => void
  onClose: () => void
}

/**
 * Mobile-only full-screen brand picker (owner adjustment 2026-08-01) — replaces
 * the dropdown inside the filter drawer, where a portal listbox is cramped.
 * Desktop keeps the shared form-layer Select.
 *
 * z-[100] deliberately clears the filter drawer (z-50) and any floating
 * chat/support widget so nothing bleeds through the active sheet.
 */
export function BrandPickerSheet({ brands, activeSlug, onSelect, onClose }: BrandPickerSheetProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const normalizedQuery = query.trim().toLowerCase()
  const visibleBrands = normalizedQuery
    ? brands.filter((brand) => brand.name.toLowerCase().includes(normalizedQuery))
    : brands

  function renderRow(slug: string, label: string) {
    const isSelected = activeSlug === slug
    return (
      <button
        key={slug || 'all-brands'}
        type="button"
        onClick={() => onSelect(slug)}
        aria-pressed={isSelected}
        className={`flex min-h-12 w-full items-center justify-between gap-3 border-b border-(--sf-border)/60 px-4 text-left text-sm transition-colors hover:bg-(--sf-surface-muted) ${
          isSelected ? 'font-semibold text-(--sf-accent)' : 'text-(--sf-text)'
        }`}
      >
        <span className="truncate">{label}</span>
        {isSelected && <Check className="h-5 w-5 shrink-0 text-(--sf-accent)" aria-hidden="true" />}
      </button>
    )
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Brands"
      className="fixed inset-0 z-[100] flex flex-col bg-(--sf-panel) md:hidden"
    >
      {/* Sticky top bar */}
      <div className="flex items-center justify-between border-b border-(--sf-border) px-2 py-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-base font-semibold text-(--sf-text) hover:bg-(--sf-surface-muted) transition-colors"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          Brands
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close brand picker"
          className="rounded-md p-1.5 text-(--sf-muted-text) hover:bg-(--sf-surface-muted) hover:text-(--sf-text) transition-colors"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Brand search */}
      <div className="border-b border-(--sf-border) p-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brands…"
          aria-label="Search brands"
          className="w-full rounded-md border border-(--sf-border) px-3 py-2.5 text-sm placeholder-(--sf-muted-text) focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
        />
      </div>

      {/* Scrollable single-column list — 48px+ tap targets */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {!normalizedQuery && renderRow('', 'All Brands')}
        {visibleBrands.map((brand) => renderRow(brand.slug, brand.name))}
        {visibleBrands.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-(--sf-muted-text)">
            No brands match your search.
          </p>
        )}
      </div>

      {/* Sticky bottom action — filters are live-apply, so this closes the sheet */}
      <div className="border-t border-(--sf-border) p-4">
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-(--sf-accent) px-4 py-2.5 text-sm font-semibold text-(--sf-accent-text) hover:opacity-90 transition-opacity"
        >
          Show results
        </button>
      </div>
    </div>
  )
}
