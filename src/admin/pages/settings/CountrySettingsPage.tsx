import { useMemo } from 'react'

import { DataTable, StatusBadge } from '@/shared/ui/components'
import type { ColumnDef } from '@/shared/ui/components'
import { useCountrySettings } from '@/admin/hooks/settings'
import type { CountrySetting } from '@/admin/hooks/settings'

export function CountrySettingsPage() {
  const { data, isLoading, isError, refetch } = useCountrySettings()

  const columns = useMemo<ColumnDef<CountrySetting, unknown>[]>(
    () => [
      {
        accessorKey: 'countryName',
        header: 'Country',
        cell: ({ row }) => (
          <span className={row.original.isActive === false ? 'opacity-50' : ''}>
            {row.original.countryName}
          </span>
        ),
      },
      {
        accessorKey: 'countryCode',
        header: 'Code',
        cell: ({ row }) => (
          <span className={row.original.isActive === false ? 'opacity-50' : ''}>
            {row.original.countryCode}
          </span>
        ),
      },
      {
        accessorKey: 'currencyCode',
        header: 'Currency',
        cell: ({ row }) => (
          <span className={row.original.isActive === false ? 'opacity-50' : ''}>
            {row.original.currencyCode}
          </span>
        ),
      },
      {
        accessorKey: 'locale',
        header: 'Locale',
        cell: ({ row }) => (
          <span className={row.original.isActive === false ? 'opacity-50' : ''}>
            {row.original.locale}
          </span>
        ),
      },
      {
        accessorKey: 'decimalPlaces',
        header: 'Decimals',
        cell: ({ row }) => (
          <span className={row.original.isActive === false ? 'opacity-50' : ''}>
            {row.original.decimalPlaces}
          </span>
        ),
      },
      {
        id: 'default',
        header: 'Default',
        cell: ({ row }) => (
          <span className={row.original.isActive === false ? 'opacity-50' : ''}>
            {row.original.isDefault ? (
              <StatusBadge label="Default" color="blue" />
            ) : null}
          </span>
        ),
      },
    ],
    [],
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-(--c-text)">Country Settings</h1>
      </div>

      {isError && (
        <div className="flex flex-col items-center justify-center py-16 text-(--c-text-muted)">
          <p className="text-sm">Failed to load. <button onClick={() => refetch()}>Retry</button></p>
        </div>
      )}

      {!isError && (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          showSearch={false}
        />
      )}
    </div>
  )
}
