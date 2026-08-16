import type {OrderStatus} from '@/shared/types/enums/OrderStatus'

export interface AdminOrderSummary {
    id: string
    reference: string
    /** Empty for an order placed without contact details captured. */
    customerName: string | null
    placedAt: string
    itemCount: number
    total: number
    status: OrderStatus
}

export interface OrderLineItem {
    id: string
    productName: string | null
    variantSku: string | null
    thumbnailUrl: string | null
    unitPrice: number
    quantity: number
    lineTotal: number
}

export interface ShippingAddress {
    street: string | null
    city: string | null
    province: string | null
    postalCode: string | null
}

export interface OrderStatusHistoryEntry {
    status: OrderStatus
    timestamp: string
    /** "SYSTEM" for an automated transition. */
    staffName?: string | null
}

export interface AdminOrderDetail extends AdminOrderSummary {
    customerEmail: string | null
    /** Nullable in the schema (`shippingAddress: AdminOrderAddressDto`), so it is nullable here. */
    shippingAddress: ShippingAddress | null
    /** Courier details, present only once the order has been marked shipped. */
    trackingNumber: string | null
    trackingCarrier: string | null
    lineItems: OrderLineItem[]
    subtotal: number
    shippingCost: number
    vatAmount: number
    grandTotal: number
    statusHistory: OrderStatusHistoryEntry[]
}

export interface OrdersPage {
    data: AdminOrderSummary[]
    total: number
}
