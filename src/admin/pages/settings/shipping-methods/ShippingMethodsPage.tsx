import {useMemo, useState} from 'react'

import {PageLayout} from '@/shared/ui/components'
import {useCan} from '@/shared/auth/adminPermissions'
import {useShippingMethods} from './hooks/useShippingMethods'
import type {ShippingMethod} from './types'
import {ShippingMethodTable} from './components/ShippingMethodTable'
import {ShippingMethodToolbar} from './components/ShippingMethodToolbar'
import {ShippingMethodDialog} from './components/ShippingMethodDialog'

export function ShippingMethodsPage() {
    const canMutate = useCan('settings:write')

    const {data, isLoading, isError, refetch} = useShippingMethods()

    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
    const [editingMethod, setEditingMethod] = useState<ShippingMethod | undefined>(undefined)

    const handleAdd = () => {
        setDialogMode('create')
        setEditingMethod(undefined)
        setDialogOpen(true)
    }

    const handleEdit = (method: ShippingMethod) => {
        setDialogMode('edit')
        setEditingMethod(method)
        setDialogOpen(true)
    }

    const handleClose = () => {
        setDialogOpen(false)
        setEditingMethod(undefined)
    }

    const filteredData = useMemo(() => {
        const all = data ?? []
        const query = search.trim().toLowerCase()
        if (!query) return all
        return all.filter((method) => method.name?.toLowerCase().includes(query))
    }, [data, search])

    return (
        <PageLayout title="Shipping Methods">
            <div className="space-y-4">
                <ShippingMethodToolbar
                    searchValue={search}
                    onSearchChange={setSearch}
                    canMutate={canMutate}
                    onAddShippingMethod={handleAdd}
                />

                {isError ? (
                    <div className="flex flex-col items-center justify-center py-16 text-(--c-text-muted)">
                        <p className="text-sm">Failed to load. <button onClick={() => refetch()}>Retry</button></p>
                    </div>
                ) : (
                    <ShippingMethodTable
                        data={filteredData}
                        isLoading={isLoading}
                        canMutate={canMutate}
                        onEdit={handleEdit}
                    />
                )}
            </div>

            {dialogOpen && (
                <ShippingMethodDialog
                    open={dialogOpen}
                    mode={dialogMode}
                    method={editingMethod}
                    onClose={handleClose}
                />
            )}
        </PageLayout>
    )
}
