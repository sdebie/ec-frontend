import { useCallback, useMemo, useState } from 'react'
import { Search, Star, Trash2 } from 'lucide-react'

import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'
import type { AdminProductListItem } from '@/admin/hooks/products/types'
import { useFeaturedProducts } from '@/admin/hooks/products/useFeaturedProducts'
import { useSetProductFeatured } from '@/admin/hooks/products/useSetProductFeatured'
import { useAdminProductList } from '@/admin/hooks/products/useAdminProductList'
import type { ColumnDef } from '@/shared/ui/components'
import {
  DataTable,
  Dialog,
  DialogContent,
  DialogHeader,
  PageLayout,
  ProductStatusDisplay,
  Thumbnail,
} from '@/shared/ui/components'
import { Button, Input } from '@/shared/ui/primitives'
import { formatAmount } from '@/shared/utils/formatAmount'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'

const FEATURED_CAP = 50

export function FeaturedProductsPage() {
  const isSuperAdmin = useAdminAuthStore((s) => s.role) === 'SUPER_ADMIN'
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const { data, isLoading, isError, refetch } = useFeaturedProducts()
  const setProductFeatured = useSetProductFeatured()

  const products = data?.featuredProductList ?? []
  const isAtCap = products.length >= FEATURED_CAP

  const handleRemove = useCallback((productId: string) => {
    setProductFeatured.mutate({ productId, featured: false })
  }, [setProductFeatured])

  const columns: ColumnDef<AdminProductListItem, unknown>[] = useMemo(
    () => {
      const cols: ColumnDef<AdminProductListItem, unknown>[] = [
        {
          id: 'thumbnail',
          header: 'Image',
          cell: ({ row }) => (
            <Thumbnail
              logoUrl={row.original.thumbnailUrl}
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
            <div className="min-w-0 max-w-[240px]">
              <p className="font-medium text-(--c-text) truncate">{row.original.name}</p>
              <p className="text-xs text-(--c-text-muted) truncate">{row.original.category?.name ?? ''}</p>
            </div>
          ),
          enableSorting: false,
        },
        {
          id: 'status',
          header: 'Status',
          cell: ({ row }) => <ProductStatusDisplay status={row.original.status} />,
          enableSorting: false,
        },
        {
          id: 'price',
          header: 'Price',
          cell: ({ row }) => (
            <span className="text-(--c-text)">
              {formatAmount(parseFloat(row.original.retailPrice ?? '0'))}
            </span>
          ),
          enableSorting: false,
        },
      ]

      if (isSuperAdmin) {
        cols.push({
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => (
            <button
              type="button"
              onClick={() => handleRemove(row.original.id)}
              className="inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-(--c-surface-hover) text-(--c-text-muted) hover:text-(--c-danger) transition-colors"
              aria-label={`Remove ${row.original.name} from featured`}
              data-testid="remove-featured"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ),
          enableSorting: false,
        })
      }

      return cols
    },
    [isSuperAdmin, handleRemove],
  )

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Featured Products' },
  ])

  // Error state with Retry
  if (isError && !isLoading) {
    return (
      <PageLayout title="Featured Products">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-(--c-text-muted) mb-4">Failed to load featured products.</p>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </PageLayout>
    )
  }

  const headerAction = isSuperAdmin ? (
    <Button
      variant="solid"
      disabled={isAtCap}
      onClick={() => setIsAddDialogOpen(true)}
      leftIcon={<Star className="h-4 w-4" />}
      title={isAtCap ? 'Featured limit of 50 reached' : undefined}
    >
      Add Featured Product
    </Button>
  ) : undefined

  return (
    <PageLayout
      title="Featured Products"
      subtitle="Manage which products appear in the featured section on your storefront"
      action={headerAction}
    >
      {isAtCap && isSuperAdmin && (
        <p className="text-xs text-(--c-text-muted) mb-2">
          Featured limit reached ({FEATURED_CAP}/{FEATURED_CAP}). Remove a product before adding another.
        </p>
      )}

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        emptyMessage="No products are currently featured. Add products to display them on your storefront."
      />

      <AddFeaturedProductDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        featuredProductIds={products.map((p) => p.id)}
      />
    </PageLayout>
  )
}

function AddFeaturedProductDialog({
  open,
  onClose,
  featuredProductIds,
}: {
  open: boolean
  onClose: () => void
  featuredProductIds: string[]
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const setProductFeatured = useSetProductFeatured()

  const { data, isLoading } = useAdminProductList({
    pageIndex: 0,
    pageSize: 20,
    status: 'ACTIVE',
    search: searchTerm,
  })

  const featuredIdSet = useMemo(() => new Set(featuredProductIds), [featuredProductIds])

  const filteredProducts = useMemo(() => {
    if (!data?.content) return []
    return data.content.filter((p) => !featuredIdSet.has(p.id))
  }, [data?.content, featuredIdSet])

  function handleSelect(productId: string) {
    setProductFeatured.mutate(
      { productId, featured: true },
      {
        onSuccess: () => {
          setSearchTerm('')
          onClose()
        },
      },
    )
  }

  function handleClose() {
    setSearchTerm('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} size="md">
      <DialogHeader title="Add Featured Product" description="Search for a product to feature on your storefront" />
      <DialogContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)" />
          <Input
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            autoFocus
            data-testid="search-product-input"
          />
        </div>

        <div className="space-y-1 max-h-[320px] overflow-y-auto">
          {isLoading && (
            <p className="text-sm text-(--c-text-muted) py-4 text-center">Searching...</p>
          )}

          {!isLoading && searchTerm && filteredProducts.length === 0 && (
            <p className="text-sm text-(--c-text-muted) py-4 text-center">
              No matching products found.
            </p>
          )}

          {!isLoading && !searchTerm && (
            <p className="text-sm text-(--c-text-muted) py-4 text-center">
              Type to search for products.
            </p>
          )}

          {!isLoading &&
            filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => handleSelect(product.id)}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-(--c-surface-hover) transition-colors text-left"
                data-testid="search-result-item"
              >
                <Thumbnail
                  logoUrl={product.thumbnailUrl}
                  name={product.name}
                  size="md"
                  className="h-8 w-8 rounded-md flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-(--c-text) truncate">{product.name}</p>
                  <p className="text-xs text-(--c-text-muted) truncate">
                    {product.category?.name ?? ''}
                    {product.retailPrice ? ` · ${formatAmount(parseFloat(product.retailPrice))}` : ''}
                  </p>
                </div>
              </button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
