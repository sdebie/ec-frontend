import type {CheckoutFormValues} from './checkoutFormSchema'
import type {CheckoutSession, ContactUpdateResponse, OrderContactPayload} from './types'

/**
 * Adapts the form values into the contact payload the order endpoint accepts.
 *
 * Address fields are sent only when the chosen method delivers — a collection
 * order must not carry a half-filled address, and the form clears those fields
 * when the shopper switches to collection.
 */
export function toContactPayload(values: CheckoutFormValues): OrderContactPayload {
    const payload: OrderContactPayload = {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        shippingMethodId: values.shippingMethodId,
    }

    if (values.requiresAddress) {
        payload.streetAddress = values.streetAddress || undefined
        payload.city = values.city || undefined
        payload.province = values.province || undefined
        payload.postalCode = values.postalCode || undefined
    }

    return payload
}

/**
 * Folds the server's recomputed totals back into the checkout session.
 *
 * The order is priced at creation against the DEFAULT delivery estimate, so its
 * totals are provisional until a method is chosen; the contact endpoint reprices
 * and returns the real figures. Applying them here keeps the summary and the
 * amount the gateway charges in agreement. Only totals are taken — the lines are
 * the ones the server already priced and never change here.
 */
export function applyServerTotals(
    session: CheckoutSession,
    response: ContactUpdateResponse,
): CheckoutSession {
    return {
        ...session,
        subtotal: response.subtotal ?? session.subtotal,
        vatAmount: response.vatAmount ?? session.vatAmount,
        shippingEstimate: response.shippingEstimate ?? session.shippingEstimate,
        grandTotal: response.grandTotal ?? session.grandTotal,
    }
}
