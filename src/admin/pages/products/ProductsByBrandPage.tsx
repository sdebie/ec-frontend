import { useState, useMemo, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'

import type { AdminProductListItem } from './types'
import { deriveStockLevel } from './types'
import type { StockLevel } from './types'
import { useAdminProductList } from './hooks/useAdminProductList'
import { useBrands } from './hooks/useBrands'
import {
  DataTable,
  PageLayout,
  Select,
  Thumbnail,
  ProductStatusDisplay,
} from '@/shared/ui/components'
import type { ColumnDef } from '@/shared/ui/components'
import { Input } from '@/shared/ui/primitives'
import { formatAmount } from '@/shared/utils/formatAmount'

export function ProductsByBrandPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [selectedBrandId, setSelectedBrandId] = useState<string>('ALL')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Products', href: '/admin/products' },
    { label: 'By Brand' },
  ])

  const { data: brands, isLoading: brandsLoading } = useBrands()

  // 300ms debounce for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading } = useAdminProductList({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    brandId: selectedBrandId,
    search: debouncedSearch,
  })

  const pageCount = data?.totalPages ?? 0

  // Derive the visible page when a result set shrinks rather than synchronising
  // local state after a response arrives.
  const visiblePagination = {
    ...pagination,
    pageIndex: pageCount > 0 ? Math.min(pagination.pageIndex, pageCount - 1) : pagination.pageIndex,
  }

  const handleBrandChange = (value: string) => {
    setSelectedBrandId(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const selectedBrandName = useMemo(() => {
    if (selectedBrandId === 'ALL' || !brands) return null
    return brands.find((b) => b.id === selectedBrandId)?.name ?? null
  }, [selectedBrandId, brands])

  const brandFilterOptions = useMemo(
    () => [
      { value: 'ALL', label: 'All Brands' },
      ...(brands?.map((brand) => ({ value: brand.id, label: brand.name })) ?? []),
    ],
    [brands],
  )

  const columns: ColumnDef<AdminProductListItem, unknown>[] = useMemo(
    () => [
      {
        id: 'product',
        header: 'Product',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Thumbnail
              logoUrl={row.original.thumbnailUrl}
              name={row.original.name}
              size="md"
              className="h-10 w-10 rounded-md"
            />
            <div>
              <p className="font-medium text-(--c-text)">{row.original.name}</p>
              <p className="text-xs text-(--c-text-muted)">{row.original.category.name}</p>
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'sku',
        header: 'SKU',
        cell: ({ row }) => (
          <span className="text-sm text-(--c-text)">{row.original.sku}</span>
        ),
        enableSorting: false,
      },
      {
        id: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <span className="text-sm text-(--c-text)">{row.original.category.name}</span>
        ),
        enableSorting: false,
      },
      {
        id: 'price',
        header: 'Price',
        cell: ({ row }) => formatAmount(parseFloat(row.original.retailPrice ?? '0')),
        enableSorting: false,
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <ProductStatusDisplay status={row.original.status} />,
        enableSorting: false,
      },
      {
        id: 'stock',
        header: 'Stock',
        cell: ({ row }) => {
          const level: StockLevel = row.original.stockLevel ?? deriveStockLevel(row.original.stockCount)
          const stockConfig: Record<StockLevel, { label: string; colorClass: string }> = {
            IN_STOCK: { label: 'In Stock', colorClass: 'text-(--c-text)' },
            LOW_STOCK: { label: 'Low Stock', colorClass: 'text-[var(--admin-status-yellow-text)]' },
            OUT_OF_STOCK: { label: 'Out of Stock', colorClass: 'text-[var(--admin-status-red-text)]' },
          }
          const config = stockConfig[level]
          return (
            <div>
              <p className={`text-sm font-medium ${config.colorClass}`}>{config.label}</p>
              <p className={`text-xs ${config.colorClass}`}>{row.original.stockCount}</p>
            </div>
          )
        },
        enableSorting: false,
      },
    ],
    [],
  )

  return (
    <PageLayout title="Products by Brand">
      <div className="space-y-4">
        {/* Brand Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-56">
            <Select
              value={selectedBrandId}
              onChange={handleBrandChange}
              options={brandFilterOptions}
              disabled={brandsLoading}
              ariaLabel="Filter by brand"
            />
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)" />
            <Input
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Selected Brand Label */}
        {selectedBrandName && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-(--primary-subtle) text-(--primary)">
              {selectedBrandName}
            </span>
          </div>
        )}

        <DataTable
          columns={columns}
          data={data?.content ?? []}
          isLoading={isLoading}
          manualPagination
          pageCount={pageCount}
          totalRowCount={data?.totalElements ?? 0}
          pagination={visiblePagination}
          onPaginationChange={setPagination}
          emptyMessage="No products found"
        />
      </div>
    </PageLayout>
  )
}
