import {
    resolveStorefrontClient,
    resolveStorefrontClientByHostname,
    resolveStorefrontClientById,
} from '@/configs/storefront/storefrontRegistry.ts'
import {getHostname} from '@/utils/HostnameResolver.ts'
import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes.ts'
import type {ResolveStorefrontConfigOptions} from './types'
import { env } from '@/lib/env'

const getPathname = (): string => {
    if (typeof window === 'undefined') return '/'
    return window.location.pathname
}

const resolveTenantFromPath = (pathname: string): string | undefined => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments[0] !== 't') return undefined
    return segments[1]
}

/**
 * Thin adapter over the existing storefront resolver.
 * Runtime ownership stays in App/RouteGuard until cutover.
 */
export function resolveActiveStorefrontConfig(
    options: ResolveStorefrontConfigOptions = {},
): StorefrontClientConfig {
    const hostname = options.hostname ?? getHostname()
    const pathname = options.pathname ?? getPathname()

    // Resolution precedence:
    // 1) Explicit runtime override (dev switch)
    // 2) Hostname match
    // 3) /t/:tenantId path segment
    // 4) Env tenant override (VITE_STORE_FRONT / VITE_DEFAULT_TENANT_ID)
    // 5) Registry default
    if (options.forcedClientId) {
        return resolveStorefrontClient(hostname, options.forcedClientId)
    }

    const hostnameMatch = resolveStorefrontClientByHostname(hostname)
    if (hostnameMatch) {
        return hostnameMatch
    }

    const tenantFromPath = resolveTenantFromPath(pathname)
    const pathMatch = resolveStorefrontClientById(tenantFromPath)
    if (pathMatch) {
        return pathMatch
    }

    const envTenant = env.storefrontTenant ?? env.storefrontDefaultTenant
    const envMatch = resolveStorefrontClientById(envTenant)
    if (envMatch) {
        return envMatch
    }

    return resolveStorefrontClient(hostname)
}

