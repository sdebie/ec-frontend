import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {useBrands, useCategories, useProducts} from '@/features/catalog';
import {resolveRootCategoryId} from '@/tenants/uvh/pages/home/resolveUvhShowcaseCategoryId.ts';
import type {UvhCatalogueQuickCategory} from '@/tenants/uvh/pages/products/catalogue.config.ts';
import {
    UVH_CATALOGUE_PAGE_SIZE,
    UVH_CATALOGUE_QUICK_CATEGORIES,
} from '@/tenants/uvh/pages/products/catalogue.config.ts';
import type {CatalogBrand, CatalogCategory, CatalogProductListItem} from '@/features/catalog/types.ts';

const SEARCH_DEBOUNCE_MS = 350;

export type UvhCatalogueSort = 'name' | 'price-asc' | 'price-desc';

export type UvhCatalogueFilters = {
    quickCategoryId: string;
    categoryId: string | null;
    brandId: string | null;
    search: string;
    sortBy: UvhCatalogueSort;
    pageIndex: number;
};

export type UvhCatalogueFilterActions = {
    setQuickCategoryId: (id: string) => void;
    setCategoryId: (id: string | null) => void;
    setBrandId: (id: string | null) => void;
    setSearch: (value: string) => void;
    setSortBy: (sort: UvhCatalogueSort) => void;
    setPageIndex: (index: number) => void;
    setPageSize: (size: number) => void;
    clearFilters: () => void;
    removeCategory: () => void;
    removeBrand: () => void;
    removeSearch: () => void;
};

export type UseUvhProductCatalogueResult = {
    filters: UvhCatalogueFilters;
    actions: UvhCatalogueFilterActions;
    debouncedSearch: string;
    products: CatalogProductListItem[];
    totalCount: number;
    pageCount: number;
    pageSize: number;
    hasNextPage: boolean;
    loading: boolean;
    error: string | null;
    categories: CatalogCategory[];
    categoriesLoading: boolean;
    brands: CatalogBrand[];
    brandsLoading: boolean;
    quickCategories: UvhCatalogueQuickCategory[];
    selectedCategory: CatalogCategory | null;
    selectedBrand: CatalogBrand | null;
    filteredCategories: CatalogCategory[];
    filteredBrands: CatalogBrand[];
    mobileFiltersOpen: boolean;
    setMobileFiltersOpen: (open: boolean) => void;
    brandSearch: string;
    setBrandSearch: (value: string) => void;
    categorySearch: string;
    setCategorySearch: (value: string) => void;
};

function findCategoryById(categories: CatalogCategory[], id: string | null): CatalogCategory | null {
    if (!id) return null;
    return categories.find((c) => c.id === id) ?? null;
}

function findBrandById(brands: CatalogBrand[], id: string | null): CatalogBrand | null {
    if (!id) return null;
    return brands.find((b) => b.id === id) ?? null;
}

export function useUvhProductCatalogue(): UseUvhProductCatalogueResult {
    const [searchParams] = useSearchParams();
    const [quickCategoryId, setQuickCategoryIdState] = useState('all');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [brandId, setBrandId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState<UvhCatalogueSort>('name');
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSizeState] = useState(UVH_CATALOGUE_PAGE_SIZE);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [brandSearch, setBrandSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');

    const {categories, isLoading: categoriesLoading} = useCategories();
    const {brands, loading: brandsLoading} = useBrands(200);

    const categoryParamApplied = useRef(false);
    const categoryParam = searchParams.get('category');

    useEffect(() => {
        if (categoryParamApplied.current || categoriesLoading || categories.length === 0 || !categoryParam) return;
        const match = categories.find(
            (c) => c.name.toLowerCase() === categoryParam.toLowerCase(),
        );
        if (match) {
            setCategoryId(match.id);
        }
        categoryParamApplied.current = true;
    }, [categories, categoriesLoading, categoryParam]);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        setPageIndex(0);
    }, [categoryId, brandId, debouncedSearch, sortBy, pageSize]);

    const activeSource = useProducts({
        categoryId,
        brandId,
        search: debouncedSearch,
        sortBy,
        pageIndex,
        pageSize,
    });

    const rootCategories = useMemo(
        () => categories.filter((c) => c.parent == null).sort((a, b) => a.name.localeCompare(b.name)),
        [categories],
    );

    const filteredCategories = useMemo(() => {
        const needle = categorySearch.trim().toLowerCase();
        if (!needle) return rootCategories;
        return rootCategories.filter((c) => c.name.toLowerCase().includes(needle));
    }, [rootCategories, categorySearch]);

    const filteredBrands = useMemo(() => {
        const needle = brandSearch.trim().toLowerCase();
        const sorted = [...brands].sort((a, b) => a.name.localeCompare(b.name));
        if (!needle) return sorted;
        return sorted.filter((b) => b.name.toLowerCase().includes(needle));
    }, [brands, brandSearch]);

    const setQuickCategoryId = useCallback(
        (id: string) => {
            setQuickCategoryIdState(id);
            const spec = UVH_CATALOGUE_QUICK_CATEGORIES.find((item) => item.id === id);
            if (!spec || id === 'all') {
                setCategoryId(null);
                return;
            }
            const resolved = resolveRootCategoryId(categories, spec.categoryNameHints);
            setCategoryId(resolved);
        },
        [categories],
    );

    const clearFilters = useCallback(() => {
        setQuickCategoryIdState('all');
        setCategoryId(null);
        setBrandId(null);
        setSearch('');
        setDebouncedSearch('');
        setSortBy('name');
        setPageIndex(0);
        setBrandSearch('');
        setCategorySearch('');
    }, []);

    const removeCategory = useCallback(() => {
        setQuickCategoryIdState('all');
        setCategoryId(null);
    }, []);

    const removeBrand = useCallback(() => setBrandId(null), []);
    const removeSearch = useCallback(() => {
        setSearch('');
        setDebouncedSearch('');
    }, []);

    const pageCount = Math.max(1, Math.ceil(activeSource.totalCount / pageSize));

    return {
        pageSize,
        filters: {
            quickCategoryId,
            categoryId,
            brandId,
            search,
            sortBy,
            pageIndex,
        },
        actions: {
            setQuickCategoryId,
            setCategoryId: (id) => {
                setQuickCategoryIdState('all');
                setCategoryId(id);
            },
            setBrandId,
            setSearch,
            setSortBy,
            setPageIndex,
            setPageSize: setPageSizeState,
            clearFilters,
            removeCategory,
            removeBrand,
            removeSearch,
        },
        debouncedSearch,
        products: activeSource.products,
        totalCount: activeSource.totalCount,
        pageCount,
        hasNextPage: activeSource.hasNextPage,
        loading: activeSource.loading || categoriesLoading,
        error: activeSource.error,
        categories: rootCategories,
        categoriesLoading,
        brands,
        brandsLoading,
        quickCategories: UVH_CATALOGUE_QUICK_CATEGORIES,
        selectedCategory: findCategoryById(categories, categoryId),
        selectedBrand: findBrandById(brands, brandId),
        filteredCategories,
        filteredBrands,
        mobileFiltersOpen,
        setMobileFiltersOpen,
        brandSearch,
        setBrandSearch,
        categorySearch,
        setCategorySearch,
    };
}
