import { useState, useEffect } from 'react'
import type { PaginationState } from '@tanstack/react-table'

import { PageLayout } from '@/shared/ui/components'
import { useCan } from '@/shared/auth/adminPermissions'
import { useTableSort } from '@/admin/hooks/useTableSort'
import { useStaff } from './hooks/useStaff'
import type { StaffMember } from './types'
import { StaffTable } from './components/StaffTable'
import { StaffFormDialog } from './components/StaffFormDialog'
import { StaffToolbar } from './components/StaffToolbar'

export function StaffListPage() {
  const canMutate = useCan('staff:manage')

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Debounce search input by 300ms
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { sorting, onSortingChange, sort } = useTableSort()

  const { data, isLoading } = useStaff({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    search,
    sort,
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingStaff, setEditingStaff] = useState<StaffMember | undefined>(undefined)

  const handleAdd = () => {
    setDialogMode('create')
    setEditingStaff(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (staff: StaffMember) => {
    setDialogMode('edit')
    setEditingStaff(staff)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingStaff(undefined)
  }

  const pageCount = data ? Math.ceil(data.total / pagination.pageSize) : 0

  return (
    <PageLayout title="Staff">
      <div className="space-y-4">
        <StaffToolbar
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          canMutate={canMutate}
          onAddStaff={handleAdd}
        />

        <StaffTable
          data={data?.data ?? []}
          isLoading={isLoading}
          canMutate={canMutate}
          pageCount={pageCount}
          totalRowCount={data?.total ?? 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={onSortingChange}
          onEdit={handleEdit}
        />
      </div>

      {dialogOpen && (
        <StaffFormDialog
          open={dialogOpen}
          mode={dialogMode}
          staff={editingStaff}
          onClose={handleCloseDialog}
        />
      )}
    </PageLayout>
  )
}
