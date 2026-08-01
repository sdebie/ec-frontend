import { useCustomers } from '@/admin/hooks/customers/useCustomers'
import type { UseWholesaleCustomersParams, WholesaleCustomerListItem } from './types'

/**
 * Wholesale customers are the customer list scoped to `shopperType = WHOLESALER`
 * — not a separate resource. This delegates to {@link useCustomers} rather than
 * issuing its own `AllCustomers`/`CustomerCount` pair.
 *
 * **That delegation is load-bearing, not tidiness.** Until 2026-07-28 this hook
 * was a copy of `useCustomers` with its own React Query key family
 * (`['admin','wholesale-customers',…]`) over the *same* server rows, so a status
 * change made on one screen left the other screen showing the stale value —
 * every mutation invalidated only its own family. Sharing one key family makes
 * invalidation correct by construction instead of by remembering.
 *
 * If this ever needs to diverge, change the *arguments*, never the key family.
 */
export function useWholesaleCustomers(params: UseWholesaleCustomersParams) {
  const { data, isLoading } = useCustomers({
    ...params,
    shopperType: 'WHOLESALER',
  })

  return {
    // The list shape is a subset of AdminCustomerSummary; the extra fields the
    // shared query selects are simply unread here.
    data: data?.data as WholesaleCustomerListItem[] | undefined,
    total: data?.total ?? 0,
    isLoading,
  }
}
