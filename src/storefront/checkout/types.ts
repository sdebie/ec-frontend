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

export interface OrderStatusResponse {
  id: string
  status: string
  totalAmount: number
  createdAt: string
}
