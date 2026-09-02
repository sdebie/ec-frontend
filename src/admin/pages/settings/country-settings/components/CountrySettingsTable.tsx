import {useMemo} from 'react'

import type {ColumnDef} from '@/shared/ui/components'
import {DataTable, StatusBadge} from '@/shared/ui/components'
import type {CountrySetting} from '../types'

interface CountrySettingsTableProps {
    data: CountrySetting[]
    isLoading: boolean
}

export function CountrySettingsTable({data, isLoading}: CountrySettingsTableProps) {
    const columns = useMemo<ColumnDef<CountrySetting, unknown>[]>(
        () => [
            {
                accessorKey: 'countryName',
                header: 'Country',
                cell: ({row}) => (
                    <span className={!row.original.isActive ? 'opacity-50' : ''}>
                        {row.original.countryName}
                    </span>
                ),
            },
            {
                accessorKey: 'countryCode',
                header: 'Code',
                cell: ({row}) => (
                    <span className={!row.original.isActive ? 'opacity-50' : ''}>
                        {row.original.countryCode}
                    </span>
                ),
            },
            {
                accessorKey: 'currencyCode',
                header: 'Currency',
                cell: ({row}) => (
                    <span className={!row.original.isActive ? 'opacity-50' : ''}>
                        {row.original.currencyCode}
                    </span>
                ),
            },
            {
                accessorKey: 'locale',
                header: 'Locale',
                cell: ({row}) => (
                    <span className={!row.original.isActive ? 'opacity-50' : ''}>
                        {row.original.locale}
                    </span>
                ),
            },
            {
                accessorKey: 'decimalPlaces',
                header: 'Decimals',
                cell: ({row}) => (
                    <span className={!row.original.isActive ? 'opacity-50' : ''}>
                        {row.original.decimalPlaces}
                    </span>
                ),
            },
            {
                id: 'default',
                header: 'Default',
                cell: ({row}) => (
                    <span className={!row.original.isActive ? 'opacity-50' : ''}>
                        {row.original.isDefault ? (
                            <StatusBadge label="Default" color="blue"/>
                        ) : null}
                    </span>
                ),
            },
        ],
        [],
    )

    return (
        <DataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            showSearch={false}
            emptyMessage="No countries found"
        />
    )
}
