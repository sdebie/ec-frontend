import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'

import { PageLayout } from '@/shared/ui/components'
import { Button } from '@/shared/ui/primitives'
import { useCan } from '@/shared/auth/adminPermissions'
import { useAdminProductList } from './hooks/useAdminProductList'
import { useCategories } from './hooks/useCategories'
import { useBrands } from './hooks/useBrands'
import { ProductToolbar } from './components/ProductToolbar'
import type { StatusFilter } from './components/ProductToolbar'
import { ProductTable } from './components/ProductTable'

export function ProductListPage() {
  const navigate = useNavigate()
  const canMutate = useCan('product:write')
  const canManageLifecycle = useCan('product:lifecycle')

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [brandFilter, setBrandFilter] = useState<string>('ALL')
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

  const { data: categories } = useCategories()
  const { data: brands } = useBrands()

  const categoryFilterOptions = useMemo(
    () => [
      { value: 'ALL', label: 'All Categories' },
      ...(categories?.map((cat) => ({ value: cat.id, label: cat.name })) ?? []),
    ],
    [categories],
  )
  const brandFilterOptions = useMemo(
    () => [
      { value: 'ALL', label: 'All Brands' },
      ...(brands?.map((brand) => ({ value: brand.id, label: brand.name })) ?? []),
    ],
    [brands],
  )

  const { data, isLoading, refetch } = useAdminProductList({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    status: statusFilter,
    categoryId: categoryFilter,
    brandId: brandFilter,
    search: debouncedSearch,
  })

  const pageCount = data?.totalPages ?? 0

  // Derive the visible page when a result set shrinks. This avoids a second
  // render that exists only to synchronise state with response metadata.
  const visiblePagination = {
    ...pagination,
    pageIndex: pageCount > 0 ? Math.min(pagination.pageIndex, pageCount - 1) : pagination.pageIndex,
  }

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleBrandFilterChange = (value: string) => {
    setBrandFilter(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Products' },
  ])

  const headerAction = canMutate ? (
    <Button variant="solid" onClick={() => navigate('/admin/products/new')}>
      + Add Product
    </Button>
  ) : undefined

  return (
    <PageLayout title="Products" subtitle="Manage and organise your store products" action={headerAction}>
      <div className="space-y-4">
        <ProductToolbar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={handleCategoryFilterChange}
          categoryOptions={categoryFilterOptions}
          brandFilter={brandFilter}
          onBrandFilterChange={handleBrandFilterChange}
          brandOptions={brandFilterOptions}
        />

        <ProductTable
          data={data?.content ?? []}
          isLoading={isLoading}
          canMutate={canMutate}
          canManageLifecycle={canManageLifecycle}
          pageCount={pageCount}
          totalRowCount={data?.totalElements ?? 0}
          pagination={visiblePagination}
          onPaginationChange={setPagination}
          refetch={refetch}
        />
      </div>
    </PageLayout>
  )
}
