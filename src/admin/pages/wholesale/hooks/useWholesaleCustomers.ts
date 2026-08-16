import {useCustomers} from '@/admin/hooks/customers/useCustomers'
import type {UseWholesaleCustomersParams, WholesaleCustomerListItem} from '../types'

/**
 * Wholesale customers are the customer list scoped to `shopperType = WHOLESALER`
 * — not a separate resource. This delegates to {@link useCustomers} rather than
 * issuing its own `AllCustomers`/`CustomerCount` pair.
 *
 * **That delegation is load-bearing, not tidiness.** A second key family over
 * the *same* server rows means every mutation invalidates only its own family,
 * so a status change made on one screen leaves the other showing the stale
 * value. Sharing one key family makes invalidation correct by construction
 * instead of by remembering.
 *
 * If this ever needs to diverge, change the *arguments*, never the key family.
 */
export function useWholesaleCustomers(params: UseWholesaleCustomersParams) {
    const {data, isLoading} = useCustomers({
        ...params,
        shopperType: 'WHOLESALER',
    })

    return {
        data: data?.data as WholesaleCustomerListItem[] | undefined,
        total: data?.total ?? 0,
        isLoading,
    }
}
