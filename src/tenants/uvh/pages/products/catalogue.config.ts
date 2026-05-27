import type {LucideIcon} from 'lucide-react';
import {Droplets, HardHat, LayoutGrid, Shield, Stethoscope} from 'lucide-react';

export type UvhCatalogueQuickCategory = {
    id: string;
    label: string;
    icon: LucideIcon;
    /** Substrings matched against root category names from the API */
    categoryNameHints: string[];
};

export const UVH_CATALOGUE_QUICK_CATEGORIES: UvhCatalogueQuickCategory[] = [
    {
        id: 'all',
        label: 'All Products',
        icon: LayoutGrid,
        categoryNameHints: [],
    },
    {
        id: 'ppe',
        label: 'PPE',
        icon: Shield,
        categoryNameHints: ['ppe', 'workwear', 'protective'],
    },
    {
        id: 'workwear',
        label: 'Workwear',
        icon: HardHat,
        categoryNameHints: ['workwear', 'wear'],
    },
    {
        id: 'cleaning',
        label: 'Cleaning',
        icon: Droplets,
        categoryNameHints: ['cleaning'],
    },
    {
        id: 'medical',
        label: 'Medical',
        icon: Stethoscope,
        categoryNameHints: ['medical'],
    },
];

export const UVH_CATALOGUE_SORT_OPTIONS = [
    {value: 'name' as const, label: 'Name'},
    {value: 'price-asc' as const, label: 'Price: Low to High'},
    {value: 'price-desc' as const, label: 'Price: High to Low'},
];

/** Default page size below xl (mobile/tablet/desktop). */
export const UVH_CATALOGUE_PAGE_SIZE = 20;

/** xl breakpoint: 5 columns × 4 rows. */
export const UVH_CATALOGUE_XL_COLUMNS = 5;
export const UVH_CATALOGUE_XL_ROW_COUNT = 4;
export const UVH_CATALOGUE_XL_PAGE_SIZE = UVH_CATALOGUE_XL_COLUMNS * UVH_CATALOGUE_XL_ROW_COUNT;

export const UVH_CATALOGUE_GRID_CLASS =
    'grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5';

/** Scrollable category/brand filter lists in the sidebar. */
export const UVH_CATALOGUE_FILTER_LIST_CLASS = 'mt-3 max-h-52 space-y-1 overflow-y-auto pr-1 xl:max-h-96';
