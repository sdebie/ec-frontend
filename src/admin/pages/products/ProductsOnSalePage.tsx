import { useState, useMemo } from 'react'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'

import type { OnSaleProductItem, OnSaleProductImage } from './hooks/useOnSaleProducts'
import { useOnSaleProducts } from './hooks/useOnSaleProducts'
import { DataTable, PageLayout, Thumbnail } from '@/shared/ui/components'
import type { ColumnDef } from '@/shared/ui/components'
import { formatAmount } from '@/shared/utils/formatAmount'

function getThumbnailUrl(images: OnSaleProductImage[]): string | null {
  if (!images?.length) return null
  return images.find((img) => img.featured)?.imageUrl ?? images[0]?.imageUrl ?? null
}

function getFormattedPrice(price: number | null | undefined): string {
  return formatAmount(price ?? 0)
}

export function ProductsOnSalePage() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const { data, isLoading } = useOnSaleProducts({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
  })

  const pageCount = data?.totalPages ?? 0

  const columns: ColumnDef<OnSaleProductItem, unknown>[] = useMemo(
    () => [
      {
        id: 'thumbnail',
        header: 'Icon',
        cell: ({ row }) => (
          <Thumbnail
            logoUrl={getThumbnailUrl(row.original.images)}
            name={row.original.name}
            size="md"
            className="h-10 w-10 rounded-md"
          />
        ),
        enableSorting: false,
      },
      {
        id: 'product',
        header: 'Product',
        cell: ({ row }) => (
          <p className="font-medium text-(--c-text)">{row.original.name}</p>
        ),
        enableSorting: false,
      },
      {
        id: 'retailPrice',
        header: 'Retail Price',
        cell: ({ row }) => (
          <span className="text-(--c-text)">
            {getFormattedPrice(row.original.retailPrice?.price)}
          </span>
        ),
        enableSorting: false,
      },
      {
        id: 'salePrice',
        header: 'Sale Price',
        cell: ({ row }) => (
          <span className="font-medium text-(--c-text)">
            {getFormattedPrice(row.original.retailSalePrice?.price)}
          </span>
        ),
        enableSorting: false,
      },
    ],
    [],
  )

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Products', href: '/admin/products' },
    { label: 'On Sale' },
  ])

  return (
    <PageLayout title="Products on Sale">
      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading}
        manualPagination
        pageCount={pageCount}
        totalRowCount={data?.totalElements ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        emptyMessage="No products on sale found"
      />
    </PageLayout>
  )
}
