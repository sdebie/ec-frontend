import {useCallback, useMemo, useState} from 'react';
import {ColumnDef} from '@tanstack/react-table';
import {Eye} from 'lucide-react';

import {Button} from '@/components';
import {DataTable} from '@/components/shared/datatable/DataTable.tsx';

import {
    WholesaleApplicationStatus,
    WholesaleApplicationStatusOptions
} from '@/constants/enums/WholesaleApplicationStatus.ts';
import {WholesaleApplicationStatusDisplay} from '@/constants/enums/WholesaleApplicationStatusDisplay.tsx';

import useWholesaleApplicationList from '@/pages/admin/wholesale/hooks/useWholesaleApplicationList.ts';
import WholesaleApplicationDetail from '@/pages/admin/wholesale/screens/detail/WholesaleApplicationDetail.tsx';

import {
    apiGetWholesaleApplication
} from '@/services/graphql/storefront/wholesaleCustomer/WholesaleCustomerService.graphql.ts';

import type {WholesaleApplicationDetails, WholesaleApplicationListItem} from '@/types/admin/WholesaleCustomerTypes.ts';

const formatDateTime = (value?: string) => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
};


const WholesaleApplicationList = () => {
    const {
        applications,
        isLoading,
        errorMsg,
        pageIndex,
        pageSize,
        totalRows,
        pageCount,
        statusFilter,
        onPageChange,
        onPageSizeChange,
        onSearchChange,
        onStatusFilterChange,
        refreshApplications,
    } = useWholesaleApplicationList();

    const [selectedApplication, setSelectedApplication] = useState<WholesaleApplicationDetails | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState('');

    const openDetails = useCallback(async (applicationId: string) => {
        try {
            setIsDetailsOpen(true);
            setIsDetailsLoading(true);
            setDetailsError('');
            const details = await apiGetWholesaleApplication(applicationId);
            setSelectedApplication(details);
        } catch (error) {
            console.error('Failed to load wholesale application details:', error);
            setDetailsError('Failed to load wholesale application details.');
            setSelectedApplication(null);
        } finally {
            setIsDetailsLoading(false);
        }
    }, []);

    const closeDetails = () => {
        setIsDetailsOpen(false);
        setSelectedApplication(null);
        setDetailsError('');
    };

    const handleStatusChange = async () => {
        await refreshApplications();
    };

    const columns: ColumnDef<WholesaleApplicationListItem>[] = useMemo(
        () => [
            {
                id: 'createdAt',
                accessorKey: 'createdAt',
                header: 'Date Submitted',
                enableSorting: false,
                cell: ({row}) => formatDateTime(row.original.createdAt),
            },
            {
                id: 'firstName',
                accessorKey: 'firstName',
                header: 'First Name',
                enableSorting: false,
                cell: ({row}) => row.original.firstName ?? '-',
            },
            {
                id: 'lastName',
                accessorKey: 'lastName',
                header: 'Last Name',
                enableSorting: false,
                cell: ({row}) => row.original.lastName ?? '-',
            },
            {
                id: 'email',
                accessorKey: 'email',
                header: 'Email',
                enableSorting: false,
                cell: ({row}) => row.original.email ?? '-',
            },
            {
                id: 'status',
                accessorKey: 'status',
                header: 'Status',
                enableSorting: false,
                cell: ({row}) => <WholesaleApplicationStatusDisplay status={row.original.status ?? ''} />,
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({row}) => (
                    <div className="flex items-start justify-center gap-2">
                        <Button variant="solid" size="sm" onClick={() => openDetails(row.original.id)}>
                            <Eye size={12}/>
                        </Button>
                    </div>
                ),
            },
        ],
        [openDetails]
    );


    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Wholesale Applications</h1>
            <DataTable<WholesaleApplicationListItem>
                data={applications}
                columns={columns}
                isLoading={isLoading}
                errorMsg={errorMsg}
                globalSearchPlaceholder="Search by name, email, or company..."
                manualPagination
                serverPageIndex={pageIndex}
                serverPageSize={pageSize}
                serverTotalRows={totalRows}
                serverPageCount={pageCount}
                onServerPageChange={onPageChange}
                onServerPageSizeChange={onPageSizeChange}
                onServerSearchChange={onSearchChange}
                toolbarAction={
                    <select
                        className="h-10 rounded-md border border-admin-border bg-admin-panel px-3 text-sm text-admin-text"
                        value={statusFilter}
                        onChange={(e) => onStatusFilterChange((e.target.value || '') as WholesaleApplicationStatus | '')}
                    >
                        <option value="">All statuses</option>
                        {WholesaleApplicationStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                }
            />

            <WholesaleApplicationDetail
                isOpen={isDetailsOpen}
                isLoading={isDetailsLoading}
                error={detailsError}
                selectedApplication={selectedApplication}
                onClose={closeDetails}
                onStatusChange={handleStatusChange}
            />
        </>
    );
}

export default WholesaleApplicationList;