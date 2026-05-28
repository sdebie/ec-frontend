import {useCallback, useEffect, useMemo, useState} from "react";

import {apiGetStaffCount, apiGetStaffList} from "@/services/graphql/admin/staff/StaffService.graphql.ts";

import type {Staff} from "@/types/admin/StaffTypes.ts";
import type {FilterRequest} from "@/types/graphql/query.types.ts";


const DEFAULT_PAGE_SIZE = 15;

export default function useStaffList() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const filterRequest = useMemo<FilterRequest>(
        () => ({
            filters: [],
            filterGroups: searchTerm.trim()
                ? [
                    {
                        operator: "OR",
                        filters: [
                            {key: "email", operator: "ILIKE", value: searchTerm.trim()},
                            {key: "fullName", operator: "ILIKE", value: searchTerm.trim()},
                        ],
                    },
                ]
                : [],
            sort: [{field: "createdAt", direction: "DESC"}],
        }),
        [searchTerm]
    );

    useEffect(() => {
        let isActive = true;

        const fetchStaff = async () => {
            try {
                setIsLoading(true);
                setErrorMsg("");

                const [page, count] = await Promise.all([
                    apiGetStaffList({pageIndex, pageSize}, filterRequest),
                    apiGetStaffCount(filterRequest),
                ]);

                if (!isActive) return;

                setStaffList(page);
                setTotalRows(count);
            } catch (error) {
                console.error("Failed to fetch staff:", error);
                if (isActive) {
                    setErrorMsg("Failed to load staff users.");
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        void fetchStaff();

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

    const handleSearchChange = useCallback((search: string) => {
        setSearchTerm(search);
        setPageIndex(0);
    }, []);

    const mutate = useCallback(() => {
        setRefreshKey(k => k + 1);
    }, []);

    const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));

    return {
        staff: staffList,
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

