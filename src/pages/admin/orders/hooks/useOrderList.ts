import {useCallback, useEffect, useMemo, useState} from "react";
import {apiGetAllOrders} from "@/services/graphql/order/OrderService.graphql.ts";
import {FilterRequest} from "@/types/graphql/query.types.ts";
import {OrderData} from "@/types/order.types.ts";

const DEFAULT_PAGE_SIZE = 11;

export default function useOrderList() {
    const [orderList, setOrderList] = useState<OrderData[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const filterRequest = useMemo<FilterRequest>(
        () => ({
            filters: searchTerm.trim()
                ? [{key: "status", operator: "ILIKE", value: searchTerm.trim()}]
                : [],
            filterGroups: [],
            sort: [{field: "createdAt", direction: "DESC"}],
        }),
        [searchTerm]
    );

    useEffect(() => {
        let isActive = true;

        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                setErrorMsg("");

                const page = await apiGetAllOrders({pageIndex, pageSize}, filterRequest);
                if (!isActive) {
                    return;
                }

                setOrderList(page);

                // We do not have an orderCount endpoint yet, so estimate if there is a next page.
                const hasNextPage = page.length >= pageSize;
                const estimatedRows = hasNextPage
                    ? (pageIndex + 1) * pageSize + 1
                    : pageIndex * pageSize + page.length;
                setTotalRows(Math.max(estimatedRows, page.length));
            } catch (error) {
                console.error("Failed to fetch orders:", error);
                if (isActive) {
                    setErrorMsg("Failed to load orders.");
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        void fetchOrders();

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
        setRefreshKey((k) => k + 1);
    }, []);

    const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));

    return {
        orders: orderList,
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

