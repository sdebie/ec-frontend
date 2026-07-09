import type { OrderStatus } from '@/shared/types/enums/OrderStatus'

export interface AdminOrderSummary {
  id: string
  reference: string
  customerName: string
  placedAt: string
  itemCount: number
  total: number
  status: OrderStatus
}

export interface OrderLineItem {
  id: string
  productName: string
  variantSku: string
  thumbnailUrl: string | null
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface ShippingAddress {
  street: string
  city: string
  province: string
  postalCode: string
  country: string
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus
  timestamp: string
  staffName?: string
}

export interface AdminOrderDetail extends AdminOrderSummary {
  customerEmail: string
  shippingAddress: ShippingAddress
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

export interface OrderStatusUpdatePayload {
  status: OrderStatus
}
