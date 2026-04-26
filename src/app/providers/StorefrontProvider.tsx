import {
    createContext,
    type PropsWithChildren,
    useContext,
    useMemo,
} from 'react'
import {
    resolveActiveStorefrontConfig,
} from '@/storefront/registry/resolveStorefrontConfig'
import {buildNavigationModel} from '@/storefront/registry/navigationRegistry'
import type {
    ResolveStorefrontConfigOptions,
    StorefrontContextValue,
} from '@/storefront/registry/types'

interface StorefrontProviderProps extends PropsWithChildren {
    options?: ResolveStorefrontConfigOptions
}

const StorefrontContext = createContext<StorefrontContextValue | null>(null)

/**
 * Dormant provider boundary that reuses current storefront resolvers.
 */
export function StorefrontProvider({
    children,
    options,
}: StorefrontProviderProps) {
    const value = useMemo<StorefrontContextValue>(() => {
        const config = resolveActiveStorefrontConfig(options)
        const navigation = buildNavigationModel(config)
        return {config, navigation}
    }, [options?.forcedClientId, options?.hostname])

    return (
        <StorefrontContext.Provider value={value}>
            {children}
        </StorefrontContext.Provider>
    )
}

/**
 * Optional boundary seam for phased cutovers.
 * Returns null when called outside StorefrontProvider.
 */
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

