import {useCallback, useEffect, useMemo, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useBreadcrumb} from '@/admin/context/BreadcrumbContext'
import {Eye, Pencil, Search} from 'lucide-react'
import type {AdminProductListItem, StockLevel} from '@/admin/hooks/products/types'
import {deriveStockLevel} from '@/admin/hooks/products/types'
import {useDeleteProductGql} from '@/admin/hooks/products/useDeleteProductGql'
import {useUpdateProductStatusGql} from '@/admin/hooks/products/useUpdateProductStatusGql'
import {useAdminProductList} from '@/admin/hooks/products/useAdminProductList'
import {useCategories} from '@/admin/hooks/products/useCategories'
import {useBrands} from '@/admin/hooks/products/useBrands'
import {ProductActionsMenu} from './components/ProductActionsMenu'
import type {ColumnDef} from '@/shared/ui/components'
import {
    ConfirmationDialog,
    DataTable,
    PageLayout,
    ProductStatusDisplay,
    Thumbnail,
    toast,
} from '@/shared/ui/components'
import {Button, Input} from '@/shared/ui/primitives'
import {ProductStatus} from '@/shared/types/enums'
import {formatAmount} from '@/shared/utils/formatAmount'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'

export {getStatCardSubtitle} from './components/ProductStatCards'

type StatusFilter = 'ALL' | ProductStatus

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

export function ProductListPage() {
    const navigate = useNavigate()
    const canMutate = useAdminAuthStore((s) => s.role) === 'SUPER_ADMIN'

    const [pagination, setPagination] = useState({pageIndex: 0, pageSize: 10})
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
    const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
    const [brandFilter, setBrandFilter] = useState<string>('ALL')
    const [searchInput, setSearchInput] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [deleteTarget, setDeleteTarget] = useState<AdminProductListItem | null>(null)
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

    // 300ms debounce for search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput)
            setPagination((prev) => ({...prev, pageIndex: 0}))
        }, 300)
        return () => clearTimeout(timer)
    }, [searchInput])

    const {data: categories} = useCategories()
    const {data: brands} = useBrands()

    const {data, isLoading, refetch} = useAdminProductList({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        status: statusFilter,
        categoryId: categoryFilter,
        brandId: brandFilter,
        search: debouncedSearch,
    })

    const deleteProduct = useDeleteProductGql()
    const updateStatus = useUpdateProductStatusGql()

    const pageCount = data?.totalPages ?? 0
    // const totalElements = data?.totalElements ?? 0

    // Auto-reset: if pageIndex exceeds totalPages, reset to last valid page
    useEffect(() => {
        if (pageCount > 0 && pagination.pageIndex >= pageCount) {
            setPagination((prev) => ({...prev, pageIndex: Math.max(0, pageCount - 1)}))
        }
    }, [pageCount, pagination.pageIndex])

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value as StatusFilter)
        setPagination((prev) => ({...prev, pageIndex: 0}))
    }

    const handleCategoryFilterChange = (value: string) => {
        setCategoryFilter(value)
        setPagination((prev) => ({...prev, pageIndex: 0}))
    }

    const handleBrandFilterChange = (value: string) => {
        setBrandFilter(value)
        setPagination((prev) => ({...prev, pageIndex: 0}))
    }

    const handleToggleStatus = useCallback(
        (productId: string, targetStatus: 'ACTIVE' | 'DISABLED') => {
            updateStatus.mutate(
                {id: productId, status: targetStatus},
                {
                    onSuccess: () => {
                        refetch()
                        toast.success('Product status updated successfully')
                    },
                    onError: (err) => {
                        console.error(err)
                        toast.error('Failed to update product status', {duration: 0})
                    },
                },
            )
        },
        [updateStatus, refetch],
    )

    const handleDeleteConfirm = () => {
        if (!deleteTarget) return

        deleteProduct.mutate({id: deleteTarget.id}, {
            onSuccess: () => {
                refetch()
                toast.success('Product deleted successfully')
                setDeleteTarget(null)
            },
            onError: (err) => {
                console.error(err)
                toast.error('Failed to delete product', {duration: 0})
                setDeleteTarget(null)
            },
        })
    }

    const columns: ColumnDef<AdminProductListItem, unknown>[] = useMemo(
        () => [
            {
                id: 'checkbox',
                header: () => (
                    <label className="group inline-flex items-center justify-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={selectedRows.size > 0 && selectedRows.size === (data?.content?.length ?? 0)}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedRows(new Set((data?.content ?? []).map((p) => p.id)))
                                } else {
                                    setSelectedRows(new Set())
                                }
                            }}
                            aria-label="Select all rows"
                        />
                        <span className="w-[18px] h-[18px] rounded-[4px] border-2 border-(--c-text-muted) bg-(--c-panel) group-has-[:checked]:bg-(--c-accent) group-has-[:checked]:border-(--c-accent) flex items-center justify-center transition-colors duration-150">
                            <svg className="w-3 h-3 text-transparent group-has-[:checked]:text-white pointer-events-none" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </span>
                    </label>
                ),
                cell: ({row}) => (
                    <label className="group inline-flex items-center justify-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={selectedRows.has(row.original.id)}
                            onChange={(e) => {
                                setSelectedRows((prev) => {
                                    const next = new Set(prev)
                                    if (e.target.checked) {
                                        next.add(row.original.id)
                                    } else {
                                        next.delete(row.original.id)
                                    }
                                    return next
                                })
                            }}
                            aria-label={`Select ${row.original.name}`}
                        />
                        <span className="w-[18px] h-[18px] rounded-[4px] border-2 border-(--c-text-muted) bg-(--c-panel) group-has-[:checked]:bg-(--c-accent) group-has-[:checked]:border-(--c-accent) flex items-center justify-center transition-colors duration-150">
                            <svg className="w-3 h-3 text-transparent group-has-[:checked]:text-white pointer-events-none" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </span>
                    </label>
                ),
                enableSorting: false,
            },
            {
                id: 'thumbnail',
                header: 'Icon',
                cell: ({row}) => (
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
                cell: ({row}) => (
                    <div className="min-w-0 max-w-[240px]">
                        <p className="font-medium text-(--c-text) truncate">{row.original.name}</p>
                        <p className="text-xs text-(--c-text-muted) truncate">{getProductSubtitle(row.original)}</p>
                    </div>
                ),
                enableSorting: false,
            },
            {
                accessorKey: 'sku',
                header: 'SKU',
                cell: ({row}) => (
                    <span className="text-(--c-text)">{row.original.sku}</span>
                ),
                enableSorting: false,
            },
            {
                id: 'price',
                header: 'Price',
                cell: ({row}) => {
                    return getFormattedPrice(row.original.retailPrice)
                },
                enableSorting: false,
            },
            {
                id: 'status',
                header: 'Status',
                cell: ({row}) => <ProductStatusDisplay status={row.original.status}/>,
                enableSorting: false,
            },
            {
                id: 'stock',
                header: 'Stock',
                cell: ({row}) => {
                    const level: StockLevel = row.original.stockLevel ?? deriveStockLevel(row.original.stockCount)
                    const stockConfig: Record<StockLevel, { label: string; colorClass: string }> = {
                        IN_STOCK: {label: 'In Stock', colorClass: 'text-(--c-text)'},
                        LOW_STOCK: {label: 'Low Stock', colorClass: 'text-[var(--admin-status-yellow-text)]'},
                        OUT_OF_STOCK: {label: 'Out of Stock', colorClass: 'text-[var(--admin-status-red-text)]'},
                    }
                    const config = stockConfig[level]
                    return (
                        <div>
                            <p className={`font-medium ${config.colorClass}`}>{config.label}</p>
                            <p className={config.colorClass}>{row.original.stockCount}</p>
                        </div>
                    )
                },
                enableSorting: false,
            },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({row}) => (
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => navigate(`/admin/products/${row.original.id}/edit`)}
                            className="inline-flex items-center justify-center p-1 rounded-lg hover:bg-(--c-surface-hover)"
                            aria-label="View product"
                            data-testid="action-view"
                        >
                            <Eye className="h-4 w-4 text-(--c-text-muted)"/>
                        </button>
                        {canMutate && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => navigate(`/admin/products/${row.original.id}/edit`)}
                                    className="inline-flex items-center justify-center p-1 rounded-lg hover:bg-(--c-surface-hover)"
                                    aria-label="Edit product"
                                    data-testid="action-edit"
                                >
                                    <Pencil className="h-4 w-4 text-(--c-text-muted)"/>
                                </button>
                                <ProductActionsMenu
                                    product={row.original}
                                    onToggleStatus={(targetStatus) =>
                                        handleToggleStatus(row.original.id, targetStatus)
                                    }
                                    onDelete={() => setDeleteTarget(row.original)}
                                />
                            </>
                        )}
                    </div>
                ),
                enableSorting: false,
            },
        ],
        [canMutate, navigate, handleToggleStatus, selectedRows, data?.content],
    )

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
                {/* Filter Bar */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-50">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)"/>
                        <Input
                            placeholder="Search products by name, SKU, or barcode..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusFilterChange(e.target.value)}
                        className="h-(--c-control-h-md) px-3 text-sm rounded-(--c-radius) border border-(--c-border) bg-(--c-panel) text-(--c-text) focus:outline-none focus:ring-2 focus:ring-(--c-ring)"
                    >
                        <option value="ALL">All</option>
                        <option value={ProductStatus.ACTIVE}>Active</option>
                        <option value={ProductStatus.PENDING}>Pending</option>
                        <option value={ProductStatus.DISABLED}>Disabled</option>
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => handleCategoryFilterChange(e.target.value)}
                        className="h-(--c-control-h-md) px-3 text-sm rounded-(--c-radius) border border-(--c-border) bg-(--c-panel) text-(--c-text) focus:outline-none focus:ring-2 focus:ring-(--c-ring)"
                    >
                        <option value="ALL">All Categories</option>
                        {categories?.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <select
                        value={brandFilter}
                        onChange={(e) => handleBrandFilterChange(e.target.value)}
                        className="h-(--c-control-h-md) px-3 text-sm rounded-(--c-radius) border border-(--c-border) bg-(--c-panel) text-(--c-text) focus:outline-none focus:ring-2 focus:ring-(--c-ring)"
                    >
                        <option value="ALL">All Brands</option>
                        {brands?.map((brand) => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                    </select>
                </div>

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

            <ConfirmationDialog
                open={deleteTarget !== null}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Product"
                description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={deleteProduct.isPending}
            />
        </PageLayout>
    )
}
