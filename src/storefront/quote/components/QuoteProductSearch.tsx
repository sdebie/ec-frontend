import { useState, useEffect, useRef } from 'react'
import { Search, Check, ChevronDown, Loader2 } from 'lucide-react'
import { useProducts, type Product } from '@/storefront/catalog/hooks/useProducts'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { getDisplayPrice } from '@/storefront/catalog/utils/pricing'
import { pickFeaturedImage } from '@/storefront/catalog/utils/productImage'
import { formatAmount } from '@/shared/utils/formatAmount'
import { useQuoteStore } from '../quoteStore'
import { QuoteVariantPicker } from './QuoteVariantPicker'

/**
 * QuoteProductSearch — inline product search for the quote request page.
 *
 * Uses a debounced input to drive `useProducts({ search, enabled })`.
 * Each result row shows: product name, variant label, price via getDisplayPrice,
 * image via resolveImageUrl (through pickFeaturedImage). Selecting a variant
 * calls quoteStore.addItem and marks the row as added.
 * Explicit empty-result message when search yields no results.
 */
export function QuoteProductSearch() {
  const [term, setTerm] = useState('')
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Clicking anywhere outside the search panel clears the term and closes the
  // results — standard dropdown dismissal.
  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (!containerRef.current || containerRef.current.contains(e.target as Node)) {
        return
      }
      setTerm('')
      setDebouncedTerm('')
      setExpandedSlug(null)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const customerType = useCustomerAuthStore((s) => s.customerType)
  const { currency, locale } = useStorefrontConfig()
  const addItem = useQuoteStore((s) => s.addItem)
  const quoteItems = useQuoteStore((s) => s.items)

  // Debounce input — 400ms
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setDebouncedTerm(term.trim())
    }, 400)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [term])

  const { products, isLoading } = useProducts({
    search: debouncedTerm,
    enabled: debouncedTerm.length > 0,
  })

  const hasSearched = debouncedTerm.length > 0
  const showEmpty = hasSearched && !isLoading && products.length === 0
  const showResults = hasSearched && products.length > 0

  function isAdded(variantId: string | null): boolean {
    if (!variantId) return false
    return quoteItems.some((item) => item.variantId === variantId)
  }

  function handleSelect(product: Product) {
    // Multi-variant products carry no variantId on the shopping list row —
    // expand the inline variant picker instead of adding directly.
    if (!product.variantId) {
      setExpandedSlug((prev) => (prev === product.slug ? null : product.slug))
      return
    }
    if (isAdded(product.variantId)) return
    addItem({
      variantId: product.variantId,
      productName: product.name,
      variantLabel: product.shortDescription || product.name,
      quantity: 1,
      imageUrl: pickFeaturedImage(product.images),
    })
  }

  const dropdownOpen = hasSearched && ((isLoading ?? false) || showEmpty || showResults)

  return (
    <div ref={containerRef} className="relative rounded-lg border border-(--sf-border) bg-(--sf-panel) p-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--sf-muted-text)" aria-hidden="true" />
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search products to add..."
          className="w-full rounded-md border border-(--sf-border) bg-(--sf-panel) py-2 pl-9 pr-3 text-sm text-(--sf-text) placeholder:text-(--sf-muted-text) focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring)"
          aria-label="Search products"
        />
      </div>

      {/* Results dropdown — overlays the content below instead of pushing it down */}
      {dropdownOpen && (
      <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-(--sf-border) bg-(--sf-panel) shadow-lg">

      {/* Loading state */}
      {isLoading && hasSearched && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-(--sf-muted-text)">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>Searching products...</span>
        </div>
      )}

      {/* Empty result message */}
      {showEmpty && (
        <p className="py-6 text-center text-sm text-(--sf-muted-text)">
          No products found for &ldquo;{debouncedTerm}&rdquo;
        </p>
      )}

      {/* Results list — capped viewport, scrolls internally */}
      {showResults && (
        <ul className="max-h-72 divide-y divide-(--sf-border) overflow-y-auto" role="listbox" aria-label="Search results">
          {products.map((product) => {
            const imageUrl = pickFeaturedImage(product.images)
            const { price, originalPrice } = getDisplayPrice(
              {
                retailPrice: product.retailPrice?.price ?? null,
                wholesalePrice: product.wholesalePrice?.price ?? null,
                retailSalePrice: product.retailSalePrice?.price ?? null,
                wholesaleSalePrice: product.wholesaleSalePrice?.price ?? null,
              },
              customerType,
            )
            const added = isAdded(product.variantId)
            const multiVariant = !product.variantId
            const expanded = expandedSlug === product.slug

            return (
              <li key={product.variantId ?? product.id} role="option" aria-selected={added}>
                <button
                  type="button"
                  onClick={() => handleSelect(product)}
                  disabled={added}
                  aria-expanded={multiVariant ? expanded : undefined}
                  className="flex w-full items-center gap-3 px-2 py-3 text-left transition-colors hover:bg-(--sf-surface-muted) disabled:cursor-default disabled:opacity-100"
                >
                  {/* Product image */}
                  <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-(--sf-surface-muted)">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-(--sf-muted-text)">
                        <Search className="h-4 w-4" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-(--sf-text)">
                      {product.name}
                    </p>
                    {product.shortDescription && (
                      <p className="truncate text-xs text-(--sf-muted-text)">
                        {product.shortDescription}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex-shrink-0 text-right">
                    {originalPrice != null && (
                      <span className="block text-xs line-through text-(--sf-muted-text)">
                        {formatAmount(originalPrice, currency, locale)}
                      </span>
                    )}
                    <span className="text-sm font-medium text-(--sf-text)">
                      {formatAmount(price, currency, locale)}
                    </span>
                  </div>

                  {/* Added indicator */}
                  {added && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-(--sf-accent)/10 px-2 py-0.5 text-xs font-medium text-(--sf-accent)">
                      <Check className="h-3 w-3" aria-hidden="true" />
                      Added
                    </span>
                  )}

                  {/* Multi-variant affordance */}
                  {multiVariant && (
                    <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-(--sf-muted-text)">
                      Options
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </button>

                {/* Inline variant picker for multi-variant products */}
                {multiVariant && expanded && (
                  <QuoteVariantPicker
                    slug={product.slug}
                    productName={product.name}
                    imageUrl={imageUrl}
                  />
                )}
              </li>
            )
          })}
        </ul>
      )}
      </div>
      )}
    </div>
  )
}
