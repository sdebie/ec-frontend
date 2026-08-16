import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table'
import { CircleCheck, Eye, OctagonPause } from 'lucide-react'

import type { ColumnDef } from '@/shared/ui/components'
import {
    ConfirmationDialog,
    DataTable,
    RowActionButton,
    WholesaleCustomerStatusDisplay,
} from '@/shared/ui/components'
import { formatDateTime } from '@/shared/utils/formatDateTime'
import { maskEmail } from '@/shared/utils/maskEmail'
import { getAvailableActions } from '@/admin/pages/customers/types'
import type { WholesaleCustomerListItem } from '../types'
import { useWholesaleCustomerStatusAction } from '../hooks/useWholesaleCustomerStatusAction'

interface WholesaleCustomerListTableProps {
    data: WholesaleCustomerListItem[]
    isLoading: boolean
    canMutate: boolean
    pageCount: number
    totalRowCount: number
    pagination: PaginationState
    onPaginationChange: OnChangeFn<PaginationState>
    sorting: SortingState
    onSortingChange: OnChangeFn<SortingState>
}

/**
 * Owns the status-transition mutation and the confirmation dialog that guards
 * Suspend, mirroring how OrderTable owns its own status-update dialog rather
 * than lifting that state into the page.
 */
export function WholesaleCustomerListTable({
    data,
    isLoading,
    canMutate,
    pageCount,
    totalRowCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
}: WholesaleCustomerListTableProps) {
    const navigate = useNavigate()

    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; customerId: string }>({
        open: false,
        customerId: '',
    })

    const {mutate: updateWholesaleCustomerStatus, isPending: isUpdatingStatus} = useWholesaleCustomerStatusAction()

    const handleActivate = useCallback((customerId: string) => {
        updateWholesaleCustomerStatus({customerId, status: 'ACTIVE'})
    }, [updateWholesaleCustomerStatus])

    const handleSuspend = useCallback((customerId: string) => {
        setConfirmDialog({open: true, customerId})
    }, [])

    const handleConfirmSuspend = () => {
        const {customerId} = confirmDialog
        updateWholesaleCustomerStatus(
            {customerId, status: 'DISABLED'},
            {onSettled: () => setConfirmDialog((prev) => ({...prev, open: false}))},
        )
    }

    const handleCloseDialog = () => {
        setConfirmDialog((prev) => ({...prev, open: false}))
    }

    const columns = useMemo<ColumnDef<WholesaleCustomerListItem, unknown>[]>(
        () => [
            {
                // Same accessorKey/id split as email: registeredAt is customer.user.createdAt.
                accessorKey: 'registeredAt',
                id: 'user.createdAt',
                header: 'Registered Date',
                cell: ({row}) => (
                    <span className="whitespace-nowrap">
                        {formatDateTime(row.original.registeredAt)}
                    </span>
                ),
            },
            {
                // Not sortable: concatenates firstName + lastName, no single backend field.
                id: 'name',
                header: 'Name',
                enableSorting: false,
                cell: ({row}) => (
                    <Link
                        to={`/admin/wholesale/customers/${row.original.id}`}
                        className="text-(--c-accent) hover:underline"
                    >
                        {row.original.firstName} {row.original.lastName}
                    </Link>
                ),
            },
            {
                // accessorKey stays 'email' (the flattened DTO field, needed for TanStack to
                // treat the header as clickable); id is overridden to 'user.email', the real
                // column — email lives on the linked UserEntity, and that id is sent to the
                // server unmodified as the sort key.
                accessorKey: 'email',
                id: 'user.email',
                header: 'Email',
                cell: ({row}) => <span>{maskEmail(row.original.email)}</span>,
            },
            {
                accessorKey: 'status',
                header: 'Account Status',
                cell: ({row}) => <WholesaleCustomerStatusDisplay status={row.original.status}/>,
            },
            {
                id: 'actions',
                header: 'Actions',
                enableSorting: false,
                cell: ({row}) => {
                    const customer = row.original
                    const actions = canMutate ? getAvailableActions(customer.status) : []
                    return (
                        <div className="flex items-center gap-1">
                            <RowActionButton
                                onClick={() => navigate(`/admin/wholesale/customers/${customer.id}`)}
                                aria-label="View customer"
                                data-testid="action-view"
                            >
                                <Eye className="h-4 w-4"/>
                            </RowActionButton>
                            {actions.includes('suspend') && (
                                <RowActionButton
                                    onClick={() => handleSuspend(customer.id)}
                                    variant="danger"
                                    aria-label="Suspend customer"
                                    disabled={isUpdatingStatus}
                                >
                                    <OctagonPause className="h-4 w-4"/>
                                </RowActionButton>
                            )}
                            {actions.includes('activate') && (
                                <RowActionButton
                                    onClick={() => handleActivate(customer.id)}
                                    aria-label="Activate customer"
                                    disabled={isUpdatingStatus}
                                >
                                    <CircleCheck className="h-4 w-4"/>
                                </RowActionButton>
                            )}
                        </div>
                    )
                },
            } as ColumnDef<WholesaleCustomerListItem, unknown>,
        ],
        [canMutate, handleActivate, handleSuspend, isUpdatingStatus, navigate],
    )

    return (
        <>
            <DataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
                manualPagination
                pageCount={pageCount}
                totalRowCount={totalRowCount}
                pagination={pagination}
                onPaginationChange={onPaginationChange}
                manualSorting
                sorting={sorting}
                onSortingChange={onSortingChange}
                onRowDoubleClick={(row) => navigate(`/admin/wholesale/customers/${row.id}`)}
            />

            <ConfirmationDialog
                open={confirmDialog.open}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmSuspend}
                title="Suspend Wholesale Customer"
                description="Are you sure you want to suspend this wholesale customer? They will no longer be able to access the storefront."
                variant="danger"
                confirmLabel="Suspend Customer"
                isLoading={isUpdatingStatus}
            />
        </>
    )
}
