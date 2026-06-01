import { useEffect, useState } from 'react';

import { apiGetShippingMethods } from '@/services/StoreSettings.ts';

import type { ShippingMethod } from '@/services/StoreSettings.ts';


/**
 * Loads active shipping methods from the Store Settings API (§5 deviation: not threaded from tenant config until Phase 1).
 */
export function useShippingMethods(): { shippingMethods: ShippingMethod[] } {
    const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const methods = await apiGetShippingMethods();
                if (!cancelled) {
                    setShippingMethods((methods || []).filter((m) => (m.active ?? true) && !!m.id));
                }
            } catch (e) {
                console.warn('Failed to load shipping methods', e);
                if (!cancelled) setShippingMethods([]);
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, []);

    return { shippingMethods };
}
