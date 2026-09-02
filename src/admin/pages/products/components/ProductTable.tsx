import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Archive, PackageX, Power, SquarePen, Trash2 } from 'lucide-react'
import type { OnChangeFn, PaginationState } from '@tanstack/react-table'

import type { AdminProductListItem, StockLevel } from '../types'
import { deriveStockLevel } from '../types'
import { useDeleteProductGql } from '../hooks/useDeleteProductGql'
import { useUpdateProductStatusGql } from '../hooks/useUpdateProductStatusGql'
import { useZeroProductStock } from '../hooks/useZeroProductStock'
import type { ColumnDef } from '@/shared/ui/components'
import {
  ConfirmationDialog,
  DataTable,
  ProductStatusDisplay,
  RowActionButton,
  Thumbnail,
  toast,
} from '@/shared/ui/components'
import { Button } from '@/shared/ui/primitives'
import { ProductStatus } from '@/shared/types/enums'
import { formatAmount } from '@/shared/utils/formatAmount'
import { cn } from '@/shared/utils/cn'

/**
 * Derives the subtitle text for the Product column.
 * Uses category.name as the subtitle value (since AdminProductListItem does not have variant names).
 * Falls back to empty string only if category.name itself is empty.
 */
export function getProductSubtitle(product: AdminProductListItem): string {
  return product.category.name || ''
}

/**
 * Formats the retail price for display in the Price column.
 * Always displays a single formatted price — never a range.
 */
export function getFormattedPrice(retailPrice: string | null): string {
  return formatAmount(parseFloat(retailPrice ?? '0'))
}

interface ProductTableProps {
  data: AdminProductListItem[]
  isLoading: boolean
  canMutate: boolean
  canManageLifecycle: boolean
  pageCount: number
  totalRowCount: number
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  refetch: () => void
}

export function ProductTable({
  data,
  isLoading,
  canMutate,
  canManageLifecycle,
  pageCount,
  totalRowCount,
  pagination,
  onPaginationChange,
  refetch,
}: ProductTableProps) {
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState<AdminProductListItem | null>(null)
  const [outOfStockTarget, setOutOfStockTarget] = useState<AdminProductListItem | null>(null)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)

  const deleteProduct = useDeleteProductGql()
  const updateStatus = useUpdateProductStatusGql()
  const zeroStock = useZeroProductStock()

  const handleToggleStatus = useCallback(
    (productId: string, targetStatus: 'ACTIVE' | 'DISABLED') => {
      updateStatus.mutate(
        { id: productId, status: targetStatus },
        {
          onSuccess: () => {
            refetch()
            toast.success('Product status updated successfully')
          },
          onError: () => {
            toast.error('Failed to update product status', { duration: 0 })
          },
        },
      )
    },
    [updateStatus, refetch],
  )

  const handleOutOfStockConfirm = () => {
    if (!outOfStockTarget) return

    zeroStock.mutate(outOfStockTarget.id, {
      onSuccess: () => {
        refetch()
        toast.success('Product marked out of stock')
        setOutOfStockTarget(null)
      },
      onError: () => {
        toast.error('Failed to mark product out of stock', { duration: 0 })
        setOutOfStockTarget(null)
      },
    })
  }

  // Bulk status updates dispatch one mutation per product concurrently —
  // there is no bulk endpoint, and partial failure is reported, not hidden.
  const handleBulkStatus = async (status: 'ACTIVE' | 'DISABLED') => {
    const ids = Array.from(selectedRows)
    if (ids.length === 0) return
    setIsBulkUpdating(true)
    const results = await Promise.allSettled(ids.map((id) => updateStatus.mutateAsync({ id, status })))
    setIsBulkUpdating(false)

    const failed = results.filter((result) => result.status === 'rejected').length
    if (failed === 0) {
      toast.success(`Updated ${ids.length} ${ids.length === 1 ? 'product' : 'products'}`)
    } else {
      toast.error(`${failed} of ${ids.length} status updates failed`, { duration: 0 })
    }
    setSelectedRows(new Set())
    refetch()
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return

    deleteProduct.mutate({ id: deleteTarget.id }, {
      // Order history is the only bar to physical deletion (see the dialog's
      // own description below) — the server may archive instead of delete,
      // and the toast has to say which actually happened rather than
      // claiming "deleted" either way.
      onSuccess: ({ deleteProduct: outcome }) => {
        refetch()
        toast.success(
          outcome === 'ARCHIVED'
            ? 'Product archived instead of deleted, to preserve order history'
            : 'Product deleted permanently',
        )
        setDeleteTarget(null)
      },
      onError: () => {
        toast.error('Failed to delete product', { duration: 0 })
        setDeleteTarget(null)
      },
    })
  }

  const columns: ColumnDef<AdminProductListItem, unknown>[] = useMemo(
    () => [
      {
        id: 'product',
        header: 'Product',
        cell: ({ row }) => (
          <div className="flex min-w-0 max-w-[280px] items-center gap-3">
            <Thumbnail
              logoUrl={row.original.thumbnailUrl}
              name={row.original.name}
              size="md"
              className="h-10 w-10 shrink-0 rounded-md"
            />
            <div className="min-w-0">
              <p className="font-medium text-(--c-text) truncate">{row.original.name}</p>
              <p className="text-xs text-(--c-text-muted) truncate">{getProductSubtitle(row.original)}</p>
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'sku',
        header: 'SKU',
        cell: ({ row }) => (
          <span className="text-(--c-text)">{row.original.sku}</span>
        ),
        enableSorting: false,
      },
      {
        id: 'price',
        header: 'Price',
        cell: ({ row }) => {
          return getFormattedPrice(row.original.retailPrice)
        },
        enableSorting: false,
      },
      {
        id: 'stock',
        header: 'Stock',
        cell: ({ row }) => {
          const level: StockLevel = row.original.stockLevel ?? deriveStockLevel(row.original.stockCount)
          const count = row.original.stockCount
          // One scannable line per row: a status dot plus copy that leads
          // with what the count MEANS, not a stacked label-then-number —
          // urgency (low/out) reads at a glance instead of being buried
          // under a generic "Stock" label.
          const stockConfig: Record<StockLevel, { dotClass: string; textClass: string; label: string }> = {
            IN_STOCK: {
              dotClass: 'bg-(--c-status-green-text)',
              textClass: 'text-(--c-text)',
              label: `${count} in stock`,
            },
            LOW_STOCK: {
              dotClass: 'bg-(--c-status-yellow-text)',
              textClass: 'text-(--c-status-yellow-text)',
              label: `${count} left`,
            },
            OUT_OF_STOCK: {
              dotClass: 'bg-(--c-status-red-text)',
              textClass: 'text-(--c-status-red-text)',
              label: 'Out of stock',
            },
          }
          const config = stockConfig[level]
          return (
            <div className="flex items-center gap-2">
              <span className={cn('h-2 w-2 shrink-0 rounded-full', config.dotClass)} aria-hidden="true" />
              <span className={cn('font-medium', config.textClass)}>{config.label}</span>
            </div>
          )
        },
        enableSorting: false,
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <ProductStatusDisplay status={row.original.status} />,
        enableSorting: false,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const product = row.original
          // View and Edit both land on the same edit screen — VIEWER
          // roles land on the same page but its fields render disabled,
          // so one action correctly serves both cases.
          return (
            <div className="flex min-w-44 items-center justify-center gap-1 whitespace-nowrap">
              <RowActionButton
                onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                aria-label={`View and edit ${product.name}`}
                title="View / edit product details"
                data-testid="action-view-edit"
              >
                <SquarePen className="h-4 w-4" />
              </RowActionButton>
              {canMutate && (
                <>
                  <RowActionButton
                    onClick={() => setOutOfStockTarget(product)}
                    aria-label={`Mark ${product.name} out of stock`}
                    title="Zero all variant stock — hides the Add to Cart button until restocked"
                    data-testid="action-out-of-stock"
                  >
                    <PackageX className="h-4 w-4" />
                  </RowActionButton>
                  {canManageLifecycle && (
                    <>
                      {product.status !== ProductStatus.ACTIVE && (
                        <RowActionButton
                          onClick={() => handleToggleStatus(product.id, 'ACTIVE')}
                          aria-label={`Activate ${product.name}`}
                          title="Activate — make visible on the storefront"
                          data-testid="action-activate"
                        >
                          <Power className="h-4 w-4" />
                        </RowActionButton>
                      )}
                      {product.status !== ProductStatus.DISABLED && (
                        <RowActionButton
                          onClick={() => handleToggleStatus(product.id, 'DISABLED')}
                          aria-label={`Archive ${product.name}`}
                          title="Archive — hides from the storefront, keeps the product and its order history"
                          data-testid="action-disable"
                        >
                          <Archive className="h-4 w-4" />
                        </RowActionButton>
                      )}
                      <RowActionButton
                        variant="danger"
                        onClick={() => setDeleteTarget(product)}
                        aria-label={`Delete ${product.name}`}
                        title="Delete — permanent if never ordered, otherwise archives instead"
                        data-testid="action-delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </RowActionButton>
                    </>
                  )}
                </>
              )}
            </div>
          )
        },
        enableSorting: false,
      },
    ],
    [canMutate, canManageLifecycle, navigate, handleToggleStatus],
  )

  return (
    <>
      {canManageLifecycle && selectedRows.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-(--c-radius) border border-(--c-border) bg-(--c-panel) px-4 py-2">
          <span className="text-sm font-medium text-(--c-text)">
            {selectedRows.size} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isBulkUpdating}
              onClick={() => handleBulkStatus('ACTIVE')}
              data-testid="bulk-mark-active"
            >
              Mark Active
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isBulkUpdating}
              onClick={() => handleBulkStatus('DISABLED')}
              data-testid="bulk-mark-inactive"
            >
              Mark Inactive
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRows(new Set())}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        manualPagination
        pageCount={pageCount}
        totalRowCount={totalRowCount}
        pagination={pagination}
        onPaginationChange={onPaginationChange}
        onRowDoubleClick={(product) => navigate(`/admin/products/${product.id}/edit`)}
        emptyMessage="No products found"
        enableRowSelection
        selectedRowIds={selectedRows}
        onRowSelectionChange={setSelectedRows}
        getRowId={(row) => row.id}
      />

      <ConfirmationDialog
        open={outOfStockTarget !== null}
        onClose={() => setOutOfStockTarget(null)}
        onConfirm={handleOutOfStockConfirm}
        title="Mark Out of Stock"
        description={`Set the stock of every variant of "${outOfStockTarget?.name}" to 0? Shoppers will no longer be able to add it to their cart.`}
        confirmLabel="Mark out of stock"
        variant="danger"
        isLoading={zeroStock.isPending}
      />

      <ConfirmationDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        description={`Delete "${deleteTarget?.name}"? If it has never been ordered it is removed permanently; otherwise it is archived instead, to preserve order history.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteProduct.isPending}
      />
    </>
  )
}
