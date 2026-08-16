import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { OnChangeFn, PaginationState, SortingState } from '@tanstack/react-table'
import { EllipsisVertical } from 'lucide-react'

import type { ColumnDef } from '@/shared/ui/components'
import {
    ConfirmationDialog,
    DataTable,
    DropdownItem,
    DropdownMenu,
    RowActionButton,
    WholesaleApplicationStatusDisplay,
    WholesaleCustomerStatusDisplay,
} from '@/shared/ui/components'
import { formatDateTime } from '@/shared/utils/formatDateTime'
import { maskEmail } from '@/shared/utils/maskEmail'
import { getAvailableActions, type WholesaleStatus } from '@/admin/hooks/customers/types'
import type { WholesaleCustomerListItem } from '../hooks'
import { useWholesaleCustomerStatusAction } from '../hooks'

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
                // Not sortable: resolved per row from a separate WholesaleApplicationEntity
                // lookup (CustomerAdminService.wholesaleApplicationFor), not a JPQL property on
                // CustomerEntity — there is no column here to sort by.
                id: 'wholesaleApplicationStatus',
                header: 'Application Status',
                enableSorting: false,
                cell: ({row}) => {
                    const appStatus = row.original.wholesaleApplicationStatus
                    if (!appStatus) return '—'
                    return <WholesaleApplicationStatusDisplay status={appStatus as WholesaleStatus}/>
                },
            },
            ...(canMutate
                ? [
                    {
                        id: 'actions',
                        header: 'Actions',
                        enableSorting: false,
                        cell: ({row}: { row: { original: WholesaleCustomerListItem } }) => {
                            const customer = row.original
                            const actions = getAvailableActions(customer.status)
                            if (actions.length === 0) return null
                            return (
                                <DropdownMenu
                                    trigger={
                                        <RowActionButton
                                            as="span"
                                            aria-label="Customer actions"
                                            className={isUpdatingStatus ? 'opacity-50 pointer-events-none' : undefined}
                                        >
                                            <EllipsisVertical className="h-5 w-5"/>
                                        </RowActionButton>
                                    }
                                >
                                    {actions.map((action) =>
                                        action === 'activate' ? (
                                            <DropdownItem key={action} onClick={() => handleActivate(customer.id)}>
                                                Activate
                                            </DropdownItem>
                                        ) : (
                                            <DropdownItem key={action} onClick={() => handleSuspend(customer.id)}
                                                          destructive>
                                                Suspend
                                            </DropdownItem>
                                        ),
                                    )}
                                </DropdownMenu>
                            )
                        },
                    } as ColumnDef<WholesaleCustomerListItem, unknown>,
                ]
                : []),
        ],
        [canMutate, handleActivate, handleSuspend, isUpdatingStatus],
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
