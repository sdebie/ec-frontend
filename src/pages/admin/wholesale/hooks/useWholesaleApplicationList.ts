import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    apiGetAllWholesaleApplications,
    apiGetWholesaleApplicationCount,
} from '@/services/graphql/storefront/wholesaleCustomer/WholesaleCustomerService.graphql.ts';

import type { WholesaleApplicationListItem, WholesaleApplicationStatus } from '@/types/admin/WholesaleCustomerTypes.ts';
import type { FilterRequest } from '@/types/graphql/query.types.ts';

const DEFAULT_PAGE_SIZE = 16;

export default function useWholesaleApplicationList() {
    const [applications, setApplications] = useState<WholesaleApplicationListItem[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<WholesaleApplicationStatus | ''>('');

    const filterRequest = useMemo<FilterRequest>(() => {
        const trimmedSearch = searchTerm.trim();

        return {
            filters: [
                ...(statusFilter ? [{ key: 'status', operator: 'EQUALS' as const, value: statusFilter }] : []),
            ],
            filterGroups: trimmedSearch
                ? [
                    {
                        operator: 'OR',
                        filters: [
                            { key: 'accountEmail', operator: 'ILIKE', value: trimmedSearch },
                            { key: 'firstName', operator: 'ILIKE', value: trimmedSearch },
                            { key: 'lastName', operator: 'ILIKE', value: trimmedSearch },
                            { key: 'companyName', operator: 'ILIKE', value: trimmedSearch },
                        ],
                    },
                ]
                : [],
            sort: [{ field: 'createdAt', direction: 'DESC' }],
        };
    }, [searchTerm, statusFilter]);

    useEffect(() => {
        let isActive = true;

        const fetchApplications = async () => {
            try {
                setIsLoading(true);
                setErrorMsg('');

                const [page, count] = await Promise.all([
                    apiGetAllWholesaleApplications({ pageIndex, pageSize }, filterRequest),
                    apiGetWholesaleApplicationCount(filterRequest),
                ]);

                if (!isActive) {
                    return;
                }

                setApplications(page);
                setTotalRows(count);
            } catch (error) {
                console.error('Failed to fetch wholesale applications:', error);
                if (isActive) {
                    setErrorMsg('Failed to load wholesale applications.');
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        void fetchApplications();

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

    const handleSearchChange = useCallback((search: string) => {
        setSearchTerm(search);
        setPageIndex(0);
    }, []);

    const handleStatusFilterChange = useCallback((status: WholesaleApplicationStatus | '') => {
        setStatusFilter(status);
        setPageIndex(0);
    }, []);

    const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));

    return {
        applications,
        isLoading,
        errorMsg,
        pageIndex,
        pageSize,
        totalRows,
        pageCount,
        statusFilter,
        onPageChange: handlePageChange,
        onPageSizeChange: handlePageSizeChange,
        onSearchChange: handleSearchChange,
        onStatusFilterChange: handleStatusFilterChange,
    };
}

