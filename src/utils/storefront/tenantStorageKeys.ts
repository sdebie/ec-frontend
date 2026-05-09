import {resolveStorefrontClient} from '@/configs/storefront/storefrontRegistry'
import {env} from '@/lib/env'
import {getHostname} from '@/utils/HostnameResolver'

const CART_ITEMS_KEY_BASE = 'ec_cart_order_items'
const CART_SESSION_KEY_BASE = 'cart_session_id'
const SESSION_USER_KEY_BASE = 'sessionUser'

export function getActiveStorefrontTenantId(): string {
    return resolveStorefrontClient(getHostname(), env.storefrontTenant).id
}

export function getTenantStorageKey(baseKey: string, tenantId = getActiveStorefrontTenantId()): string {
    return `${baseKey}:${tenantId}`
}

export function getCartItemsStorageKey(): string {
    return getTenantStorageKey(CART_ITEMS_KEY_BASE)
}

export function getCartSessionStorageKey(): string {
    return getTenantStorageKey(CART_SESSION_KEY_BASE)
}

export function getSessionUserStorageKey(): string {
    return getTenantStorageKey(SESSION_USER_KEY_BASE)
}
