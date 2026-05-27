import {beforeEach, describe, expect, it, vi} from 'vitest'

const removeItem = vi.fn()
const dispatchEvent = vi.fn()

vi.mock('@/utils/storefront/tenantStorageKeys', () => ({
    getActiveStorefrontTenantId: () => 'uvh',
    getTenantStorageKey: (baseKey: string, tenantId: string) => `${baseKey}:${tenantId}`,
}))

describe('resetTenantScopedState', () => {
    beforeEach(() => {
        removeItem.mockReset()
        dispatchEvent.mockReset()
        vi.stubGlobal('window', {
            localStorage: {
                removeItem,
            },
            dispatchEvent,
        })
    })

    it('clears all tenant-scoped persisted keys', async () => {
        const {resetTenantScopedState, STOREFRONT_TENANT_RESET_EVENT} = await import('@/storefront/tenant/tenantLifecycle')
        resetTenantScopedState('uvh')

        expect(removeItem).toHaveBeenCalledWith('ec_cart_order_items:uvh')
        expect(removeItem).toHaveBeenCalledWith('cart_session_id:uvh')
        expect(removeItem).toHaveBeenCalledWith('sessionUser:uvh')
        expect(removeItem).toHaveBeenCalledWith('ec_customer_type:uvh')
        expect(dispatchEvent).toHaveBeenCalledTimes(1)
        const eventArg = dispatchEvent.mock.calls[0][0] as CustomEvent<{tenantId: string}>
        expect(eventArg.type).toBe(STOREFRONT_TENANT_RESET_EVENT)
        expect(eventArg.detail.tenantId).toBe('uvh')
    })
})
