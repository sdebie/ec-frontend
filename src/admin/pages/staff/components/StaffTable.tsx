import {useCallback, useMemo, useState} from 'react'
import {CircleCheck, OctagonPause, Pencil} from 'lucide-react'
import type {OnChangeFn, PaginationState, SortingState} from '@tanstack/react-table'

import type {ColumnDef} from '@/shared/ui/components'
import {ConfirmationDialog, DataTable, RowActionButton, StatusBadge} from '@/shared/ui/components'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {StaffRoleLabels} from '@/shared/types/enums/StaffRoles'
import {useUpdateStaff} from '../hooks/useUpdateStaff'
import type {StaffMember} from '../hooks/types'

const ROLE_COLORS: Record<StaffMember['role'], string> = {
    SUPER_ADMIN: 'blue',
    CATALOG_MANAGER: 'purple',
    ORDER_MANAGER: 'green',
    VIEWER: 'gray',
}

interface StaffTableProps {
    data: StaffMember[]
    isLoading: boolean
    canMutate: boolean
    pageCount: number
    totalRowCount: number
    pagination: PaginationState
    onPaginationChange: OnChangeFn<PaginationState>
    sorting: SortingState
    onSortingChange: OnChangeFn<SortingState>
    onEdit: (staff: StaffMember) => void
}

function buildToggleDto(staff: StaffMember, isActive: boolean) {
    return {
        email: staff.email,
        fullName: staff.fullName ?? '',
        role: staff.role,
        isActive,
        resetPassword: false,
    }
}

export function StaffTable({
                               data,
                               isLoading,
                               canMutate,
                               pageCount,
                               totalRowCount,
                               pagination,
                               onPaginationChange,
                               sorting,
                               onSortingChange,
                               onEdit,
                           }: StaffTableProps) {
    const userId = useAdminAuthStore((s) => s.userId)
    const {mutate: updateStaff, isPending} = useUpdateStaff()
    const [deactivating, setDeactivating] = useState<StaffMember | null>(null)

    const handleActivate = useCallback(
        (staff: StaffMember) => {
            updateStaff({id: staff.id, staffDto: buildToggleDto(staff, true)})
        },
        [updateStaff],
    )

    const handleConfirmDeactivate = () => {
        if (!deactivating) return
        updateStaff(
            {id: deactivating.id, staffDto: buildToggleDto(deactivating, false)},
            {onSuccess: () => setDeactivating(null)},
        )
    }

    const columns = useMemo<ColumnDef<StaffMember, unknown>[]>(
        () => [
            {
                accessorKey: 'fullName',
                header: 'Name',
                cell: ({row}) => row.original.fullName ?? '—',
            },
            {
                accessorKey: 'email',
                header: 'Email',
            },
            {
                accessorKey: 'role',
                header: 'Role',
                cell: ({row}) => (
                    <StatusBadge
                        label={StaffRoleLabels[row.original.role]}
                        color={ROLE_COLORS[row.original.role]}
                    />
                ),
            },
            {
                // Not sortable: this column has no accessorKey (its id, 'active', is a display
                // name only) and the underlying entity field is boolean isActive — whether that
                // resolves in JPQL as `isActive` or `active` needs checking against the entity
                // before this could be wired to a real sort key.
                id: 'active',
                header: 'Active',
                enableSorting: false,
                cell: ({row}) => (
                    <StatusBadge
                        label={row.original.active ? 'Active' : 'Inactive'}
                        color={row.original.active ? 'green' : 'gray'}
                    />
                ),
            },
            ...(canMutate
                ? [
                    {
                        id: 'actions',
                        header: 'Actions',
                        enableSorting: false,
                        cell: ({row}: { row: { original: StaffMember } }) => {
                            const staff = row.original
                            const isSelf = userId === staff.id
                            const label = staff.fullName ?? staff.email
                            return (
                                <div className="flex items-center gap-1">
                                    <RowActionButton
                                        onClick={() => onEdit(staff)}
                                        aria-label={`Edit ${label}`}
                                        data-testid="action-edit"
                                    >
                                        <Pencil className="h-4 w-4"/>
                                    </RowActionButton>
                                    {!isSelf && staff.active && (
                                        <RowActionButton
                                            onClick={() => setDeactivating(staff)}
                                            variant="danger"
                                            aria-label={`Deactivate ${label}`}
                                            disabled={isPending}
                                            data-testid="action-deactivate"
                                        >
                                            <OctagonPause className="h-4 w-4"/>
                                        </RowActionButton>
                                    )}
                                    {!isSelf && !staff.active && (
                                        <RowActionButton
                                            onClick={() => handleActivate(staff)}
                                            aria-label={`Activate ${label}`}
                                            disabled={isPending}
                                            data-testid="action-activate"
                                        >
                                            <CircleCheck className="h-4 w-4"/>
                                        </RowActionButton>
                                    )}
                                </div>
                            )
                        },
                    } as ColumnDef<StaffMember, unknown>,
                ]
                : []),
        ],
        [canMutate, userId, isPending, onEdit, handleActivate],
    )

    return (
        <>
            <DataTable
                columns={columns}
                data={data}
                isLoading={isLoading}
                showSearch={false}
                manualPagination
                pageCount={pageCount}
                totalRowCount={totalRowCount}
                pagination={pagination}
                onPaginationChange={onPaginationChange}
                manualSorting
                sorting={sorting}
                onSortingChange={onSortingChange}
                onRowDoubleClick={canMutate ? onEdit : undefined}
                emptyMessage="No staff members found"
            />

            <ConfirmationDialog
                open={deactivating !== null}
                onClose={() => setDeactivating(null)}
                onConfirm={handleConfirmDeactivate}
                title="Deactivate staff member"
                description={`Are you sure you want to deactivate ${deactivating?.fullName ?? deactivating?.email}? They will no longer be able to sign in.`}
                confirmLabel="Deactivate"
                variant="danger"
                isLoading={isPending}
            />
        </>
    )
}
