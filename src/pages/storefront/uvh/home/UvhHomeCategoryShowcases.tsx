import {useEffect, useState} from 'react'
import {apiGetShoppingProductsList} from '@/services/graphql/product/product.service.ts'
import type {ProductShoppingListItem} from '@/types/admin/ProductTypes.ts'
import useStorefrontParentCategories from '@/pages/storefront/uvh/products/hooks/useStorefrontParentCategories.ts'
import {UvhCategoryShowcaseSection} from '@/pages/storefront/uvh/home/UvhCategoryShowcaseSection.tsx'
import {
    UVH_CATEGORY_SHOWCASES,
    type UvhCategoryShowcaseSpec,
} from '@/pages/storefront/uvh/home/uvhCategoryShowcases.config.ts'
import {resolveRootCategoryId} from '@/pages/storefront/uvh/home/resolveUvhShowcaseCategoryId.ts'
import {SfCard} from '@/components/storefront'

type ShowcaseRowState = {
    spec: UvhCategoryShowcaseSpec
    products: ProductShoppingListItem[]
    error: string | null
}

const emptyRows = (): ShowcaseRowState[] =>
    UVH_CATEGORY_SHOWCASES.map((spec) => ({spec, products: [], error: null}))

export function UvhHomeCategoryShowcases() {
    const {categories, isLoading: categoriesLoading, errorMsg: categoriesError} =
        useStorefrontParentCategories()
    const [rows, setRows] = useState<ShowcaseRowState[]>(emptyRows)
    const [productsLoading, setProductsLoading] = useState(true)

    useEffect(() => {
        if (categoriesLoading) return

        let cancelled = false

        const load = async () => {
            setProductsLoading(true)
            try {
                const next = await Promise.all(
                    UVH_CATEGORY_SHOWCASES.map(async (spec) => {
                        const categoryId = resolveRootCategoryId(categories, spec.categoryNameHints)
                        if (categoryId == null) {
                            return {
                                spec,
                                products: [] as ProductShoppingListItem[],
                                error: null as string | null,
                            }
                        }
                        try {
                            const list = await apiGetShoppingProductsList(
                                categoryId,
                                {pageIndex: 0, pageSize: 12},
                                {sort: [{field: 'name', direction: 'ASC'}]},
                            )
                            return {
                                spec,
                                products: list ?? [],
                                error: null as string | null,
                            }
                        } catch {
                            return {
                                spec,
                                products: [] as ProductShoppingListItem[],
                                error: 'Could not load products for this category.',
                            }
                        }
                    }),
                )
                if (!cancelled) {
                    setRows(next)
                }
            } finally {
                if (!cancelled) {
                    setProductsLoading(false)
                }
            }
        }

        void load()

        return () => {
            cancelled = true
        }
    }, [categories, categoriesLoading])

    const loading = categoriesLoading || productsLoading

    return (
        <div className="flex w-full flex-col gap-6 sm:gap-8">
            {categoriesError ? (
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
                    <SfCard className="border-(--sf-border) p-4 text-sm text-(--sf-error)">
                        {categoriesError} Category highlights may be unavailable until this is resolved.
                    </SfCard>
                </div>
            ) : null}
            {rows.map((row) => (
                <UvhCategoryShowcaseSection
                    key={row.spec.id}
                    categoryId={resolveRootCategoryId(categories, row.spec.categoryNameHints)}
                    decorativeImageAlt={row.spec.decorativeImageAlt}
                    decorativeImageSrc={row.spec.decorativeImageSrc}
                    error={row.error}
                    loading={loading}
                    products={row.products}
                    sectionId={row.spec.id}
                    theme={row.spec.theme}
                    title={row.spec.title}
                    viewAllTo={row.spec.viewAllTo}
                />
            ))}
        </div>
    )
}
