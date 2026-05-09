import {Search} from 'lucide-react'
import {useEffect, useMemo, useState} from 'react'
import {useSearchParams} from 'react-router-dom'


import { useAddToCart } from '@/features/cart/hooks/useAddToCart.ts';
import {
    ProductList as CatalogProductList,
    type CatalogProductsQuery,
    useCategories,
    useProducts,
} from '@/features/catalog'
import { getDisplayPrice } from '@/features/catalog/utils/pricing.ts';
import {Card} from '@/primitives/card'
import {Input} from '@/primitives/input'
import { useCustomerType } from '@/store/customerTypeStore.ts';
import {UvhTitleHero} from '@/tenants/uvh/components/UvhTitleHero.tsx'

import type {Category} from '@/types/admin/CategoryTypes.ts'

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
    const customerType = useCustomerType();
    const [searchParams, setSearchParams] = useSearchParams()
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState<CatalogProductsQuery['sortBy']>('name')
    const [pageIndex, setPageIndex] = useState(0)
    const pageSize = 15
    const { createOrder } = useAddToCart();

    const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();

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

    const { products, hasNextPage, loading: productsLoading, error: productsError } = useProducts({
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
            <UvhTitleHero
                description="Browse our range of quality industrial products."
                eyebrow="Our Products"
                title={selectedCategory?.name ?? 'All Products'}
            />

            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
                <div className="mb-5 flex flex-col gap-3 lg:hidden">
                    <CategorySelect
                        onSelect={handleCategoryChange}
                        rootCategories={rootCategories}
                        selectedCategory={selectedCategory}
                    />
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

                <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
                    <Card as="aside" elevation="none" padded={false} className="hidden h-fit space-y-4 p-4 lg:block">
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
                    </Card>

                    <section className="space-y-4">
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

                            <select
                                aria-label="Sort products"
                                className="w-full rounded-md border border-(--sf-border) bg-(--sf-panel) px-3 py-2 text-sm text-(--sf-text)"
                                onChange={(event) => {
                                    setSortBy(event.target.value as CatalogProductsQuery['sortBy'])
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
                            <Card elevation="none" padded={false} className="p-6 text-sm text-(--sf-muted-text)">Loading products...</Card>
                        ) : error ? (
                            <Card elevation="none" padded={false} className="p-6 text-sm text-(--sf-error)">Error: {error}</Card>
                        ) : (
                            <>
                                <div className="min-w-0 lg:hidden">
                                    {products.length === 0 ? (
                                        <Card elevation="none" padded={false} className="p-6 text-sm text-(--sf-muted-text)">
                                            No products match your filters.
                                        </Card>
                                    ) : (
                                        <CatalogProductList
                                            products={products}
                                            cardClassName="min-w-0"
                                            gridClassName="grid grid-cols-1 gap-4 sm:grid-cols-2"
                                            onAddToCart={handleAddToCart}
                                        />
                                    )}
                                </div>

                                {/* Full-width container only — do not nest an outer multi-column grid here or the list
                                    becomes a single grid cell (~1/5 width) and cards collapse to narrow strips. */}
                                <div className="hidden min-w-0 lg:block">
                                    {products.length === 0 ? (
                                        <Card elevation="none" padded={false} className="p-6 text-sm text-(--sf-muted-text)">
                                            No products match your filters.
                                        </Card>
                                    ) : (
                                        <CatalogProductList
                                            products={products}
                                            cardClassName="min-w-0"
                                            gridClassName="grid grid-cols-5 gap-4"
                                            onAddToCart={handleAddToCart}
                                        />
                                    )}
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
                            <span
                                className="rounded border border-(--sf-border) bg-(--sf-accent) px-3 py-1 text-(--sf-accent-text)">
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
        </div>
    )
}

export default UvhProductCatalogue
