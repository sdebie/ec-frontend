import {useMemo, useState} from 'react'
import {PageLayout} from '@/shared/ui/components'
import {useCountrySettings} from './hooks/useCountrySettings'
import {CountrySettingsTable} from './components/CountrySettingsTable'
import {CountrySettingsToolbar} from './components/CountrySettingsToolbar'

export function CountrySettingsPage() {
    const {data, isLoading, isError, refetch} = useCountrySettings()

    const [search, setSearch] = useState('')

    const filteredData = useMemo(() => {
        const all = data ?? []
        const query = search.trim().toLowerCase()
        if (!query) return all
        return all.filter((country) => country.countryName?.toLowerCase().includes(query))
    }, [data, search])

    return (
        <PageLayout title="Country Settings">
            <div className="space-y-4">
                <CountrySettingsToolbar
                    searchValue={search}
                    onSearchChange={setSearch}
                />

                {isError ? (
                    <div className="flex flex-col items-center justify-center py-16 text-(--c-text-muted)">
                        <p className="text-sm">Failed to load. <button onClick={() => refetch()}>Retry</button></p>
                    </div>
                ) : (
                    <CountrySettingsTable
                        data={filteredData}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </PageLayout>
    )
}
