export interface OrderCheckoutLine {
    variantId: string
    name: string
    unitPrice: number
    quantity: number
    lineTotal: number
}

export interface CheckoutSession {
    orderId: string
    sessionId: string
    lines: OrderCheckoutLine[]
    subtotal: number
    vatAmount: number
    shippingEstimate: number
    grandTotal: number
}

export interface ShippingMethod {
    id: string
    name: string
    baseFee: number
    estimatedDays: string | null
    /**
     * Whether choosing this method needs a delivery address. Stated by the method, not
     * inferred from its fee or lead time — a free same-day collection looks exactly
     * like a free same-day delivery from those two alone.
     */
    requiresAddress: boolean
}

export interface HtmlFormField {
    name: string
    value: string
}

export interface PayFastCheckoutResponse {
    gatewayUrl: string
    fields: HtmlFormField[]
}

export interface OrderContactPayload {
    email: string
    firstName: string
    lastName: string
    shippingMethodId?: string
    streetAddress?: string
    city?: string
    province?: string
    postalCode?: string
}

/**
 * What PATCH /orders/{id}/contact returns. The totals are recomputed server-side
 * against the delivery method just selected, so they supersede the provisional
 * figures the session was created with. Optional because the contact fields are
 * the endpoint's contract and the totals were added later.
 */
export interface ContactUpdateResponse {
    orderId: string
    contactEmail: string
    contactFirstName: string
    contactLastName: string
    subtotal?: number
    vatAmount?: number
    shippingEstimate?: number
    grandTotal?: number
    totalAmount?: number
    status?: string
    shippingMethodId?: string
    shippingMethodName?: string
}

export interface OrderStatusResponse {
    id: string
    status: string
    totalAmount: number
    createdAt: string
}
