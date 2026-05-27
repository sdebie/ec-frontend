import {getActiveStorefrontTenantId, getTenantStorageKey} from '@/utils/storefront/tenantStorageKeys'

const TENANT_RESET_PREFIXES = [
    'ec_cart_order_items',
    'cart_session_id',
    'sessionUser',
    /** Customer price tier preference (tenant-scoped; see `customerTypeStore`) */
    'ec_customer_type',
] as const

export const STOREFRONT_TENANT_RESET_EVENT = 'storefront:tenant-reset'

/**
 * Clears known tenant-scoped persisted client state.
 * Keeps reset deterministic during tenant switching.
 */
export function resetTenantScopedState(tenantId = getActiveStorefrontTenantId()): void {
    if (typeof window === 'undefined') return

    try {
        TENANT_RESET_PREFIXES.forEach((baseKey) => {
            window.localStorage.removeItem(getTenantStorageKey(baseKey, tenantId))
        })
        window.dispatchEvent(
            new CustomEvent(STOREFRONT_TENANT_RESET_EVENT, {
                detail: {tenantId},
            }),
        )
    } catch {
        // Non-fatal: storage may be unavailable.
    }
}
