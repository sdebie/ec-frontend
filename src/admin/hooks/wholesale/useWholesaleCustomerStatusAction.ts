import { useUpdateCustomerStatus } from '@/admin/hooks/customers/useUpdateCustomerStatus'

/**
 * Wholesale customer status changes go through the same `updateCustomerStatus`
 * mutation as any other customer — there was never a second endpoint, only a
 * second copy of the hook.
 *
 * Kept as a named alias so the wholesale pages read in their own vocabulary,
 * but it is deliberately **not** a second implementation: the duplicate used to
 * invalidate `['admin','wholesale-customers']` while its twin invalidated
 * `['admin','customers']`, so whichever screen you were not on kept showing the
 * old status. One implementation means one invalidation.
 */
export const useWholesaleCustomerStatusAction = useUpdateCustomerStatus
