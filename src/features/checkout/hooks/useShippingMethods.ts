import {useQuery} from '@tanstack/react-query';
import type {ShippingMethod} from '@/services/StoreSettings.ts';
import {apiGetShippingMethods} from '@/services/StoreSettings.ts';

const isActiveMethod = (m: ShippingMethod) => (m.active ?? true) && !!m.id;

/**
 * Loads active shipping methods from the Store Settings API.
 */
export function useShippingMethods(): { shippingMethods: ShippingMethod[] } {
    const query = useQuery({
        queryKey: ['shippingMethods'],
        queryFn: () =>
            apiGetShippingMethods()
                .then((methods) => (methods ?? []).filter(isActiveMethod))
                .catch((e) => {
                    console.warn('Failed to load shipping methods', e);
                    return [] as ShippingMethod[];
                }),
        // Shipping methods change infrequently — treat as session-stable.
        staleTime: 1000 * 60 * 10,
    });

    return {shippingMethods: query.data ?? []};
}
