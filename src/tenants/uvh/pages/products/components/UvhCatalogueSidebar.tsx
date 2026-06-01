import {Search} from 'lucide-react';
import type {ReactNode} from 'react';
import {Input} from '@/primitives/input';
import {UVH_CATALOGUE_FILTER_LIST_CLASS} from '@/tenants/uvh/pages/products/catalogue.config.ts';
import {cn} from '@/utils/cn.ts';
import type {CatalogBrand, CatalogCategory} from '@/features/catalog/types.ts';

type UvhCatalogueSidebarProps = {
    categories: CatalogCategory[];
    categoriesLoading: boolean;
    selectedCategoryId: string | null;
    onCategorySelect: (id: string | null) => void;
    categorySearch: string;
    onCategorySearchChange: (value: string) => void;
    brands: CatalogBrand[];
    brandsLoading: boolean;
    selectedBrandId: string | null;
    onBrandSelect: (id: string | null) => void;
    brandSearch: string;
    onBrandSearchChange: (value: string) => void;
    className?: string;
};

export function UvhCatalogueSidebar({
                                        categories,
                                        categoriesLoading,
                                        selectedCategoryId,
                                        onCategorySelect,
                                        categorySearch,
                                        onCategorySearchChange,
                                        brands,
                                        brandsLoading,
                                        selectedBrandId,
                                        onBrandSelect,
                                        brandSearch,
                                        onBrandSearchChange,
                                        className,
                                    }: UvhCatalogueSidebarProps) {
    return (
        <aside className={className} aria-label="Product filters">
            <div className="space-y-6">
                <FilterSection title="Categories">
                    <SearchField
                        value={categorySearch}
                        onChange={onCategorySearchChange}
                        placeholder="Search categories…"
                        ariaLabel="Search categories"
                    />
                    {categoriesLoading ? (
                        <p className="mt-3 text-sm text-(--sf-muted-text)">Loading categories…</p>
                    ) : (
                        <RadioFilterList
                            name="uvh-catalogue-category"
                            allLabel="All categories"
                            allSelected={selectedCategoryId == null}
                            onSelectAll={() => onCategorySelect(null)}
                            items={categories.map((category) => ({
                                id: category.id,
                                label: category.name,
                                selected: selectedCategoryId === category.id,
                                onSelect: () => onCategorySelect(category.id),
                            }))}
                        />
                    )}
                </FilterSection>

                <FilterSection title="Brand">
                    <SearchField
                        value={brandSearch}
                        onChange={onBrandSearchChange}
                        placeholder="Search brands…"
                        ariaLabel="Search brands"
                    />
                    {brandsLoading ? (
                        <p className="mt-3 text-sm text-(--sf-muted-text)">Loading brands…</p>
                    ) : (
                        <RadioFilterList
                            name="uvh-catalogue-brand"
                            allLabel="All brands"
                            allSelected={selectedBrandId == null}
                            onSelectAll={() => onBrandSelect(null)}
                            items={brands.map((brand) => ({
                                id: brand.id,
                                label: brand.name,
                                selected: selectedBrandId === brand.id,
                                onSelect: () => onBrandSelect(brand.id),
                            }))}
                        />
                    )}
                </FilterSection>
            </div>
        </aside>
    );
}

function FilterSection({title, children}: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-4 shadow-sm">
            <h2 className="text-sm font-bold text-(--sf-text)">{title}</h2>
            <div className="mt-3">{children}</div>
        </section>
    );
}

function SearchField({
                         value,
                         onChange,
                         placeholder,
                         ariaLabel,
                     }: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    ariaLabel: string;
}) {
    return (
        <div className="relative">
            <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--sf-muted-text)"
                aria-hidden
            />
            <Input
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                size="sm"
                className="pl-9"
                aria-label={ariaLabel}
            />
        </div>
    );
}

type RadioFilterItem = {
    id: string;
    label: string;
    selected: boolean;
    onSelect: () => void;
};

function RadioFilterList({
                             name,
                             allLabel,
                             allSelected,
                             onSelectAll,
                             items,
                         }: {
    name: string;
    allLabel: string;
    allSelected: boolean;
    onSelectAll: () => void;
    items: RadioFilterItem[];
}) {
    return (
        <ul className={cn(UVH_CATALOGUE_FILTER_LIST_CLASS)}>
            <li>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-(--sf-bg)">
                    <input
                        type="radio"
                        name={name}
                        checked={allSelected}
                        onChange={onSelectAll}
                        className="size-4 accent-(--sf-accent)"
                    />
                    <span className="text-sm text-(--sf-text)">{allLabel}</span>
                </label>
            </li>
            {items.map((item) => (
                <li key={item.id}>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-(--sf-bg)">
                        <input
                            type="radio"
                            name={name}
                            checked={item.selected}
                            onChange={item.onSelect}
                            className="size-4 accent-(--sf-accent)"
                        />
                        <span className="text-sm text-(--sf-text)">{item.label}</span>
                    </label>
                </li>
            ))}
        </ul>
    );
}
