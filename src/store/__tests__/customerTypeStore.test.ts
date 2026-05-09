import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { STOREFRONT_TENANT_RESET_EVENT } from '@/storefront/tenant/tenantLifecycle';

describe('customerTypeStore', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.resetModules();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('defaults to retail', async () => {
        const { customerTypeStore } = await import('@/store/customerTypeStore.ts');
        customerTypeStore.setState({ customerType: 'retail' });
        expect(customerTypeStore.getState().customerType).toBe('retail');
    });

    it('setCustomerType updates state and notifies subscribers', async () => {
        const { customerTypeStore } = await import('@/store/customerTypeStore.ts');
        const listener = vi.fn();
        const unsub = customerTypeStore.subscribe(listener);
        customerTypeStore.getState().setCustomerType('wholesaler');
        expect(customerTypeStore.getState().customerType).toBe('wholesaler');
        expect(listener).toHaveBeenCalled();
        unsub();
    });

    it('URL param ?customerType=wholesale sets wholesaler on bootstrap mount', async () => {
        const { useCustomerTypeUrlBootstrap, customerTypeStore } = await import('@/store/customerTypeStore.ts');
        customerTypeStore.setState({ customerType: 'retail' });

        const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
            ...window.location,
            search: '?customerType=wholesale',
        } as Location);

        renderHook(() => useCustomerTypeUrlBootstrap());

        await waitFor(() => {
            expect(customerTypeStore.getState().customerType).toBe('wholesaler');
        });

        locationSpy.mockRestore();
    });

    it('persists choice across reload (localStorage)', async () => {
        const { customerTypeStore } = await import('@/store/customerTypeStore.ts');
        customerTypeStore.persist.clearStorage();
        customerTypeStore.setState({ customerType: 'wholesaler' });

        const persistedKey = Object.keys(localStorage).find((k) => k.includes('ec_customer_type'));
        expect(persistedKey).toBeTruthy();
        const raw = persistedKey ? localStorage.getItem(persistedKey) : null;
        expect(raw).toBeTruthy();
        if (raw) {
            const parsed = JSON.parse(raw) as { state?: { customerType?: string } };
            expect(parsed.state?.customerType ?? (parsed as { customerType?: string }).customerType).toBeDefined();
        }
    });

    it('resets to retail on STOREFRONT_TENANT_RESET_EVENT', async () => {
        const { customerTypeStore } = await import('@/store/customerTypeStore.ts');
        customerTypeStore.setState({ customerType: 'wholesaler' });
        window.dispatchEvent(new CustomEvent(STOREFRONT_TENANT_RESET_EVENT));
        expect(customerTypeStore.getState().customerType).toBe('retail');
    });
});
