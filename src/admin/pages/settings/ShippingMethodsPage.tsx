import { useState, useMemo } from 'react'

import { Pencil } from 'lucide-react'

import { DataTable, StatusBadge } from '@/shared/ui/components'
import type { ColumnDef } from '@/shared/ui/components'
import { Button } from '@/shared/ui/primitives'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { deriveCanMutate } from '@/admin/hooks/imports/utils'
import { useShippingMethods } from '@/admin/hooks/settings'
import type { ShippingMethod } from '@/admin/hooks/settings'
import { formatAmount } from '@/shared/utils/formatAmount'
import { ShippingMethodDialog } from './ShippingMethodDialog'

export function ShippingMethodsPage() {
  const canMutate = deriveCanMutate(useAdminAuthStore((s) => s.role))

  const { data, isLoading, isError, refetch } = useShippingMethods()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | undefined>(undefined)

  const handleAdd = () => {
    setDialogMode('create')
    setEditingMethod(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (method: ShippingMethod) => {
    setDialogMode('edit')
    setEditingMethod(method)
    setDialogOpen(true)
  }

  const handleClose = () => {
    setDialogOpen(false)
    setEditingMethod(undefined)
  }

  const columns = useMemo<ColumnDef<ShippingMethod, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => row.original.name ?? '—',
      },
      {
        accessorKey: 'baseFee',
        header: 'Base Fee',
        cell: ({ row }) => formatAmount(row.original.baseFee),
      },
      {
        accessorKey: 'estimatedDays',
        header: 'Estimated Days',
        cell: ({ row }) => row.original.estimatedDays ?? '—',
      },
      {
        id: 'active',
        header: 'Active',
        cell: ({ row }) => (
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
              cell: ({ row }: { row: { original: ShippingMethod } }) => (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(row.original)}
                    className="inline-flex items-center justify-center p-1 rounded-lg hover:bg-(--c-surface-hover)"
                    aria-label={`Edit ${row.original.name}`}
                  >
                    <Pencil className="h-4 w-4 text-(--c-text-muted)" />
                  </button>
                </div>
              ),
            } as ColumnDef<ShippingMethod, unknown>,
          ]
        : []),
    ],
    [canMutate],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-(--c-text)">Shipping Methods</h1>
        {canMutate && (
          <Button onClick={handleAdd}>
            Add shipping method
          </Button>
        )}
      </div>

      {isError && (
        <div className="flex flex-col items-center justify-center py-16 text-(--c-text-muted)">
          <p className="text-sm">Failed to load. <button onClick={() => refetch()}>Retry</button></p>
        </div>
      )}

      {!isError && (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          showSearch={false}
        />
      )}

      <ShippingMethodDialog
        open={dialogOpen}
        mode={dialogMode}
        method={editingMethod}
        onClose={handleClose}
      />
    </div>
  )
}
