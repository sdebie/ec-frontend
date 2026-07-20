import {useEffect} from 'react'
import {useQuery} from '@tanstack/react-query'
import {storefrontHttpClient} from '@/shared/api/http/storefrontHttpClient'
import {StorefrontConfigContext} from '@/shared/config/storefrontConfig.context'
import type {StorefrontConfig} from '@/shared/types/StorefrontConfig'
import {StorefrontLoading} from '@/storefront/pages/StorefrontLoading'
import {StorefrontError} from '@/storefront/pages/StorefrontError'

interface Props {
    children: React.ReactNode
}

async function fetchStorefrontConfig(): Promise<StorefrontConfig> {
    const {data} = await storefrontHttpClient.get<StorefrontConfig>('/storefront/config')
    return data
}

export function StorefrontConfigProvider({children}: Props) {
    const {data, isLoading, isError, refetch} = useQuery({
        queryKey: ['storefront-config'],
        queryFn: fetchStorefrontConfig,
        staleTime: Infinity,
        retry: 2,
    })

    useEffect(() => {
        if (!data) return
        Object.entries(data.theme).forEach(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
            document.documentElement.style.setProperty(`--sf-${cssKey}`, value)
        })
    }, [data])

    if (isLoading) return <StorefrontLoading/>
    if (isError || !data) return <StorefrontError onRetry={refetch}/>

    return (
        <StorefrontConfigContext.Provider value={data}>
            {children}
        </StorefrontConfigContext.Provider>
    )
}
