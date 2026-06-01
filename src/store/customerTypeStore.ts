import {useEffect} from 'react';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {CustomerType} from '@/constants/enums/CustomerType';
import {STOREFRONT_TENANT_RESET_EVENT} from '@/storefront/tenant/tenantLifecycle';
import {getTenantStorageKey} from '@/utils/storefront/tenantStorageKeys';

// Re-export so existing imports of CustomerType from this module continue to work.
export {CustomerType} from '@/constants/enums/CustomerType';

/** Minimal shape of a customer profile needed to derive the pricing tier. */
export interface CustomerPricingProfile {
    /** Backend enum value: "GUEST" | "RETAILER" | "WHOLESALER" */
    shopperType?: string | null;
}

interface CustomerTypeState {
    /** Current global pricing tier – defaults to RETAILER. */
    customerType: CustomerType;
    /** Manually override the pricing tier (dev / admin use). */
    setCustomerType: (type: CustomerType) => void;
    /**
     * Derive and apply the correct pricing tier from a login response.
     * WHOLESALER shopperType → WHOLESALER tier; everything else → RETAILER tier.
     */
    syncFromProfile: (profile: CustomerPricingProfile) => void;
    /** Reset to the default retail tier (call on sign-out). */
    resetToRetail: () => void;
    /** Convenience selector: true when the active tier is WHOLESALER. */
    isWholesaler: () => boolean;
}

export const customerTypeStore = create<CustomerTypeState>()(
    persist(
        (set, get) => ({
            customerType: CustomerType.RETAILER,
            setCustomerType: (type) => set({customerType: type}),
            syncFromProfile: (profile) => {
                const tier =
                    profile.shopperType?.toUpperCase() === CustomerType.WHOLESALER
                        ? CustomerType.WHOLESALER
                        : CustomerType.RETAILER;
                set({customerType: tier});
            },
            resetToRetail: () => set({customerType: CustomerType.RETAILER}),
            isWholesaler: () => get().customerType === CustomerType.WHOLESALER,
        }),
        {
            name: getTenantStorageKey('ec_customer_type'),
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({customerType: state.customerType}),
        },
    ),
);

// Reset to RETAILER whenever the storefront tenant lifecycle is torn down.
if (typeof window !== 'undefined') {
    window.addEventListener(STOREFRONT_TENANT_RESET_EVENT, () => {
        customerTypeStore.getState().resetToRetail();
    });
}

/**
 * Dev / QA URL override.
 * `?customerType=wholesale` → WHOLESALER tier.
 * `?customerType=retail`   → RETAILER tier.
 * Applied once on mount; has no effect in production if the param is absent.
 */
export function useCustomerTypeUrlBootstrap(): void {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const raw = params.get('customerType');
        if (raw === 'wholesale') {
            customerTypeStore.getState().setCustomerType(CustomerType.WHOLESALER);
        } else if (raw === 'retail') {
            customerTypeStore.getState().setCustomerType(CustomerType.RETAILER);
        }
    }, []);
}

/** React hook – returns the current global pricing tier. */
export function useCustomerType(): CustomerType {
    return customerTypeStore((s) => s.customerType);
}

/** React hook – returns true when the active tier is WHOLESALER. */
export function useIsWholesaler(): boolean {
    return customerTypeStore((s) => s.customerType === CustomerType.WHOLESALER);
}
