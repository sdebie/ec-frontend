/**
 * Where checkout's in-progress form values are kept (see `useFormDraft`).
 *
 * Shared rather than inlined because two components need it and they are not in
 * the same lifetime: `CheckoutPage` writes the draft, and `CheckoutSuccessPage`
 * clears it once payment is CONFIRMED — beside the cart and session it already
 * clears there.
 *
 * Clearing on confirmation rather than on submit is deliberate. A PayFast
 * shopper leaves the site entirely, and some of them abandon at the gateway and
 * come back; their typed details should still be waiting. Only a confirmed order
 * means the draft has done its job.
 */
export const CHECKOUT_DRAFT_KEY = 'ec_draft_checkout'
