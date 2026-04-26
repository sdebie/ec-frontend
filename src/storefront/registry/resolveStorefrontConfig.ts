import {resolveStorefrontClient} from '@/configs/storefront/storefrontRegistry.ts'
import {getHostname} from '@/utils/HostnameResolver.ts'
import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes.ts'
import type {ResolveStorefrontConfigOptions} from './types'

/**
 * Thin adapter over the existing storefront resolver.
 * Runtime ownership stays in App/RouteGuard until cutover.
 */
export function resolveActiveStorefrontConfig(
    options: ResolveStorefrontConfigOptions = {},
): StorefrontClientConfig {
    const hostname = options.hostname ?? getHostname()
    return resolveStorefrontClient(hostname, options.forcedClientId)
}

