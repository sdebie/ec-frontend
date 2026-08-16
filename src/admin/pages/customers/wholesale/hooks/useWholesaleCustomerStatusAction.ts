import {useUpdateCustomerStatus} from '@/admin/pages/customers/hooks/useUpdateCustomerStatus'

/**
 * Wholesale customer status changes go through the same `updateCustomerStatus`
 * mutation as any other customer — there is no separate endpoint.
 *
 * A named alias so the wholesale pages read in their own vocabulary, but
 * deliberately **not** a second implementation: two implementations invalidate
 * two key families, and whichever screen you are not on keeps showing the old
 * status. One implementation means one invalidation.
 */
export const useWholesaleCustomerStatusAction = useUpdateCustomerStatus
