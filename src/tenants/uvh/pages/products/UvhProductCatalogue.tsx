import {useMemo} from 'react';

import {UvhCatalogueActiveFilters} from '@/tenants/uvh/pages/products/components/UvhCatalogueActiveFilters.tsx';
import {UvhCatalogueHero} from '@/tenants/uvh/pages/products/components/UvhCatalogueHero.tsx';
import {UvhCatalogueMobileFilters} from '@/tenants/uvh/pages/products/components/UvhCatalogueMobileFilters.tsx';
import {UvhCatalogueResults} from '@/tenants/uvh/pages/products/components/UvhCatalogueResults.tsx';
import {UvhCatalogueSidebar} from '@/tenants/uvh/pages/products/components/UvhCatalogueSidebar.tsx';
import {UvhCatalogueToolbar} from '@/tenants/uvh/pages/products/components/UvhCatalogueToolbar.tsx';
import {useUvhProductCatalogue} from '@/tenants/uvh/pages/products/useUvhProductCatalogue.ts';

const UvhProductCatalogue = () => {
    const catalogue = useUvhProductCatalogue();

    const activeFilterChips = useMemo(() => {
        const chips: {id: string; label: string; onRemove: () => void}[] = [];

        if (catalogue.selectedCategory) {
            chips.push({
                id: 'category',
                label: catalogue.selectedCategory.name,
                onRemove: catalogue.actions.removeCategory,
            });
        }

        if (catalogue.selectedBrand) {
            chips.push({
                id: 'brand',
                label: catalogue.selectedBrand.name,
                onRemove: catalogue.actions.removeBrand,
            });
        }

        if (catalogue.debouncedSearch) {
            chips.push({
                id: 'search',
                label: `Search: ${catalogue.debouncedSearch}`,
                onRemove: catalogue.actions.removeSearch,
            });
        }

        return chips;
    }, [
        catalogue.selectedCategory,
        catalogue.selectedBrand,
        catalogue.debouncedSearch,
        catalogue.actions,
    ]);

    const sidebarProps = {
        categories: catalogue.filteredCategories,
        categoriesLoading: catalogue.categoriesLoading,
        selectedCategoryId: catalogue.filters.categoryId,
        onCategorySelect: catalogue.actions.setCategoryId,
        categorySearch: catalogue.categorySearch,
        onCategorySearchChange: catalogue.setCategorySearch,
        brands: catalogue.filteredBrands,
        brandsLoading: catalogue.brandsLoading,
        selectedBrandId: catalogue.filters.brandId,
        onBrandSelect: catalogue.actions.setBrandId,
        brandSearch: catalogue.brandSearch,
        onBrandSearchChange: catalogue.setBrandSearch,
    };

    return (
        <main className="min-h-screen w-full bg-(--sf-bg)">
            <UvhCatalogueHero />

            <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                    <UvhCatalogueSidebar
                        {...sidebarProps}
                        className="hidden w-full shrink-0 lg:block lg:w-64 xl:w-72"
                    />

                    <div className="min-w-0 flex-1 space-y-4">
                        <UvhCatalogueToolbar
                            search={catalogue.filters.search}
                            onSearchChange={catalogue.actions.setSearch}
                            sortBy={catalogue.filters.sortBy}
                            onSortChange={catalogue.actions.setSortBy}
                            onOpenFilters={() => catalogue.setMobileFiltersOpen(true)}
                            totalCount={catalogue.totalCount}
                        />

                        <UvhCatalogueActiveFilters
                            chips={activeFilterChips}
                            onClearAll={catalogue.actions.clearFilters}
                        />

                        <UvhCatalogueResults
                            products={catalogue.products}
                            loading={catalogue.loading}
                            error={catalogue.error}
                            pageIndex={catalogue.filters.pageIndex}
                            pageCount={catalogue.pageCount}
                            hasNextPage={catalogue.hasNextPage}
                            onPageChange={catalogue.actions.setPageIndex}
                        />
                    </div>
                </div>
            </section>

            <UvhCatalogueMobileFilters
                open={catalogue.mobileFiltersOpen}
                onClose={() => catalogue.setMobileFiltersOpen(false)}
                {...sidebarProps}
            />
        </main>
    );
};

export default UvhProductCatalogue;
