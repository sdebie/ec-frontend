import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCategories } from './hooks/useCategories'
import { useBrands } from './hooks/useBrands'
import { useProducts, type SortOption } from './hooks/useProducts'
import { ProductGrid } from './components/ProductGrid'
import { FilterSidebar } from './components/FilterSidebar'
import { ActiveFilterChips } from './components/ActiveFilterChips'
import { CatalogPagination } from './components/CatalogPagination'

const PAGE_SIZE = 20

export function ProductListPage() {
  const [params, setParams] = useSearchParams()

  // Read filter state from URL params
  // Support both ?q= (from SearchBar navigation) and ?search= (legacy/sidebar filter)
  const search = params.get('q') ?? params.get('search') ?? ''
  const categorySlug = params.get('category') ?? ''
  const brandSlug = params.get('brand') ?? ''
  const sort = (params.get('sort') ?? 'name') as SortOption
  const page = Number(params.get('page') ?? '1')

  const { categories } = useCategories()
  const { brands } = useBrands()

  // Resolve category slug → ID
  const activeCategory = categories.find((c) => c.slug === categorySlug) ?? null
  const categoryId = activeCategory?.id ?? null

  // Resolve brand slug → ID
  const activeBrand = brands.find((b) => b.slug === brandSlug) ?? null
  const brandId = activeBrand?.id ?? null

  const { products, totalElements, totalPages, isLoading, isError, refetch } = useProducts({
    search,
    categoryId,
    brandId,
    sort,
    page,
    enabled: !categorySlug || categories.length > 0, // only wait for slug resolution when a category filter is active
  })

  // setFilter updates URL params and resets page to 1
  const setFilter = useCallback(
    (key: string, value: string) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value) {
          next.set(key, value)
        } else {
          next.delete(key)
        }
        next.set('page', '1')
        return next
      })
    },
    [setParams],
  )

  // Clear all filters
  function handleClearAll() {
    setParams(new URLSearchParams())
  }

  // Page change handler
  function handlePageChange(newPage: number) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(newPage))
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Callbacks for ActiveFilterChips
  const onClearSearch = useCallback(() => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('search')
      next.delete('q')
      next.set('page', '1')
      return next
    })
  }, [setParams])
  const onClearCategory = useCallback(() => setFilter('category', ''), [setFilter])
  const onClearBrand = useCallback(() => setFilter('brand', ''), [setFilter])

  // Page title: active category name or "All Products"
  const pageTitle = activeCategory?.name ?? 'All Products'

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-(--sf-text)">{pageTitle}</h1>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar — desktop inline, mobile drawer */}
        <FilterSidebar
          categories={categories}
          brands={brands}
          activeFilters={{
            search,
            category: categorySlug,
            brand: brandSlug,
            sort,
          }}
          setFilter={setFilter}
          onClearAll={handleClearAll}
        />

        {/* Main content area */}
        <div className="min-w-0 flex-1">
          {/* Active filter chips */}
          <div className="mb-4">
            <ActiveFilterChips
              search={search}
              categoryName={activeCategory?.name ?? null}
              brandName={activeBrand?.name ?? null}
              onClearSearch={onClearSearch}
              onClearCategory={onClearCategory}
              onClearBrand={onClearBrand}
            />
          </div>

          {/* Error state */}
          {isError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">
                Something went wrong while loading products.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
              >
                Try again
              </button>
            </div>
          )}

          {/* Product grid */}
          {!isError && (
            <>
              <ProductGrid products={products} isLoading={isLoading} />

              {/* Pagination */}
              {!isLoading && totalPages > 0 && (
                <CatalogPagination
                  page={page}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  pageSize={PAGE_SIZE}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
