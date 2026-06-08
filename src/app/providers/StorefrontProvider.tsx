import {
    createContext,
    type PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'


import {buildNavigationModel} from '@/configs/storefront/navigationRegistry'
import {
    resolveActiveStorefrontConfig,
} from '@/configs/storefront/resolveStorefrontConfig'
import {resolveStorefrontConfigFromApi} from '@/configs/storefront/resolveStorefrontConfigFromApi'
import {env} from '@/lib/env'
import {resetSessionUserStore} from '@/store/authStore'
import {resetTenantScopedState} from '@/storefront/tenant/tenantLifecycle'

import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes.ts'
import type {
    ResolveStorefrontConfigOptions,
    StorefrontContextValue,
} from '@/configs/storefront/storefrontRegistryTypes'

interface StorefrontProviderProps extends PropsWithChildren {
    options?: ResolveStorefrontConfigOptions
}

const StorefrontContext = createContext<StorefrontContextValue | null>(null)

export function StorefrontProvider({
    children,
    options,
}: StorefrontProviderProps) {
    const [forcedClientId, setForcedClientId] = useState<string | undefined>(
        options?.forcedClientId,
    )

    // Start with the static config so the UI renders immediately,
    // then replace with the DB-backed config when the API responds.
    const staticConfig = useMemo(
        () => resolveActiveStorefrontConfig({...options, forcedClientId}),
        [forcedClientId, options],
    )

    const [liveConfig, setLiveConfig] = useState<StorefrontClientConfig | null>(null)

    useEffect(() => {
        resolveStorefrontConfigFromApi()
            .then(cfg => setLiveConfig(cfg))
            .catch(() => {
                // API not available — static config remains active
            })
    }, [forcedClientId])

    const value = useMemo<StorefrontContextValue>(() => {
        const config = liveConfig ?? staticConfig
        const navigation = buildNavigationModel(config)
        const switchTenant = (tenantId: string) => {
            if (!env.isDev) return
            if (!tenantId || tenantId === config.id) return
            resetTenantScopedState(config.id)
            resetTenantScopedState(tenantId)
            resetSessionUserStore()
            setForcedClientId(tenantId)
            setLiveConfig(null)
        }
        return {config, navigation, switchTenant}
    }, [liveConfig, staticConfig])

    return (
        <StorefrontContext.Provider value={value}>
            {children}
        </StorefrontContext.Provider>
    )
}

export function useOptionalStorefrontBoundary(): StorefrontContextValue | null {
    return useContext(StorefrontContext)
}

export function useStorefrontBoundary(): StorefrontContextValue {
    const context = useOptionalStorefrontBoundary()
    if (!context) {
        throw new Error('useStorefrontBoundary must be used within StorefrontProvider.')
    }
    return context
}

