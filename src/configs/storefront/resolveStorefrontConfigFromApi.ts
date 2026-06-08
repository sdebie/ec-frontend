import {resolveStorefrontClientById} from '@/configs/storefront/storefrontRegistry.ts'

import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes.ts'

/**
 * Fetches storefront config assembled from store_settings rows.
 * On success, merges code-only fields (pages.variants, routes.extra, slots)
 * from the static tenant config so the Vite registry still owns component references.
 * Throws on network failure — callers should fall back to the static resolver.
 */
export async function resolveStorefrontConfigFromApi(): Promise<StorefrontClientConfig> {
    const res = await fetch('/api/storefront/config')
    if (!res.ok) throw new Error(`Storefront config fetch failed: ${res.status}`)

    const apiConfig: StorefrontClientConfig = await res.json()

    // Pull code-only fields from the static registry entry for this tenant id.
    // These reference React component files and cannot be stored as data.
    const staticConfig = resolveStorefrontClientById(apiConfig.id)

    return {
        ...apiConfig,
        pages: {
            ...apiConfig.pages,
            variants: staticConfig?.pages?.variants,
        },
        routes: staticConfig?.routes,
        slots: staticConfig?.slots,
    }
}
