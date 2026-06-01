import {useCallback, useEffect, useMemo, useState} from "react";
import {apiGetAllBrands, apiGetBrandCount} from "@/services/graphql/admin/brand/BrandService.graphql.ts";
import {Brand} from "@/types/admin/BrandTypes.ts";
import {FilterRequest} from "@/types/graphql/query.types.ts";

const DEFAULT_PAGE_SIZE = 25;

export default function useBrandList() {

    const [brandList, setBrandList] = useState<Brand[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    // Build filter dynamically so the server always receives the current search term.
    // When the search term changes, an OR-group is sent: name ILIKE %term% OR description ILIKE %term%.
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

        const fetchBrands = async () => {
            try {
                setIsLoading(true);
                setErrorMsg("");

                const [page, count] = await Promise.all([
                    apiGetAllBrands({pageIndex, pageSize}, filterRequest),
                    apiGetBrandCount(filterRequest),
                ]);

                if (!isActive) return;

                setBrandList(page);
                setTotalRows(count);
            } catch (error) {
                console.error("Failed to fetch brands:", error);
                if (isActive) {
                    setErrorMsg("Failed to load brands.");
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        void fetchBrands();

        return () => {
            isActive = false;
        };
    }, [pageIndex, pageSize, filterRequest, refreshKey]);

    const handlePageChange = useCallback((newPageIndex: number) => {
        setPageIndex(newPageIndex);
    }, []);

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize);
        setPageIndex(0);
    }, []);

    // When the search term changes, atomically reset to page 0 so we never show
    // an empty page because the old page index is beyond the new result set.
    const handleSearchChange = useCallback((search: string) => {
        setSearchTerm(search);
        setPageIndex(0);
    }, []);

    const mutate = useCallback(() => {
        setRefreshKey(k => k + 1);
    }, []);

    const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));

    return {
        brands: brandList,
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
    };
}
