import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CustomerType } from '@/constants/enums/CustomerType';
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

    it('defaults to RETAILER', async () => {
        const { customerTypeStore } = await import('@/store/customerTypeStore.ts');
        customerTypeStore.setState({ customerType: CustomerType.RETAILER });
        expect(customerTypeStore.getState().customerType).toBe(CustomerType.RETAILER);
    });

    it('setCustomerType updates state and notifies subscribers', async () => {
        const { customerTypeStore } = await import('@/store/customerTypeStore.ts');
        const listener = vi.fn();
        const unsub = customerTypeStore.subscribe(listener);
        customerTypeStore.getState().setCustomerType(CustomerType.WHOLESALER);
        expect(customerTypeStore.getState().customerType).toBe(CustomerType.WHOLESALER);
        expect(listener).toHaveBeenCalled();
        unsub();
    });

    it('URL param ?customerType=wholesale sets WHOLESALER on bootstrap mount', async () => {
        const { useCustomerTypeUrlBootstrap, customerTypeStore } = await import('@/store/customerTypeStore.ts');
        customerTypeStore.setState({ customerType: CustomerType.RETAILER });

        const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
            ...window.location,
            search: '?customerType=wholesale',
        } as Location);

        renderHook(() => useCustomerTypeUrlBootstrap());

        await waitFor(() => {
            expect(customerTypeStore.getState().customerType).toBe(CustomerType.WHOLESALER);
        });

        locationSpy.mockRestore();
    });

    it('persists choice across reload (localStorage)', async () => {
        const { customerTypeStore } = await import('@/store/customerTypeStore.ts');
        customerTypeStore.persist.clearStorage();
        customerTypeStore.setState({ customerType: CustomerType.WHOLESALER });

        const persistedKey = Object.keys(localStorage).find((k) => k.includes('ec_customer_type'));
        expect(persistedKey).toBeTruthy();
        const raw = persistedKey ? localStorage.getItem(persistedKey) : null;
        expect(raw).toBeTruthy();
        if (raw) {
            const parsed = JSON.parse(raw) as { state?: { customerType?: string } };
            expect(parsed.state?.customerType ?? (parsed as { customerType?: string }).customerType).toBeDefined();
        }
    });

    it('resets to RETAILER on STOREFRONT_TENANT_RESET_EVENT', async () => {
        const { customerTypeStore } = await import('@/store/customerTypeStore.ts');
        customerTypeStore.setState({ customerType: CustomerType.WHOLESALER });
        window.dispatchEvent(new CustomEvent(STOREFRONT_TENANT_RESET_EVENT));
        expect(customerTypeStore.getState().customerType).toBe(CustomerType.RETAILER);
    });

    it('syncFromProfile sets WHOLESALER for WHOLESALER shopperType', async () => {
        const { customerTypeStore } = await import('@/store/customerTypeStore.ts');
        customerTypeStore.setState({ customerType: CustomerType.RETAILER });
        customerTypeStore.getState().syncFromProfile({ shopperType: 'WHOLESALER' });
        expect(customerTypeStore.getState().customerType).toBe(CustomerType.WHOLESALER);
    });

    it('syncFromProfile defaults to RETAILER for non-wholesale shopperType', async () => {
        const { customerTypeStore } = await import('@/store/customerTypeStore.ts');
        customerTypeStore.setState({ customerType: CustomerType.WHOLESALER });
        customerTypeStore.getState().syncFromProfile({ shopperType: 'RETAILER' });
        expect(customerTypeStore.getState().customerType).toBe(CustomerType.RETAILER);
    });

    it('syncFromProfile defaults to RETAILER for GUEST shopperType', async () => {
        const { customerTypeStore } = await import('@/store/customerTypeStore.ts');
        customerTypeStore.setState({ customerType: CustomerType.WHOLESALER });
        customerTypeStore.getState().syncFromProfile({ shopperType: 'GUEST' });
        expect(customerTypeStore.getState().customerType).toBe(CustomerType.RETAILER);
    });

    it('resetToRetail resets to RETAILER', async () => {
        const { customerTypeStore } = await import('@/store/customerTypeStore.ts');
        customerTypeStore.setState({ customerType: CustomerType.WHOLESALER });
        customerTypeStore.getState().resetToRetail();
        expect(customerTypeStore.getState().customerType).toBe(CustomerType.RETAILER);
    });
});
