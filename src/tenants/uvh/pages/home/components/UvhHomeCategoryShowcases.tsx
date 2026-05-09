import {useEffect, useMemo, useState} from 'react'


import { fetchProductsPage, useCategories } from '@/features/catalog';
import {Card} from '@/primitives/card'
import {UvhCategoryShowcaseSection} from '@/tenants/uvh/pages/home/components/UvhCategoryShowcaseSection.tsx'
import {resolveRootCategoryId} from '@/tenants/uvh/pages/home/resolveUvhShowcaseCategoryId.ts'
import {
    UVH_CATEGORY_SHOWCASES,
    type UvhCategoryShowcaseSpec,
} from '@/tenants/uvh/pages/home/uvhCategoryShowcases.config.ts'

import type {ProductShoppingListItem} from '@/types/admin/ProductTypes.ts'

type ShowcaseRowState = {
    spec: UvhCategoryShowcaseSpec
    categoryId: string | null
    products: ProductShoppingListItem[]
    error: string | null
}

const emptyRows = (): ShowcaseRowState[] =>
    UVH_CATEGORY_SHOWCASES.map((spec) => ({spec, categoryId: null, products: [], error: null}))

export function UvhHomeCategoryShowcases() {
    const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()
    const categoryIds = useMemo(
        () => UVH_CATEGORY_SHOWCASES.map((spec) => resolveRootCategoryId(categories, spec.categoryNameHints)),
        [categories],
    );
    const [rows, setRows] = useState<ShowcaseRowState[]>(emptyRows)
    const [productsLoading, setProductsLoading] = useState(true)

    useEffect(() => {
        if (categoriesLoading) return;
        let cancelled = false;

        const load = async () => {
            setProductsLoading(true);
            const next = await Promise.all(
                UVH_CATEGORY_SHOWCASES.map(async (spec, index) => {
                    const categoryId = categoryIds[index];
                    if (!categoryId) {
                        return { spec, categoryId: null, products: [] as ProductShoppingListItem[], error: null as string | null };
                    }
                    try {
                        const products = await fetchProductsPage({
                            categoryId,
                            pageIndex: 0,
                            pageSize: 12,
                        });
                        return { spec, categoryId, products, error: null as string | null };
                    } catch {
                        return {
                            spec,
                            categoryId,
                            products: [] as ProductShoppingListItem[],
                            error: 'Could not load products for this category.',
                        };
                    }
                }),
            );
            if (!cancelled) {
                setRows(next);
                setProductsLoading(false);
            }
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, [categoriesLoading, categoryIds]);

    const loading = categoriesLoading || productsLoading

    return (
        <div className="flex w-full flex-col gap-0">
            {categoriesError ? (
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
                    <Card elevation="none" padded={false} className="border-(--sf-border) p-4 text-sm text-(--sf-error)">
                        {categoriesError} Category highlights may be unavailable until this is resolved.
                    </Card>
                </div>
            ) : null}
            {rows.map((row) => (
                <UvhCategoryShowcaseSection
                    key={row.spec.id}
                    categoryId={row.categoryId}
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
