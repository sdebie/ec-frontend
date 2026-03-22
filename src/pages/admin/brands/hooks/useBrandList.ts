import {useCallback, useEffect, useMemo, useState} from "react";
import {apiGetAllBrands, apiGetBrandCount} from "@/services/graphql/admin/brand/brand.service.ts";
import {Brand} from "@/services/graphql/admin/brand/brand.types.ts";
import {FilterRequest} from "@/types/graphql/query.types.ts";

const DEFAULT_PAGE_SIZE = 10;

export default function useBrandList() {

    const [brandList, setBrandList] = useState<Brand[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const filterRequest = useMemo<FilterRequest>(
        () => ({
            filters: [],
            filterGroups: [],
            sort: [{field: "name", direction: "ASC"}],
        }),
        []
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
    }, [pageIndex, pageSize, filterRequest]);

    const handlePageChange = useCallback((newPageIndex: number) => {
        setPageIndex(newPageIndex);
    }, []);

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize);
        setPageIndex(0);
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
    };
}
