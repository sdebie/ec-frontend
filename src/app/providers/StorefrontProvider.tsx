import {
    createContext,
    type PropsWithChildren,
    useContext,
    useMemo,
    useState,
} from 'react'
import {
    resolveActiveStorefrontConfig,
} from '@/storefront/registry/resolveStorefrontConfig'
import {buildNavigationModel} from '@/storefront/registry/navigationRegistry'
import type {
    ResolveStorefrontConfigOptions,
    StorefrontContextValue,
} from '@/storefront/registry/types'
import {resetTenantScopedState} from '@/storefront/tenant/tenantLifecycle'
import {resetSessionUserStore} from '@/store/authStore'
import {env} from '@/lib/env'

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

    const value = useMemo<StorefrontContextValue>(() => {
        const config = resolveActiveStorefrontConfig({
            ...options,
            forcedClientId,
        })
        const navigation = buildNavigationModel(config)
        const switchTenant = (tenantId: string) => {
            if (!env.isDev) return
            if (!tenantId || tenantId === config.id) return
            resetTenantScopedState(config.id)
            resetTenantScopedState(tenantId)
            resetSessionUserStore()
            setForcedClientId(tenantId)
        }
        return {config, navigation, switchTenant}
    }, [forcedClientId, options])

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

