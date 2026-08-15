import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PaginationState } from '@tanstack/react-table'
import { Search } from 'lucide-react'

import { DataTable, StatusBadge } from '@/shared/ui/components'
import type { ColumnDef } from '@/shared/ui/components'
import { Button, Input } from '@/shared/ui/primitives'
import { useCan } from '@/shared/auth/adminPermissions'
import { useStaff } from '@/admin/hooks/staff'
import type { StaffMember } from '@/admin/hooks/staff'
import { StaffActionsMenu } from './StaffActionsMenu'
import { StaffRoleLabels } from '@/shared/types/enums/StaffRoles'


const ROLE_COLORS: Record<StaffMember['role'], string> = {
  SUPER_ADMIN: 'blue',
  CATALOG_MANAGER: 'purple',
  ORDER_MANAGER: 'green',
  VIEWER: 'gray',
}

export function StaffListPage() {
  const navigate = useNavigate()
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

  const { data, isLoading } = useStaff({
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    search,
  })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }

  const columns = useMemo<ColumnDef<StaffMember, unknown>[]>(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Name',
        cell: ({ row }) => row.original.fullName ?? '—',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <StatusBadge
            label={StaffRoleLabels[row.original.role]}
            color={ROLE_COLORS[row.original.role]}
          />
        ),
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
              cell: ({ row }: { row: { original: StaffMember } }) => (
                <StaffActionsMenu staff={row.original} />
              ),
            } as ColumnDef<StaffMember, unknown>,
          ]
        : []),
    ],
    [canMutate],
  )

  const pageCount = data ? Math.ceil(data.total / pagination.pageSize) : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-(--c-text)">Staff</h1>
        {canMutate && (
          <Button onClick={() => navigate('/admin/staff/new')}>
            Add staff member
          </Button>
        )}
      </div>

      {/* Search filter bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)" />
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        showSearch={false}
        manualPagination
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  )
}
