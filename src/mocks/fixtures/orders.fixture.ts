import type { MyOrder } from '@/storefront/customer/account/hooks/useMyOrders'
import type { OrderDetail } from '@/storefront/customer/account/hooks/useOrderDetail'

export const myOrdersFixture: MyOrder[] = [
  {
    id: 'order-001',
    orderDate: '2024-11-15T10:30:00Z',
    status: 'DELIVERED',
    itemCount: 3,
    totalAmount: 4599.97,
  },
  {
    id: 'order-002',
    orderDate: '2024-12-01T14:20:00Z',
    status: 'IN_TRANSIT',
    itemCount: 1,
    totalAmount: 1299.99,
  },
  {
    id: 'order-003',
    orderDate: '2024-12-10T09:15:00Z',
    status: 'PAID',
    itemCount: 2,
    totalAmount: 2849.00,
  },
  {
    id: 'order-004',
    orderDate: '2024-10-05T16:45:00Z',
    status: 'CANCELLED',
    itemCount: 1,
    totalAmount: 349.95,
  },
]

export const orderDetailFixture: OrderDetail = {
  id: 'order-001',
  orderDate: '2024-11-15T10:30:00Z',
  status: 'DELIVERED',
  totalAmount: 4599.97,
  shippingAddress: {
    line1: '1 Dev Street',
    line2: null,
    suburb: 'Techpark',
    city: 'Cape Town',
    province: 'Western Cape',
    postalCode: '8001',
  },
  lineItems: [
    {
      productName: 'Wireless Noise-Cancelling Headphones',
      variantName: 'Black',
      quantity: 1,
      unitPrice: 1299.99,
    },
    {
      productName: 'Ergonomic Office Chair',
      variantName: 'Grey Mesh',
      quantity: 1,
      unitPrice: 3299.98,
    },
  ],
  statusHistory: [
    { status: 'CREATED', timestamp: '2024-11-15T10:30:00Z' },
    { status: 'PAID', timestamp: '2024-11-15T10:32:00Z' },
    { status: 'IN_TRANSIT', timestamp: '2024-11-17T08:00:00Z' },
    { status: 'DELIVERED', timestamp: '2024-11-20T14:15:00Z' },
  ],
}
