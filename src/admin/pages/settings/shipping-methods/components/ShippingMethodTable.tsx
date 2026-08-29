import {useMemo} from 'react'
import {Pencil} from 'lucide-react'
import type {ColumnDef} from '@/shared/ui/components'
import {DataTable, RowActionButton, StatusBadge} from '@/shared/ui/components'
import {formatAmount} from '@/shared/utils/formatAmount'
import type {ShippingMethod} from '../types'

interface ShippingMethodTableProps {
    data: ShippingMethod[]
    isLoading: boolean
    canMutate: boolean
    onEdit: (method: ShippingMethod) => void
}

export function ShippingMethodTable({data, isLoading, canMutate, onEdit}: ShippingMethodTableProps) {
    const columns = useMemo<ColumnDef<ShippingMethod, unknown>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Name',
                cell: ({row}) => row.original.name ?? '—',
            },
            {
                accessorKey: 'baseFee',
                header: 'Base Fee',
                cell: ({row}) => formatAmount(row.original.baseFee),
            },
            {
                accessorKey: 'estimatedDays',
                header: 'Estimated Days',
                cell: ({row}) => row.original.estimatedDays ?? '—',
            },
            {
                id: 'active',
                header: 'Active',
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
                        cell: ({row}: { row: { original: ShippingMethod } }) => (
                            <div className="flex items-center gap-1">
                                <RowActionButton
                                    onClick={() => onEdit(row.original)}
                                    aria-label={`Edit ${row.original.name}`}
                                    data-testid="action-edit"
                                >
                                    <Pencil className="h-4 w-4"/>
                                </RowActionButton>
                            </div>
                        ),
                    } as ColumnDef<ShippingMethod, unknown>,
                ]
                : []),
        ],
        [canMutate, onEdit],
    )

    return (
        <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            showSearch={false}
            onRowDoubleClick={canMutate ? onEdit : undefined}
            emptyMessage="No shipping methods found"
        />
    )
}
