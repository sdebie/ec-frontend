import {useEffect, useMemo, useState} from 'react'
import {Link, useSearchParams} from 'react-router-dom'
import {SfButton, SfCard, SfInput} from '@/components/storefront'
import type {Category} from '@/types/admin/CategoryTypes.ts'
import useStorefrontParentCategories from '@/pages/storefront/uvh/products/hooks/useStorefrontParentCategories.ts'
import {
    useShoppingProducts,
    type ShoppingProductsQuery,
} from '@/pages/storefront/uvh/products/hooks/useShoppingProducts.ts'
import {ProductCard} from '@/components/shared/card/default/ProductCard.tsx'
import {UvhProductRow} from '@/pages/storefront/uvh/products/UvhProductRow.tsx'
import {IMAGE_BASE_URL, IMAGE_THUMBNAIL_URL} from "@/constants/api.constant.ts";
import {Search} from "lucide-react";

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
        <select
            aria-label="Filter by category"
            className="w-full rounded-md border border-(--sf-border) bg-(--sf-panel) px-3 py-2.5 text-sm text-(--sf-text)"
            onChange={(event) => {
                const value = event.target.value
                if (value === 'ALL') {
                    onSelect(null)
                    return
                }
                const selected = rootCategories.find((item) => item.id === value) ?? null
                onSelect(selected)
            }}
            value={selectedCategory?.id ?? 'ALL'}
        >
            <option value="ALL">All Categories</option>
            {rootCategories.map((category) => (
                <option key={category.id} value={category.id}>
                    {category.name}
                </option>
            ))}
        </select>
    )
}

const UvhProductCatalogue = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState<ShoppingProductsQuery['sortBy']>('name')
    const [pageIndex, setPageIndex] = useState(0)
    const pageSize = 15

    const {categories, isLoading: categoriesLoading, errorMsg: categoriesError} =
        useStorefrontParentCategories()

    const rootCategories = useMemo(
        () => categories.filter((category) => category.parent === null),
        [categories],
    )

    const categoryIdFromUrl = searchParams.get('category')

    const categoryIdKnownValid = useMemo(() => {
        if (!categoryIdFromUrl) return false
        return rootCategories.some((category) => category.id === categoryIdFromUrl)
    }, [categoryIdFromUrl, rootCategories])

    const categoryIdForProducts = useMemo(() => {
        if (!categoryIdFromUrl) return null
        if (categoriesLoading) return categoryIdFromUrl
        return categoryIdKnownValid ? categoryIdFromUrl : null
    }, [categoryIdFromUrl, categoriesLoading, categoryIdKnownValid])

    const selectedCategory = useMemo((): Category | null => {
        if (!categoryIdFromUrl || !categoryIdKnownValid) return null
        return rootCategories.find((category) => category.id === categoryIdFromUrl) ?? null
    }, [categoryIdFromUrl, categoryIdKnownValid, rootCategories])

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

    const {
        products,
        hasNextPage,
        loading: productsLoading,
        error: productsError,
    } = useShoppingProducts({
        categoryId: categoryIdForProducts,
        search: searchTerm,
        sortBy,
        pageIndex,
        pageSize,
    })

    const canGoNext = hasNextPage

    useEffect(() => {
        if (!productsLoading && products.length === 0 && pageIndex > 0) {
            setPageIndex(0)
        }
    }, [productsLoading, products.length, pageIndex])
    const isLoading = productsLoading || categoriesLoading
    const error = productsError || categoriesError || null

    const handleCategoryChange = (category: Category | null) => {
        setPageIndex(0)
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev)
                if (category) {
                    next.set('category', category.id)
                } else {
                    next.delete('category')
                }
                return next
            },
            {replace: true},
        )
    }

    return (
        <div className="min-h-screen bg-(--sf-bg)">
            <section className="relative w-full overflow-hidden py-8 sm:py-10 lg:py-12">
                <div
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#000000_0%,#0a0202_42%,#2b0505_100%)]"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,rgba(55,12,12,0.5)_0%,transparent_40%)]"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute inset-y-0 right-0 w-[min(100%,52rem)] bg-[radial-gradient(ellipse_75%_115%_at_100%_50%,rgba(58,10,10,0.55)_0%,transparent_72%)]"
                    aria-hidden
                />

                <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-xl lg:max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="h-0.5 w-8 shrink-0 bg-(--sf-accent)" aria-hidden />
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white">
                                Our Products
                            </p>
                        </div>
                        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                            {selectedCategory?.name ?? 'All Products'}
                        </h1>
                        <p className="mt-3 text-sm font-normal leading-relaxed text-white sm:text-base">
                            Browse our range of quality industrial products.
                        </p>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                <div className="mb-5 flex flex-col gap-3 lg:hidden">
                    <CategorySelect
                        onSelect={handleCategoryChange}
                        rootCategories={rootCategories}
                        selectedCategory={selectedCategory}
                    />
                    <div className="relative">
                        <SfInput
                            className="w-full px-3 py-2.5 pr-10 text-sm"
                            onChange={(event) => {
                                setSearchTerm(event.target.value)
                                setPageIndex(0)
                            }}
                            placeholder="Search products.."
                            type="search"
                            value={searchTerm}
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--sf-muted-text)">
                            <Search/>
                        </span>
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                    <SfCard as="aside" className="hidden h-fit space-y-4 p-4 lg:block">
                        <CategorySelect
                            onSelect={handleCategoryChange}
                            rootCategories={rootCategories}
                            selectedCategory={selectedCategory}
                        />

                        <div>
                            <p className="border-b border-(--sf-border) pb-2 text-xs font-semibold uppercase tracking-wide text-(--sf-muted-text)">
                                Categories
                            </p>
                            <ul className="mt-2 space-y-1">
                                <li>
                                    <button
                                        className={`w-full rounded px-2 py-1 text-left text-sm ${
                                            selectedCategory === null
                                                ? 'bg-(--sf-surface-muted) font-semibold text-(--sf-text)'
                                                : 'text-(--sf-muted-text) hover:bg-(--sf-surface-muted)'
                                        }`}
                                        onClick={() => handleCategoryChange(null)}
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
                        </div>
                    </SfCard>

                    <section className="space-y-4">
                        <div className="hidden gap-3 lg:grid lg:grid-cols-[1fr_220px]">
                            <div className="relative">
                                <SfInput
                                    className="w-full px-3 py-2 pr-10 text-sm"
                                    onChange={(event) => {
                                        setSearchTerm(event.target.value)
                                        setPageIndex(0)
                                    }}
                                    placeholder="Search products..."
                                    type="search"
                                    value={searchTerm}
                                />
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-(--sf-muted-text)">
                                    <Search/>
                                </span>
                            </div>

                            <select
                                aria-label="Sort products"
                                className="w-full rounded-md border border-(--sf-border) bg-(--sf-panel) px-3 py-2 text-sm text-(--sf-text)"
                                onChange={(event) => {
                                    setSortBy(event.target.value as ShoppingProductsQuery['sortBy'])
                                    setPageIndex(0)
                                }}
                                value={sortBy}
                            >
                                <option value="name">Sort by: Name</option>
                                <option value="price-asc">Sort by: Price (Low to High)</option>
                                <option value="price-desc">Sort by: Price (High to Low)</option>
                            </select>
                        </div>

                        {isLoading ? (
                            <SfCard className="p-6 text-sm text-(--sf-muted-text)">Loading products...</SfCard>
                        ) : error ? (
                            <SfCard className="p-6 text-sm text-(--sf-error)">Error: {error}</SfCard>
                        ) : (
                            <>
                                <div className="lg:hidden">
                                    {products.length === 0 ? (
                                        <SfCard className="p-6 text-sm text-(--sf-muted-text)">
                                            No products match your filters.
                                        </SfCard>
                                    ) : (
                                        <div className="rounded-lg border border-(--sf-border) bg-(--sf-panel) px-4">
                                            {products.map((product) => {
                                                const featuredImage =
                                                    product.images?.find((img) => img.isFeatured) ??
                                                    product.images?.[0]

                                                return (
                                                    <UvhProductRow
                                                        key={product.id}
                                                        description={product.shortDescription}
                                                        image={`${IMAGE_THUMBNAIL_URL}${featuredImage?.imageUrl}`}
                                                        name={product.name}
                                                    />
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="hidden gap-3 lg:grid lg:grid-cols-5">
                                    {products.map((product) => {
                                        const featuredImage =
                                            product.images?.find((img) => img.isFeatured) ??
                                            product.images?.[0]
                                        const retailPrice = product.retailPrice?.price ?? 0
                                        const salePrice = product.retailSalePrice?.price ?? undefined


                                        return (
                                            <ProductCard
                                                key={product.id}
                                                id={product.id}
                                                image={`${IMAGE_BASE_URL}${featuredImage?.imageUrl}`}
                                                name={product.name}
                                                originalPrice={salePrice ? retailPrice : undefined}
                                                price={salePrice ?? retailPrice}
                                            />
                                        )
                                    })}
                                </div>
                            </>
                        )}

                        <div className="flex items-center justify-center gap-2 pt-2 text-sm">
                            <button
                                className={`rounded border px-3 py-1 ${
                                    pageIndex === 0
                                        ? 'cursor-not-allowed border-(--sf-border) text-(--sf-muted-text)'
                                        : 'border-(--sf-border) bg-(--sf-panel) text-(--sf-text)'
                                }`}
                                disabled={pageIndex === 0}
                                onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
                                type="button"
                            >
                                Prev
                            </button>
                            <span className="rounded border border-(--sf-border) bg-(--sf-accent) px-3 py-1 text-(--sf-accent-text)">
                                {pageIndex + 1}
                            </span>
                            <button
                                className={`rounded border px-3 py-1 ${
                                    canGoNext
                                        ? 'border-(--sf-border) bg-(--sf-panel) text-(--sf-text)'
                                        : 'cursor-not-allowed border-(--sf-border) text-(--sf-muted-text)'
                                }`}
                                disabled={!canGoNext}
                                onClick={() => {
                                    setPageIndex((current) => current + 1)
                                    const reduceMotion = window.matchMedia(
                                        '(prefers-reduced-motion: reduce)',
                                    ).matches
                                    window.scrollTo({
                                        top: 0,
                                        left: 0,
                                        behavior: reduceMotion ? 'auto' : 'smooth',
                                    })
                                }}
                                type="button"
                            >
                                Next
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            <div className="border-t border-(--sf-border) bg-(--sf-surface-muted) px-4 py-4 sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <p className="text-sm font-semibold text-(--sf-text)">Can&apos;t find what you need?</p>
                        <p className="text-sm text-(--sf-muted-text)">
                            Request a custom quote and we&apos;ll source it for you.
                        </p>
                    </div>
                    <Link to="/contact-us">
                        <SfButton type="button">Request Quote</SfButton>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default UvhProductCatalogue
