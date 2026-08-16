import {useCallback, useMemo, useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import type {OnChangeFn, PaginationState, SortingState} from '@tanstack/react-table'
import {CircleCheck, Eye, OctagonPause} from 'lucide-react'

import type {ColumnDef} from '@/shared/ui/components'
import {ConfirmationDialog, DataTable, RowActionButton, StatusBadge} from '@/shared/ui/components'
import {formatDateTime} from '@/shared/utils/formatDateTime'
import {getAvailableActions, getCustomerStatusColor} from '../../types'
import type {AdminCustomerSummary} from '../../types'
import {useUpdateCustomerStatus} from '../../hooks/useUpdateCustomerStatus'

interface CustomerTableProps {
    data: AdminCustomerSummary[]
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
 * Suspend, mirroring how WholesaleCustomerListTable owns its own status-update
 * dialog rather than lifting that state into the page.
 */
export function CustomerTable({
                                   data,
                                   isLoading,
                                   canMutate,
                                   pageCount,
                                   totalRowCount,
                                   pagination,
                                   onPaginationChange,
                                   sorting,
                                   onSortingChange,
                               }: CustomerTableProps) {
    const navigate = useNavigate()

    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; customerId: string }>({
        open: false,
        customerId: '',
    })

    const {mutate: updateCustomerStatus, isPending: isUpdatingStatus} = useUpdateCustomerStatus()

    const handleActivate = useCallback((customerId: string) => {
        updateCustomerStatus({customerId, status: 'ACTIVE'})
    }, [updateCustomerStatus])

    const handleSuspend = useCallback((customerId: string) => {
        setConfirmDialog({open: true, customerId})
    }, [])

    const handleConfirmSuspend = () => {
        const {customerId} = confirmDialog
        updateCustomerStatus(
            {customerId, status: 'DISABLED'},
            {onSettled: () => setConfirmDialog((prev) => ({...prev, open: false}))},
        )
    }

    const handleCloseDialog = () => {
        setConfirmDialog((prev) => ({...prev, open: false}))
    }

    const columns = useMemo<ColumnDef<AdminCustomerSummary, unknown>[]>(
        () => [
            {
                // Same accessorKey/id split as email: registeredAt is customer.user.createdAt,
                // one hop through the same join.
                accessorKey: 'registeredAt',
                id: 'user.createdAt',
                header: 'Registered',
                cell: ({row}) => (
                    <span className="whitespace-nowrap">{formatDateTime(row.original.registeredAt)}</span>
                ),
            },
            {
                // Not sortable: concatenates firstName + lastName, and there is no single
                // backend field a "full name" sort could map to.
                id: 'name',
                header: 'Name',
                enableSorting: false,
                cell: ({row}) => (
                    <Link
                        to={`/admin/customers/${row.original.id}`}
                        className="text-(--c-accent) hover:underline"
                    >
                        {row.original.firstName} {row.original.lastName}
                    </Link>
                ),
            },
            {
                // accessorKey stays 'email' (the flattened DTO field, needed for TanStack to
                // treat the header as clickable); id is overridden to 'user.email', the real
                // column — email lives on the linked UserEntity, not on Customer itself, and
                // that id is sent to the server unmodified as the sort key.
                accessorKey: 'email',
                id: 'user.email',
                header: 'Email',
            },
            {
                accessorKey: 'shopperType',
                header: 'Type',
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({row}) => (
                    <StatusBadge
                        label={row.original.status}
                        color={getCustomerStatusColor(row.original.status)}
                    />
                ),
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
                                onClick={() => navigate(`/admin/customers/${customer.id}`)}
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
            } as ColumnDef<AdminCustomerSummary, unknown>,
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
                onRowDoubleClick={(row) => navigate(`/admin/customers/${row.id}`)}
            />

            <ConfirmationDialog
                open={confirmDialog.open}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmSuspend}
                title="Suspend Customer"
                description="Are you sure you want to suspend this customer? They will no longer be able to access the storefront."
                variant="danger"
                confirmLabel="Suspend Customer"
                isLoading={isUpdatingStatus}
            />
        </>
    )
}
