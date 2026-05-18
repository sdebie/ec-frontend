import {ChevronDown, Search} from 'lucide-react'
import {useEffect, useMemo, useState, type ReactNode} from 'react'
import {useSearchParams} from 'react-router-dom'


import { useAddToCart } from '@/features/cart/hooks/useAddToCart.ts';
import {
    ProductList as CatalogProductList,
    type CatalogProductsQuery,
    useBrands,
    useCategories,
    useProducts,
    useProductsByBrand,
} from '@/features/catalog'
import { getDisplayPrice } from '@/features/catalog/utils/pricing.ts';
import {Card} from '@/primitives/card'
import {Input} from '@/primitives/input'
import { useCustomerType } from '@/store/customerTypeStore.ts';
import {UvhTitleHero} from '@/tenants/uvh/components/UvhTitleHero.tsx'
import {cn} from '@/utils/cn.ts'

import type {CatalogBrand, CatalogProductListItem} from '@/features/catalog'
import type {Category} from '@/types/admin/CategoryTypes.ts'

const UVH_CONTROL_CLASS =
    'w-full appearance-none rounded-lg border border-(--sf-border) bg-(--sf-panel) px-3 py-2.5 text-sm font-medium text-(--sf-text) shadow-sm transition-colors placeholder:text-(--sf-muted-text) hover:border-(--sf-accent) focus:border-(--sf-accent) focus:outline-none focus:ring-2 focus:ring-(--sf-accent)/30'

const UVH_SELECT_CLASS = `${UVH_CONTROL_CLASS} pr-9`

type UvhSelectProps = {
    ariaLabel: string
    value: string
    onChange: (value: string) => void
    children: ReactNode
    className?: string
}

function UvhSelect({ariaLabel, value, onChange, children, className}: UvhSelectProps) {
    return (
        <div className={cn('relative', className)}>
            <select
                aria-label={ariaLabel}
                className={UVH_SELECT_CLASS}
                onChange={(event) => onChange(event.target.value)}
                value={value}
            >
                {children}
            </select>
            <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--sf-accent)"
            />
        </div>
    )
}

function CategorySelect({
                            rootCategories,
                            selectedCategory,
                            onSelect,
                        }: {
    rootCategories: Category[]
    selectedCategory: Category | null
    onSelect: (category: Category | null) => void
}) {
    return (
        <UvhSelect
            ariaLabel="Filter by category"
            value={selectedCategory?.id ?? 'ALL'}
            onChange={(value) => {
                if (value === 'ALL') {
                    onSelect(null)
                    return
                }
                const selected = rootCategories.find((item) => item.id === value) ?? null
                onSelect(selected)
            }}
        >
            <option value="ALL">All Categories</option>
            {rootCategories.map((category) => (
                <option key={category.id} value={category.id}>
                    {category.name}
                </option>
            ))}
        </UvhSelect>
    )
}

type CollapsibleSidebarSectionProps = {
    title: string
    expanded: boolean
    onToggle: () => void
    children: ReactNode
}

type PaginationProps = {
    /** Zero-indexed current page. */
    pageIndex: number
    /** Total pages when known; pass `null` to fall back to Prev/Next only. */
    totalPages: number | null
    /** Used when `totalPages` is null. */
    canGoNext: boolean
    onChange: (nextPageIndex: number) => void
}

function getPageWindow(currentPage: number, totalPages: number): number[] {
    if (totalPages <= 7) {
        return Array.from({length: totalPages}, (_, i) => i + 1)
    }
    const pages: number[] = [1]
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    if (start > 2) pages.push(-1) // left ellipsis sentinel
    for (let p = start; p <= end; p += 1) pages.push(p)
    if (end < totalPages - 1) pages.push(-2) // right ellipsis sentinel
    pages.push(totalPages)
    return pages
}

function Pagination({pageIndex, totalPages, canGoNext, onChange}: PaginationProps) {
    const currentPage = pageIndex + 1
    const prevDisabled = pageIndex === 0
    const nextDisabled = totalPages != null ? currentPage >= totalPages : !canGoNext

    const baseBtn =
        'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors'
    const inactive =
        'border-(--sf-border) bg-(--sf-panel) text-(--sf-text) hover:border-(--sf-accent) hover:text-(--sf-accent)'
    const disabled =
        'cursor-not-allowed border-(--sf-border) bg-(--sf-panel) text-(--sf-muted-text) opacity-60'
    const active = 'border-(--sf-accent) bg-(--sf-accent) text-(--sf-accent-text) shadow-sm'

    return (
        <nav aria-label="Product list pagination" className="flex flex-wrap items-center justify-center gap-2 pt-3">
            <button
                type="button"
                className={cn(baseBtn, prevDisabled ? disabled : inactive)}
                disabled={prevDisabled}
                onClick={() => onChange(Math.max(0, pageIndex - 1))}
            >
                Prev
            </button>

            {totalPages != null
                ? getPageWindow(currentPage, totalPages).map((p, idx) =>
                      p < 0 ? (
                          <span
                              key={`ellipsis-${idx}`}
                              aria-hidden
                              className="px-1 text-sm text-(--sf-muted-text)"
                          >
                              …
                          </span>
                      ) : (
                          <button
                              key={p}
                              type="button"
                              aria-current={p === currentPage ? 'page' : undefined}
                              className={cn(baseBtn, p === currentPage ? active : inactive)}
                              onClick={() => onChange(p - 1)}
                          >
                              {p}
                          </button>
                      ),
                  )
                : (
                    <span className={cn(baseBtn, active)} aria-current="page">
                        {currentPage}
                    </span>
                )}

            <button
                type="button"
                className={cn(baseBtn, nextDisabled ? disabled : inactive)}
                disabled={nextDisabled}
                onClick={() => onChange(pageIndex + 1)}
            >
                Next
            </button>
        </nav>
    )
}

function CollapsibleSidebarSection({title, expanded, onToggle, children}: CollapsibleSidebarSectionProps) {
    return (
        <div>
            {/* Sticky so the section heading stays visible while the inner list scrolls. */}
            <button
                type="button"
                aria-expanded={expanded}
                onClick={onToggle}
                className="sticky top-0 z-10 flex w-full items-center justify-between border-b border-(--sf-border) bg-(--sf-panel) pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-(--sf-muted-text) transition-colors hover:text-(--sf-text)"
            >
                <span>{title}</span>
                <ChevronDown
                    className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        expanded ? 'rotate-180' : 'rotate-0',
                    )}
                />
            </button>
            {expanded ? <div className="mt-2">{children}</div> : null}
        </div>
    )
}

const UvhProductCatalogue = () => {
    const customerType = useCustomerType();
    const [searchParams, setSearchParams] = useSearchParams()
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState<CatalogProductsQuery['sortBy']>('name')
    const [pageIndex, setPageIndex] = useState(0)
    const [categoriesExpanded, setCategoriesExpanded] = useState(true)
    const [brandsExpanded, setBrandsExpanded] = useState(true)
    const MOBILE_PAGE_SIZE = 2
    const TABLET_PAGE_SIZE = 4
    const DESKTOP_PAGE_SIZE = 10
    // Backend page size; we fetch enough to cover the largest breakpoint and slice per breakpoint below.
    const pageSize = DESKTOP_PAGE_SIZE
    const { createOrder } = useAddToCart();

    const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
    const { brands, loading: brandsLoading, error: brandsError } = useBrands(100);

    const rootCategories = useMemo(
        () => categories.filter((category) => category.parent === null),
        [categories],
    )

    const categoryIdFromUrl = searchParams.get('category')
    const brandIdFromUrl = searchParams.get('brand')

    const categoryIdKnownValid = useMemo(() => {
        if (!categoryIdFromUrl) return false
        return rootCategories.some((category) => category.id === categoryIdFromUrl)
    }, [categoryIdFromUrl, rootCategories])

    const brandIdKnownValid = useMemo(() => {
        if (!brandIdFromUrl) return false
        return brands.some((brand) => brand.id === brandIdFromUrl)
    }, [brandIdFromUrl, brands])

    const categoryIdForProducts = useMemo(() => {
        if (!categoryIdFromUrl) return null
        if (categoriesLoading) return categoryIdFromUrl
        return categoryIdKnownValid ? categoryIdFromUrl : null
    }, [categoryIdFromUrl, categoriesLoading, categoryIdKnownValid])

    const brandIdForProducts = useMemo(() => {
        if (!brandIdFromUrl) return null
        if (brandsLoading) return brandIdFromUrl
        return brandIdKnownValid ? brandIdFromUrl : null
    }, [brandIdFromUrl, brandsLoading, brandIdKnownValid])

    const selectedCategory = useMemo((): Category | null => {
        if (!categoryIdFromUrl || !categoryIdKnownValid) return null
        return rootCategories.find((category) => category.id === categoryIdFromUrl) ?? null
    }, [categoryIdFromUrl, categoryIdKnownValid, rootCategories])

    const selectedBrand = useMemo((): CatalogBrand | null => {
        if (!brandIdFromUrl || !brandIdKnownValid) return null
        return brands.find((brand) => brand.id === brandIdFromUrl) ?? null
    }, [brandIdFromUrl, brandIdKnownValid, brands])

    useEffect(() => {
        if (categoriesLoading || !categoryIdFromUrl || categoryIdKnownValid) return
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev)
                next.delete('category')
                return next
            },
            {replace: true},
        )
    }, [categoriesLoading, categoryIdFromUrl, categoryIdKnownValid, setSearchParams])

    useEffect(() => {
        if (brandsLoading || !brandIdFromUrl || brandIdKnownValid) return
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev)
                next.delete('brand')
                return next
            },
            {replace: true},
        )
    }, [brandsLoading, brandIdFromUrl, brandIdKnownValid, setSearchParams])

    const {
        products: categoryProducts,
        hasNextPage: categoryHasNextPage,
        totalCount: categoryTotalCount,
        loading: categoryProductsLoading,
        error: categoryProductsError,
    } = useProducts({
        categoryId: categoryIdForProducts,
        search: searchTerm,
        sortBy,
        pageIndex,
        pageSize,
    })

    const {
        products: brandProducts,
        hasNextPage: brandHasNextPage,
        totalCount: brandTotalCount,
        loading: brandProductsLoading,
        error: brandProductsError,
    } = useProductsByBrand({
        brandId: brandIdForProducts,
        search: searchTerm,
        sortBy,
        pageIndex,
        pageSize,
    })

    const isBrandFiltered = brandIdForProducts != null
    const products: CatalogProductListItem[] = isBrandFiltered ? brandProducts : categoryProducts
    const hasNextPage = isBrandFiltered ? brandHasNextPage : categoryHasNextPage
    const productsLoading = isBrandFiltered ? brandProductsLoading : categoryProductsLoading
    const productsError = isBrandFiltered ? brandProductsError : categoryProductsError
    const totalCount = isBrandFiltered ? brandTotalCount : categoryTotalCount
    /** Numbered pagination always renders because both hooks expose totalCount. */
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

    const canGoNext = hasNextPage

    const mobileProducts = products.slice(0, MOBILE_PAGE_SIZE)
    const tabletProducts = products.slice(0, TABLET_PAGE_SIZE)
    const desktopProducts = products.slice(0, DESKTOP_PAGE_SIZE)

    useEffect(() => {
        if (!productsLoading && products.length === 0 && pageIndex > 0) {
            setPageIndex(0)
        }
    }, [productsLoading, products.length, pageIndex])
    const isLoading = productsLoading || categoriesLoading
    const error = productsError || categoriesError || brandsError || null

    const handleAddToCart = async (product: (typeof products)[number]) => {
        const unitPrice = getDisplayPrice(product, customerType).price;
        if (!product.variantId || unitPrice <= 0) return;
        await createOrder({
            items: [{ quantity: 1, unitPrice, variant: String(product.variantId) }],
        });
    };

    const handleCategoryChange = (category: Category | null) => {
        setPageIndex(0)
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev)
                if (category) {
                    next.set('category', category.id)
                    next.delete('brand')
                } else {
                    next.delete('category')
                }
                return next
            },
            {replace: true},
        )
    }

    const handleBrandChange = (brand: CatalogBrand | null) => {
        setPageIndex(0)
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev)
                if (brand) {
                    next.set('brand', brand.id)
                    next.delete('category')
                } else {
                    next.delete('brand')
                }
                return next
            },
            {replace: true},
        )
    }

    const heroTitle = selectedBrand?.name ?? selectedCategory?.name ?? 'All Products'

    return (
        <div className="min-h-screen bg-(--sf-bg)">
            <UvhTitleHero
                className="py-4 sm:py-6 lg:py-7"
                description="Browse our range of quality industrial products."
                descriptionClassName="mt-2 text-sm font-normal leading-relaxed text-white"
                eyebrow="Our Products"
                title={heroTitle}
                titleClassName="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl"
            />

            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                <div className="mb-5 flex flex-col gap-3 lg:hidden">
                    <CategorySelect
                        onSelect={handleCategoryChange}
                        rootCategories={rootCategories}
                        selectedCategory={selectedCategory}
                    />
                    <UvhSelect
                        ariaLabel="Filter by brand"
                        value={selectedBrand?.id ?? 'ALL'}
                        onChange={(value) => {
                            if (value === 'ALL') {
                                handleBrandChange(null)
                                return
                            }
                            const next = brands.find((b) => b.id === value) ?? null
                            handleBrandChange(next)
                        }}
                    >
                        <option value="ALL">All Brands</option>
                        {brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                                {brand.name}
                            </option>
                        ))}
                    </UvhSelect>
                    <div className="relative">
                        <Input
                            className="w-full px-3 py-2.5 pr-10 text-sm"
                            onChange={(event) => {
                                setSearchTerm(event.target.value)
                                setPageIndex(0)
                            }}
                            placeholder="Search products.."
                            type="search"
                            value={searchTerm}
                        />
                        <span
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--sf-muted-text)">
                            <Search/>
                        </span>
                    </div>
                </div>

                <div className="relative grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                    {/* Sidebar matches the product section's height exactly.
                        Absolute positioning keeps the sidebar's natural content
                        height from pushing the grid row taller — the row is
                        sized by the product section (always 2 rows of cards),
                        and the sidebar fills that height via h-full. */}
                    <div className="hidden lg:absolute lg:inset-y-0 lg:left-0 lg:block lg:w-65">
                        <Card as="aside" elevation="none" padded={false} className="flex h-full flex-col overflow-hidden p-4">
                        <div className="flex min-h-0 flex-1 flex-col space-y-4 overflow-y-auto pr-1 [scrollbar-color:var(--sf-accent)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-(--sf-accent)/70 [&::-webkit-scrollbar-track]:bg-transparent">
                        <CollapsibleSidebarSection
                            title="Categories"
                            expanded={categoriesExpanded}
                            onToggle={() => setCategoriesExpanded((v) => !v)}
                        >
                            <ul className="space-y-1">
                                <li>
                                    <button
                                        className={`w-full rounded px-2 py-1 text-left text-sm ${
                                            selectedCategory === null && selectedBrand === null
                                                ? 'bg-(--sf-surface-muted) font-semibold text-(--sf-text)'
                                                : 'text-(--sf-muted-text) hover:bg-(--sf-surface-muted)'
                                        }`}
                                        onClick={() => {
                                            handleCategoryChange(null)
                                            handleBrandChange(null)
                                        }}
                                        type="button"
                                    >
                                        All Products
                                    </button>
                                </li>
                                {rootCategories.map((category) => (
                                    <li key={category.id}>
                                        <button
                                            className={`w-full rounded px-2 py-1 text-left text-sm ${
                                                selectedCategory?.id === category.id
                                                    ? 'bg-(--sf-surface-muted) font-semibold text-(--sf-text)'
                                                    : 'text-(--sf-muted-text) hover:bg-(--sf-surface-muted)'
                                            }`}
                                            onClick={() => handleCategoryChange(category)}
                                            type="button"
                                        >
                                            {category.name}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </CollapsibleSidebarSection>

                        <CollapsibleSidebarSection
                            title="Brands"
                            expanded={brandsExpanded}
                            onToggle={() => setBrandsExpanded((v) => !v)}
                        >
                            {brandsLoading ? (
                                <p className="px-2 py-1 text-xs text-(--sf-muted-text)">Loading brands…</p>
                            ) : (
                                <ul className="space-y-1">
                                    <li>
                                        <button
                                            className={`w-full rounded px-2 py-1 text-left text-sm ${
                                                selectedBrand === null
                                                    ? 'bg-(--sf-surface-muted) font-semibold text-(--sf-text)'
                                                    : 'text-(--sf-muted-text) hover:bg-(--sf-surface-muted)'
                                            }`}
                                            onClick={() => handleBrandChange(null)}
                                            type="button"
                                        >
                                            All Brands
                                        </button>
                                    </li>
                                    {brands.map((brand) => (
                                        <li key={brand.id}>
                                            <button
                                                className={`w-full rounded px-2 py-1 text-left text-sm ${
                                                    selectedBrand?.id === brand.id
                                                        ? 'bg-(--sf-surface-muted) font-semibold text-(--sf-text)'
                                                        : 'text-(--sf-muted-text) hover:bg-(--sf-surface-muted)'
                                                }`}
                                                onClick={() => handleBrandChange(brand)}
                                                type="button"
                                            >
                                                {brand.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CollapsibleSidebarSection>
                        </div>
                        </Card>
                    </div>

                    <section className="min-w-0 space-y-4 lg:col-start-2 lg:col-end-3">
                        <div className="hidden gap-3 lg:grid lg:grid-cols-[1fr_220px]">
                            <div className="relative">
                                <Input
                                    className="w-full px-3 py-2 pr-10 text-sm"
                                    onChange={(event) => {
                                        setSearchTerm(event.target.value)
                                        setPageIndex(0)
                                    }}
                                    placeholder="Search products..."
                                    type="search"
                                    value={searchTerm}
                                />
                                <span
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--sf-muted-text)">
                                   <Search/>
                                </span>
                            </div>

                            <UvhSelect
                                ariaLabel="Sort products"
                                value={sortBy ?? 'name'}
                                onChange={(value) => {
                                    setSortBy(value as CatalogProductsQuery['sortBy'])
                                    setPageIndex(0)
                                }}
                            >
                                <option value="name">Sort by: Name</option>
                                <option value="price-asc">Sort by: Price (Low to High)</option>
                                <option value="price-desc">Sort by: Price (High to Low)</option>
                            </UvhSelect>
                        </div>

                        {isLoading ? (
                            <Card elevation="none" padded={false} className="p-6 text-sm text-(--sf-muted-text)">Loading products...</Card>
                        ) : error ? (
                            <Card elevation="none" padded={false} className="p-6 text-sm text-(--sf-error)">Error: {error}</Card>
                        ) : (
                            <>
                                <div className="min-w-0 sm:hidden">
                                    {mobileProducts.length === 0 ? (
                                        <Card elevation="none" padded={false} className="p-6 text-sm text-(--sf-muted-text)">
                                            No products match your filters.
                                        </Card>
                                    ) : (
                                        <CatalogProductList
                                            products={mobileProducts}
                                            cardClassName="min-w-0"
                                            gridClassName="grid grid-cols-1 gap-4"
                                            onAddToCart={handleAddToCart}
                                        />
                                    )}
                                </div>

                                <div className="hidden min-w-0 sm:block lg:hidden">
                                    {tabletProducts.length === 0 ? (
                                        <Card elevation="none" padded={false} className="p-6 text-sm text-(--sf-muted-text)">
                                            No products match your filters.
                                        </Card>
                                    ) : (
                                        <CatalogProductList
                                            products={tabletProducts}
                                            cardClassName="min-w-0"
                                            gridClassName="grid grid-cols-2 gap-4"
                                            onAddToCart={handleAddToCart}
                                        />
                                    )}
                                </div>

                                {/* Full-width container only — do not nest an outer multi-column grid here or the list
                                    becomes a single grid cell (~1/5 width) and cards collapse to narrow strips. */}
                                <div className="hidden min-w-0 lg:block">
                                    {desktopProducts.length === 0 ? (
                                        <Card elevation="none" padded={false} className="p-6 text-sm text-(--sf-muted-text)">
                                            No products match your filters.
                                        </Card>
                                    ) : (
                                        <CatalogProductList
                                            products={desktopProducts}
                                            cardClassName="min-w-0"
                                            gridClassName="grid grid-cols-5 gap-4"
                                            onAddToCart={handleAddToCart}
                                        />
                                    )}
                                </div>
                            </>
                        )}

                        <Pagination
                            pageIndex={pageIndex}
                            totalPages={totalPages}
                            canGoNext={canGoNext}
                            onChange={(nextIndex) => {
                                setPageIndex(nextIndex)
                                const reduceMotion = window.matchMedia(
                                    '(prefers-reduced-motion: reduce)',
                                ).matches
                                window.scrollTo({
                                    top: 0,
                                    left: 0,
                                    behavior: reduceMotion ? 'auto' : 'smooth',
                                })
                            }}
                        />
                    </section>
                </div>
            </div>
        </div>
    )
}

export default UvhProductCatalogue
