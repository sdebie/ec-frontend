
import { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Button, Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components';
import { DataTable } from '@/components/shared/datatable/DataTable.tsx';
import { WholesaleApplicationStatus, WholesaleApplicationStatusOptions, getWholesaleApplicationStatus } from '@/constants/enums/WholesaleApplicationStatus.ts';
import useWholesaleApplicationList from '@/pages/admin/wholesale/hooks/useWholesaleApplicationList.ts';
import { apiGetWholesaleApplication } from '@/services/graphql/storefront/wholesaleCustomer/WholesaleCustomerService.graphql.ts';

import type { WholesaleApplicationDetails, WholesaleApplicationListItem } from '@/types/admin/WholesaleCustomerTypes.ts';

const formatDateTime = (value?: string) => {
	if (!value) {
		return '-';
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
};

const renderStatus = (status?: string) => {
	const mapped = getWholesaleApplicationStatus(status ?? '');
	if (!mapped) {
		return status || '-';
	}

	return (
		<span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${mapped.colorClass}`}>
			{mapped.label}
		</span>
	);
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

	const columns: ColumnDef<WholesaleApplicationListItem>[] = useMemo(
		() => [
			{
				id: 'createdAt',
				accessorKey: 'createdAt',
				header: 'Date Submitted',
				enableSorting: false,
				cell: ({ row }) => formatDateTime(row.original.createdAt),
			},
			{
				id: 'status',
				accessorKey: 'status',
				header: 'Status',
				enableSorting: false,
				cell: ({ row }) => renderStatus(row.original.status),
			},
			{
				id: 'actions',
				header: 'Actions',
				enableSorting: false,
				cell: ({ row }) => (
					<div className="flex items-start justify-center gap-2">
						<Button variant="solid" size="sm" onClick={() => openDetails(row.original.id)}>
							<Eye size={12} />
						</Button>
					</div>
				),
			},
		],
		[openDetails]
	);

	const detailsRows: Array<{ label: string; value?: string | null }> = [
		{ label: 'Application ID', value: selectedApplication?.id },
		{ label: 'Status', value: selectedApplication?.status },
		{ label: 'Submitted At', value: formatDateTime(selectedApplication?.createdAt) },
		{ label: 'Processed At', value: formatDateTime(selectedApplication?.processedAt) },
		{ label: 'Customer ID', value: selectedApplication?.customerId },
		{ label: 'Email', value: selectedApplication?.email },
		{ label: 'First Name', value: selectedApplication?.firstName },
		{ label: 'Last Name', value: selectedApplication?.lastName },
		{ label: 'Phone', value: selectedApplication?.phone },
		{ label: 'Company', value: selectedApplication?.companyName },
		{ label: 'VAT Number', value: selectedApplication?.vatNumber },
		{ label: 'Registration Number', value: selectedApplication?.regNumber },
		{ label: 'Notes', value: selectedApplication?.notes },
		{ label: 'Physical Address Line 1', value: selectedApplication?.physicalAddressLine1 },
		{ label: 'Physical Address Line 2', value: selectedApplication?.physicalAddressLine2 },
		{ label: 'Physical Suburb', value: selectedApplication?.physicalSuburb },
		{ label: 'Physical City', value: selectedApplication?.physicalCity },
		{ label: 'Physical Province', value: selectedApplication?.physicalProvince },
		{ label: 'Physical Postal Code', value: selectedApplication?.physicalPostalCode },
		{ label: 'Postal Address Line 1', value: selectedApplication?.postalAddressLine1 },
		{ label: 'Postal Address Line 2', value: selectedApplication?.postalAddressLine2 },
		{ label: 'Postal Suburb', value: selectedApplication?.postalSuburb },
		{ label: 'Postal City', value: selectedApplication?.postalCity },
		{ label: 'Postal Province', value: selectedApplication?.postalProvince },
		{ label: 'Postal Postal Code', value: selectedApplication?.postalPostalCode },
	];

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

			<Dialog open={isDetailsOpen} onClose={closeDetails} size="lg">
				<DialogHeader
					title="Wholesale Application Details"
					description="Complete application data from the detail endpoint."
				/>
				<DialogContent>
					{isDetailsLoading ? (
						<p className="text-sm text-admin-text-muted">Loading details...</p>
					) : detailsError ? (
						<p className="text-sm text-red-500">{detailsError}</p>
					) : (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							{detailsRows.map((item) => (
								<div key={item.label} className="rounded-md border border-admin-border p-3">
									<p className="text-xs uppercase tracking-wide text-admin-text-muted">{item.label}</p>
									<p className="mt-1 text-sm text-admin-text wrap-break-word">{item.value || '-'}</p>
								</div>
							))}
						</div>
					)}
				</DialogContent>
				<DialogFooter>
					<Button variant="solid" onClick={closeDetails}>Close</Button>
				</DialogFooter>
			</Dialog>
		</>
	);
}

export default WholesaleApplicationList;