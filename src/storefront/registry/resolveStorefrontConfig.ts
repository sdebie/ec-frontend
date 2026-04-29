import {resolveStorefrontClient} from '@/configs/storefront/storefrontRegistry.ts'
import {getHostname} from '@/utils/HostnameResolver.ts'
import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes.ts'
import type {ResolveStorefrontConfigOptions} from './types'
import { env } from '@/lib/env'

/**
 * Thin adapter over the existing storefront resolver.
 * Runtime ownership stays in App/RouteGuard until cutover.
 */
export function resolveActiveStorefrontConfig(
    options: ResolveStorefrontConfigOptions = {},
): StorefrontClientConfig {
    const hostname = options.hostname ?? getHostname()
    // Resolution precedence:
    // 1) Explicit override from runtime options (used by local/dev tooling)
    // 2) DEV-only env override (VITE_STORE_FRONT)
    // 3) Hostname lookup with default fallback handled by resolveStorefrontClient
    const forcedClientId = options.forcedClientId
        ? options.forcedClientId
        : env.isDev
          ? env.storefrontTenant
          : undefined
    return resolveStorefrontClient(hostname, forcedClientId)
}

