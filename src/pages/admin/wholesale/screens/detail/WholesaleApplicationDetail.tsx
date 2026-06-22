import {useState} from 'react';
import {Button, Dialog, DialogContent, DialogFooter, DialogHeader} from '@/components';
import {WholesaleApplicationStatus} from '@/constants/enums/WholesaleApplicationStatus.ts';

import {
    apiApproveWholesaleApplication,
    apiRejectWholesaleApplication,
} from '@/services/graphql/storefront/wholesaleCustomer/WholesaleCustomerService.graphql.ts';

import type {WholesaleApplicationDetails} from '@/types/admin/WholesaleCustomerTypes.ts';

const formatDateTime = (value?: string) => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
};

interface WholesaleApplicationDetailProps {
    isOpen: boolean;
    isLoading: boolean;
    error: string;
    selectedApplication: WholesaleApplicationDetails | null;
    onClose: () => void;
    onStatusChange?: () => Promise<void> | void;
}

const WholesaleApplicationDetail = ({
    isOpen,
    isLoading,
    error,
    selectedApplication,
    onClose,
    onStatusChange,
}: WholesaleApplicationDetailProps) => {
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    const handleApprove = async () => {
        if (!selectedApplication?.id) return;

        try {
            setIsActionLoading(true);
            setActionError('');
            await apiApproveWholesaleApplication(selectedApplication.id);
            onClose();
            await onStatusChange?.();
        } catch (err) {
            console.error('Failed to approve wholesale application:', err);
            setActionError('Failed to approve application.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedApplication?.id) return;

        try {
            setIsActionLoading(true);
            setActionError('');
            await apiRejectWholesaleApplication(selectedApplication.id);
            onClose();
            await onStatusChange?.();
        } catch (err) {
            console.error('Failed to reject wholesale application:', err);
            setActionError('Failed to reject application.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const isPending = selectedApplication?.status === WholesaleApplicationStatus.PENDING;
    const detailsRows: Array<{ label: string; value?: string | null }> = [
        {label: 'Application ID', value: selectedApplication?.id},
        {label: 'Status', value: selectedApplication?.status},
        {label: 'Submitted At', value: formatDateTime(selectedApplication?.createdAt)},
        {label: 'Processed At', value: formatDateTime(selectedApplication?.processedAt)},
        {label: 'Customer ID', value: selectedApplication?.customerId},
        {label: 'Email', value: selectedApplication?.email},
        {label: 'First Name', value: selectedApplication?.firstName},
        {label: 'Last Name', value: selectedApplication?.lastName},
        {label: 'Phone', value: selectedApplication?.phone},
        {label: 'Company', value: selectedApplication?.companyName},
        {label: 'VAT Number', value: selectedApplication?.vatNumber},
        {label: 'Registration Number', value: selectedApplication?.regNumber},
        {label: 'Notes', value: selectedApplication?.notes},
        {label: 'Physical Address Line 1', value: selectedApplication?.physicalAddressLine1},
        {label: 'Physical Address Line 2', value: selectedApplication?.physicalAddressLine2},
        {label: 'Physical Suburb', value: selectedApplication?.physicalSuburb},
        {label: 'Physical City', value: selectedApplication?.physicalCity},
        {label: 'Physical Province', value: selectedApplication?.physicalProvince},
        {label: 'Physical Postal Code', value: selectedApplication?.physicalPostalCode},
        {label: 'Postal Address Line 1', value: selectedApplication?.postalAddressLine1},
        {label: 'Postal Address Line 2', value: selectedApplication?.postalAddressLine2},
        {label: 'Postal Suburb', value: selectedApplication?.postalSuburb},
        {label: 'Postal City', value: selectedApplication?.postalCity},
        {label: 'Postal Province', value: selectedApplication?.postalProvince},
        {label: 'Postal Postal Code', value: selectedApplication?.postalPostalCode},
    ];

    return (
        <Dialog open={isOpen} onClose={onClose} size="lg">
            <DialogHeader
                title="Wholesale Application Details"
                description="Complete application data from the detail endpoint."
            />
            <DialogContent>
                {isLoading ? (
                    <p className="text-sm text-admin-text-muted">Loading details...</p>
                ) : error ? (
                    <p className="text-sm text-red-500">{error}</p>
                ) : (
                    <>
                        {actionError && <p className="mb-4 text-sm text-red-500">{actionError}</p>}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {detailsRows.map((item) => (
                                <div key={item.label} className="rounded-md border border-admin-border p-3">
                                    <p className="text-xs uppercase tracking-wide text-admin-text-muted">{item.label}</p>
                                    <p className="mt-1 text-sm text-admin-text wrap-break-word">{item.value || '-'}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </DialogContent>
            <DialogFooter>
                {isPending && (
                    <>
                        <Button
                            variant="solid"
                            onClick={handleReject}
                            disabled={isActionLoading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isActionLoading ? 'Processing...' : 'Reject'}
                        </Button>
                        <Button
                            variant="solid"
                            onClick={handleApprove}
                            disabled={isActionLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isActionLoading ? 'Processing...' : 'Approve'}
                        </Button>
                    </>
                )}
                <Button variant="solid" onClick={onClose} disabled={isActionLoading}>
                    Close
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default WholesaleApplicationDetail;

