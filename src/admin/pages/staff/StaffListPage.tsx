import {useEffect, useState} from 'react'
import type {PaginationState} from '@tanstack/react-table'
import {Search} from 'lucide-react'

import {Button, Input} from '@/shared/ui/primitives'
import {useCan} from '@/shared/auth/adminPermissions'
import {useTableSort} from '@/admin/hooks/useTableSort'
import {useStaff} from './hooks/useStaff'
import type {StaffMember} from './hooks/types'
import {StaffTable} from './components/StaffTable'
import {StaffFormDialog} from './components/StaffFormDialog'

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
            setPagination((prev) => ({...prev, pageIndex: 0}))
        }, 300)
        return () => clearTimeout(t)
    }, [searchInput])

    const {sorting, onSortingChange, sort} = useTableSort()

    const {data, isLoading} = useStaff({
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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value)
    }

    const pageCount = data ? Math.ceil(data.total / pagination.pageSize) : 0

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-(--c-text)">Staff</h1>
                {canMutate && (
                    <Button onClick={handleAdd}>
                        Add staff member
                    </Button>
                )}
            </div>

            {/* Search filter bar */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)"/>
                <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchInput}
                    onChange={handleSearchChange}
                    className="pl-9"
                />
            </div>

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

            {dialogOpen && (
                <StaffFormDialog
                    open={dialogOpen}
                    mode={dialogMode}
                    staff={editingStaff}
                    onClose={handleCloseDialog}
                />
            )}
        </div>
    )
}
