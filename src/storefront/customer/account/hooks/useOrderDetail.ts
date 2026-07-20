import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { graphqlClient } from '@/shared/api/graphql/graphqlClient'

// --- View model (what the OrderDetailPage renders) ---

export interface OrderAddress {
  line1: string
  line2: string | null
  suburb: string | null
  city: string
  province: string
  postalCode: string
}

export interface OrderLineItem {
  productName: string
  variantName: string
  quantity: number
  unitPrice: number
}

export interface OrderStatusEvent {
  status: string
  timestamp: string
}

export interface OrderDetail {
  id: string
  orderDate: string
  status: string
  totalAmount: number
  shippingAddress: OrderAddress
  lineItems: OrderLineItem[]
  statusHistory: OrderStatusEvent[]
}

// --- Raw backend shape (OrderDetailRespDto) ---
// The backend stores shipping as flat columns, exposes `items` (not lineItems),
// and dates as `createdAt`. There is no `suburb` column. Item names come from
// the linked variant/product, and the variant "name" is its attributes JSON.

interface RawOrderItem {
  quantity: number | null
  unitPrice: number | null
  variant: {
    attributesJson: string | null
    product: { name: string | null } | null
  } | null
}

interface RawStatusEvent {
  status: string | null
  createdAt: string | null
}

interface RawOrderDetail {
  id: string
  createdAt: string | null
  status: string | null
  totalAmount: number | null
  shippingAddressLine1: string | null
  shippingAddressLine2: string | null
  shippingCity: string | null
  shippingProvince: string | null
  shippingPostalCode: string | null
  items: RawOrderItem[] | null
  statusHistory: RawStatusEvent[] | null
}

interface RawOrderDetailResponse {
  getOrderDetail: RawOrderDetail | null
}

interface OrderDetailResponse {
  getOrderDetail: OrderDetail | null
}

const ORDER_DETAIL_QUERY = gql`
  query getOrderDetail($id: String!) {
    getOrderDetail(id: $id) {
      id
      createdAt
      status
      totalAmount
      shippingAddressLine1
      shippingAddressLine2
      shippingCity
      shippingProvince
      shippingPostalCode
      items {
        quantity
        unitPrice
        variant {
          attributesJson
          product {
            name
          }
        }
      }
      statusHistory {
        status
        createdAt
      }
    }
  }
`

/** Renders a variant's attributes JSON (e.g. {"Size":"L","Colour":"Red"}) as "L / Red". */
function formatVariantName(attributesJson: string | null | undefined): string {
  if (!attributesJson) return ''
  try {
    const attrs = JSON.parse(attributesJson) as Record<string, unknown>
    return Object.values(attrs)
      .filter((v) => v != null && v !== '')
      .map(String)
      .join(' / ')
  } catch {
    return ''
  }
}

function toOrderDetail(raw: RawOrderDetail): OrderDetail {
  return {
    id: raw.id,
    orderDate: raw.createdAt ?? '',
    status: raw.status ?? '',
    totalAmount: raw.totalAmount ?? 0,
    shippingAddress: {
      line1: raw.shippingAddressLine1 ?? '',
      line2: raw.shippingAddressLine2,
      suburb: null, // no backend column
      city: raw.shippingCity ?? '',
      province: raw.shippingProvince ?? '',
      postalCode: raw.shippingPostalCode ?? '',
    },
    lineItems: (raw.items ?? []).map((item) => ({
      productName: item.variant?.product?.name ?? 'Unknown product',
      variantName: formatVariantName(item.variant?.attributesJson),
      quantity: item.quantity ?? 0,
      unitPrice: item.unitPrice ?? 0,
    })),
    statusHistory: (raw.statusHistory ?? []).map((event) => ({
      status: event.status ?? '',
      timestamp: event.createdAt ?? '',
    })),
  }
}

export function useOrderDetail(orderId: string) {
  return useQuery<OrderDetailResponse>({
    queryKey: ['customer', 'orders', orderId],
    queryFn: async () => {
      const res = await graphqlClient.request<RawOrderDetailResponse>(ORDER_DETAIL_QUERY, {
        id: orderId,
      })
      return { getOrderDetail: res.getOrderDetail ? toOrderDetail(res.getOrderDetail) : null }
    },
    enabled: !!orderId,
  })
}
