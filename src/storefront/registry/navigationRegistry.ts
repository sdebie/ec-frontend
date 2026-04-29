import {listStorefrontRouteContracts} from '@/configs/storefront/storefrontRouteContracts.ts'
import type {
    NavMenuItem,
    StorefrontClientConfig,
} from '@/types/storefront/storefrontTypes.ts'
import type {StorefrontNavigationModel} from './types'

function normalizePath(value: string): string {
    const [withoutQuery] = value.split('?')
    const [withoutHash] = withoutQuery.split('#')
    const trimmed = withoutHash.trim()
    if (trimmed === '/') return '/'
    return trimmed.replace(/\/+$/, '')
}

export function listKnownStorefrontPaths(): Set<string> {
    return new Set(
        listStorefrontRouteContracts().map((route) => normalizePath(route.path)),
    )
}

/**
 * Builds a navigation read model from current config/routes.
 * Keeps existing source of truth unchanged.
 */
export function buildNavigationModel(
    storefrontConfig: StorefrontClientConfig,
): StorefrontNavigationModel {
    const items: NavMenuItem[] = storefrontConfig.navigation.menuItems ?? []
    return {
        items,
        knownPaths: listKnownStorefrontPaths(),
    }
}

