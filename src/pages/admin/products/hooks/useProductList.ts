import {useCallback, useEffect, useMemo, useState} from "react";


import {apiGetProductList, fetchProductCount} from "@/services/graphql/product/product.service.ts";
import {exportAllProducts} from "@/services/rest/admin/ProductExportService.rest.ts";
import {FilterRequest} from "@/types/graphql/query.types.ts";

import type {ProductListItem} from "@/types/admin/ProductTypes.ts";

const DEFAULT_PAGE_SIZE = 14;

export default function useProductList() {
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const filterRequest = useMemo<FilterRequest>(
        () => ({
            filters: [],
            filterGroups: searchTerm.trim()
                ? [
                    {
                        operator: "OR",
                        filters: [
                            {key: "name", operator: "ILIKE", value: searchTerm.trim()},
                            {key: "description", operator: "ILIKE", value: searchTerm.trim()},
                            {key: "category.name", operator: "ILIKE", value: searchTerm.trim()},
                        ],
                    },
                ]
                : [],
            sort: [{field: "name", direction: "ASC"}],
        }),
        [searchTerm]
    );

    useEffect(() => {
        let isActive = true;

        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                setErrorMsg("");

                const [page, count] = await Promise.all([
                    apiGetProductList(undefined, {pageIndex, pageSize}, filterRequest),
                    fetchProductCount(filterRequest),
                ]);

                if (!isActive) return;
                setProducts(page);
                setTotalRows(count);
            } catch (error) {
                console.error("Failed to fetch products:", error);
                if (isActive) {
                    setErrorMsg("Failed to load products.");
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        void fetchProducts();

        return () => {
            isActive = false;
        };
    }, [pageIndex, pageSize, filterRequest, refreshKey]);

    const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));

    const handlePageChange = useCallback((newPageIndex: number) => {
        setPageIndex(newPageIndex);
    }, []);

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize);
        setPageIndex(0);
    }, []);

    const handleSearchChange = useCallback((search: string) => {
        setSearchTerm(search);
        setPageIndex(0);
    }, []);

    const onExportProductsDetail = useCallback(async () => {
        try {
            setIsExporting(true);
            await exportAllProducts();
        } finally {
            setIsExporting(false);
        }
    }, []);

    const mutate = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    return {
        products,
        isLoading,
        isExporting,
        errorMsg,
        pageIndex,
        pageSize,
        totalRows,
        pageCount,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
        onSearchChange: handleSearchChange,
        onExportProducts: onExportProductsDetail,
        mutate,
    };
}
