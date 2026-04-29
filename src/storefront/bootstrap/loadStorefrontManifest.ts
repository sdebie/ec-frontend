import {getStorefrontRegistry} from '@/configs/storefront/storefrontRegistry'
import {listStorefrontRouteContracts} from '@/configs/storefront/storefrontRouteContracts'

export interface StorefrontManifest {
    generatedAt: string
    tenants: string[]
    routes: Array<{ key: string; path: string; menu: boolean }>
}

/**
 * Normalizes storefront registry and route contracts into startup metadata.
 */
export function loadStorefrontManifest(): StorefrontManifest {
    const tenants = Object.keys(getStorefrontRegistry())
    const routes = listStorefrontRouteContracts().map((route) => ({
        key: route.key,
        path: route.path,
        menu: route.menu,
    }))

    return {
        generatedAt: new Date().toISOString(),
        tenants,
        routes,
    }
}
