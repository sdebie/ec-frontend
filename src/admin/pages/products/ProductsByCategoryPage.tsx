import { useState, useMemo, useEffect } from 'react'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'
import { Search } from 'lucide-react'

import { useAdminProductList } from '@/admin/hooks/products/useAdminProductList'
import { useCategories } from '@/admin/hooks/products/useCategories'
import type { AdminProductListItem } from '@/admin/hooks/products/types'
import {
  DataTable,
  PageLayout,
  Select,
} from '@/shared/ui/components'
import type { ColumnDef } from '@/shared/ui/components'
import type { SelectOption } from '@/shared/ui/components/form/Select'
import { Input } from '@/shared/ui/primitives'
import { formatAmount } from '@/shared/utils/formatAmount'

export function ProductsByCategoryPage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // 300ms debounce for search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: categories, isLoading: categoriesLoading } = useCategories()

  const { data, isLoading } = useAdminProductList({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    categoryId: selectedCategoryId || undefined,
    search: debouncedSearch,
  })

  const pageCount = data?.totalPages ?? 0

  // Auto-reset: if pageIndex exceeds totalPages, reset to last valid page
  useEffect(() => {
    if (pageCount > 0 && pagination.pageIndex >= pageCount) {
      setPagination((prev) => ({ ...prev, pageIndex: Math.max(0, pageCount - 1) }))
    }
  }, [pageCount, pagination.pageIndex])

  const categoryOptions: SelectOption[] = useMemo(() => {
    const opts: SelectOption[] = [{ value: '', label: 'All Categories' }]
    if (categories) {
      categories.forEach((cat) => {
        opts.push({ value: cat.id, label: cat.name })
      })
    }
    return opts
  }, [categories])

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId || !categories) return null
    const found = categories.find((c) => c.id === selectedCategoryId)
    return found?.name ?? null
  }, [selectedCategoryId, categories])

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const columns: ColumnDef<AdminProductListItem, unknown>[] = useMemo(
    () => [
      {
        id: 'product',
        header: 'Product',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.thumbnailUrl && (
              <img
                src={row.original.thumbnailUrl}
                alt={row.original.name}
                className="h-10 w-10 rounded-md object-cover"
              />
            )}
            <div>
              <p className="font-medium text-(--c-text)">{row.original.name}</p>
              <p className="text-xs text-(--c-text-muted)">{row.original.sku}</p>
            </div>
          </div>
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
        cell: ({ row }) => (
          <span className="text-sm text-(--c-text)">
            {formatAmount(parseFloat(row.original.retailPrice ?? '0'))}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span className="text-sm text-(--c-text)">{row.original.status}</span>
        ),
        enableSorting: false,
      },
      {
        id: 'stock',
        header: 'Stock',
        cell: ({ row }) => (
          <span className="text-sm text-(--c-text)">{row.original.stockCount}</span>
        ),
        enableSorting: false,
      },
    ],
    [],
  )

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Products', href: '/admin/products' },
    { label: 'By Category' },
  ])

  return (
    <PageLayout title="Products by Category">
      <div className="space-y-4">
        {/* Category selector */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-64">
            <Select
              label="Category"
              options={categoryOptions}
              value={selectedCategoryId}
              onChange={handleCategoryChange}
              placeholder="Select a category"
              disabled={categoriesLoading}
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

        {/* Selected category label */}
        {selectedCategoryName && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-(--primary-subtle) px-3 py-1 text-sm font-medium text-(--primary)">
              {selectedCategoryName}
            </span>
          </div>
        )}

        <DataTable
          columns={columns}
          data={data?.content ?? []}
          isLoading={isLoading}
          manualPagination
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          emptyMessage="No products found"
        />
      </div>
    </PageLayout>
  )
}
