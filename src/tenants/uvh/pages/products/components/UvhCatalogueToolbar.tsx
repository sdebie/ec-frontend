import {ChevronDown, Filter, Search} from 'lucide-react';
import {Button} from '@/primitives/button';
import {Input} from '@/primitives/input';
import {UVH_CATALOGUE_SORT_OPTIONS} from '@/tenants/uvh/pages/products/catalogue.config.ts';
import {cn} from '@/utils/cn.ts';
import type {UvhCatalogueSort} from '@/tenants/uvh/pages/products/useUvhProductCatalogue.ts';

const sortSelectClassName = cn(
    'w-full min-w-[10rem] appearance-none rounded-(--c-radius) border border-(--c-border) bg-(--c-panel)',
    'h-(--c-control-h-sm) pl-3 pr-9 text-xs text-(--c-text)',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring)',
    'focus-visible:ring-offset-1 focus-visible:ring-offset-(--c-bg)',
);

type UvhCatalogueToolbarProps = {
    search: string;
    onSearchChange: (value: string) => void;
    sortBy: UvhCatalogueSort;
    onSortChange: (sort: UvhCatalogueSort) => void;
    onOpenFilters: () => void;
    totalCount: number;
};

export function UvhCatalogueToolbar({
                                        search,
                                        onSearchChange,
                                        sortBy,
                                        onSortChange,
                                        onOpenFilters,
                                        totalCount,
                                    }: UvhCatalogueToolbarProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-(--sf-muted-text)"
                        aria-hidden
                    />
                    <Input
                        type="search"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search products…"
                        size="md"
                        className="pl-9"
                        aria-label="Search products"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="md"
                    className="lg:hidden"
                    leftIcon={<Filter className="size-4" aria-hidden/>}
                    onClick={onOpenFilters}
                >
                    Filters
                </Button>
            </div>

            <div className="flex shrink-0 items-center gap-3">
                <p className="hidden text-sm text-(--sf-muted-text) sm:block">
                    {totalCount} {totalCount === 1 ? 'product' : 'products'}
                </p>
                <div className="flex items-center gap-2">
                    <span className="whitespace-nowrap text-xs font-medium text-(--sf-text)">Sort by:</span>
                    <div className="relative min-w-[10rem]">
                        <select
                            value={sortBy}
                            onChange={(e) => onSortChange(e.target.value as UvhCatalogueSort)}
                            className={sortSelectClassName}
                            aria-label="Sort products"
                        >
                            {UVH_CATALOGUE_SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-(--c-text-muted)"
                            aria-hidden
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
