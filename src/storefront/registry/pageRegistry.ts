import {resolveStorefrontPage as resolveLegacyStorefrontPage} from '@/configs/storefront/storefrontPageResolver.ts'
import type {RouteObject} from '@/types/routes.ts'
import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes.ts'
import type {
    StorefrontPageComponent,
    StorefrontPageKey,
} from '@/types/storefront/storefrontPageContracts.ts'

/**
 * Thin adapter around the existing resolver.
 * Keeps legacy resolver semantics unchanged during Phase 1 cutover.
 */
export function resolveStorefrontPageForRoute(
    route: RouteObject,
    storefrontConfig: StorefrontClientConfig,
) {
    return resolveLegacyStorefrontPage({
        routeKey: route.key as StorefrontPageKey,
        routeComponent: route.component as StorefrontPageComponent,
        storefrontConfig,
    })
}

