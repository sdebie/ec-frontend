import { Search } from 'lucide-react'
import { Select } from '@/shared/ui/components'
import { Input } from '@/shared/ui/primitives'
import { ProductStatus } from '@/shared/types/enums'

export type StatusFilter = 'ALL' | ProductStatus

const STATUS_FILTER_SELECT_OPTIONS = [
  { value: 'ALL', label: 'All' },
  { value: ProductStatus.ACTIVE, label: 'Active' },
  { value: ProductStatus.PENDING, label: 'Pending' },
  { value: ProductStatus.DISABLED, label: 'Disabled' },
]

interface FilterOption {
  value: string
  label: string
}

interface ProductToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (value: StatusFilter) => void
  categoryFilter: string
  onCategoryFilterChange: (value: string) => void
  categoryOptions: FilterOption[]
  brandFilter: string
  onBrandFilterChange: (value: string) => void
  brandOptions: FilterOption[]
}

export function ProductToolbar({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categoryOptions,
  brandFilter,
  onBrandFilterChange,
  brandOptions,
}: ProductToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-50">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)" />
        <Input
          placeholder="Search products by name, SKU, or barcode..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="w-40">
        <Select
          value={statusFilter}
          onChange={(value) => onStatusFilterChange(value as StatusFilter)}
          options={STATUS_FILTER_SELECT_OPTIONS}
          ariaLabel="Filter by status"
        />
      </div>

      <div className="w-56">
        <Select
          value={categoryFilter}
          onChange={onCategoryFilterChange}
          options={categoryOptions}
          ariaLabel="Filter by category"
        />
      </div>

      <div className="w-56">
        <Select
          value={brandFilter}
          onChange={onBrandFilterChange}
          options={brandOptions}
          ariaLabel="Filter by brand"
        />
      </div>
    </div>
  )
}
