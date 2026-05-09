import {useEffect} from 'react';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

import {STOREFRONT_TENANT_RESET_EVENT} from '@/storefront/tenant/tenantLifecycle';
import {getTenantStorageKey} from '@/utils/storefront/tenantStorageKeys';

export type CustomerType = 'retail' | 'wholesaler';

interface CustomerTypeState {
    customerType: CustomerType;
    setCustomerType: (type: CustomerType) => void;
    isWholesaler: () => boolean;
}

export const customerTypeStore = create<CustomerTypeState>()(
    persist(
        (set, get) => ({
            customerType: 'retail' satisfies CustomerType,
            setCustomerType: (type) => set({customerType: type}),
            isWholesaler: () => get().customerType === 'wholesaler',
        }),
        {
            name: getTenantStorageKey('ec_customer_type'),
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({customerType: state.customerType}),
        },
    ),
);

if (typeof window !== 'undefined') {
    window.addEventListener(STOREFRONT_TENANT_RESET_EVENT, () => {
        customerTypeStore.setState({customerType: 'retail'});
    });
}

/** Dev / QA override: `?customerType=wholesale` or `?customerType=retail` applies once on mount. */
export function useCustomerTypeUrlBootstrap(): void {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const raw = params.get('customerType');
        if (raw === 'wholesale') {
            customerTypeStore.getState().setCustomerType('wholesaler');
        } else if (raw === 'retail') {
            customerTypeStore.getState().setCustomerType('retail');
        }
    }, []);
}

export function useCustomerType(): CustomerType {
    return customerTypeStore((s) => s.customerType);
}

export function useIsWholesaler(): boolean {
    return customerTypeStore((s) => s.customerType === 'wholesaler');
}
