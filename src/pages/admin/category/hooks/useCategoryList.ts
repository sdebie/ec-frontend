import {useCallback, useEffect, useMemo, useState} from "react";
import {Category} from "@/types/admin/CategoryTypes.ts";
import {FilterRequest} from "@/types/graphql/query.types.ts";
import {apiGetAllCategories, apiGetCategoryCount} from "@/services/graphql/admin/category/CategoryService.ts";

const DEFAULT_PAGE_SIZE = 10;

export default function useCategoryList() {

    const [categoryList, setCategoryList] = useState<Category[]>([]);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const filterRequest = useMemo<FilterRequest>(() => ({
        filters: [],
        filterGroups: searchTerm.trim() ?
            [
                {
                    operator: "OR",
                    filters: [
                        {
                            key: "name",
                            operator: "ILIKE",
                            value: searchTerm.trim(),
                        },
                        {
                            key: "description",
                            operator: "ILIKE",
                            value: searchTerm.trim(),
                        }
                    ],
                }
            ] : [],
        sort: [
            {
                field: "name",
                direction: "ASC"
            }],
    }), [searchTerm]);

    useEffect(() => {
        let isActive = true;

        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                setErrorMsg("");

                const [page, count] = await Promise.all([
                    apiGetAllCategories({pageIndex, pageSize}, filterRequest),
                    apiGetCategoryCount(filterRequest),
                ]);

                if (!isActive) return;

                setCategoryList(page);
                setTotalRows(count);

            } catch (error) {
                console.error("Failed to fetch categories:", error);
                if (isActive) {
                    setErrorMsg("Failed to load categories.");
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        void fetchCategories();

        return () => {
            isActive = false;
        };
    }, [pageIndex, pageSize, refreshKey, filterRequest]);

    const handlePageChange = useCallback((newPageIndex: number) => {
        setPageIndex(newPageIndex);
    }, []);

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize);
        setPageIndex(0); // Reset to the first page when the page size changes
    }, []);

    const handleSearchChange = useCallback((searchTerm: string) => {
        setSearchTerm(searchTerm);
        setPageIndex(0);
    }, []);

    const mutate = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));

    return {
        categories: categoryList,
        isLoading,
        errorMsg,
        pageIndex,
        pageSize,
        totalRows,
        pageCount,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
        onSearchChange: handleSearchChange,
        mutate,
    }
}