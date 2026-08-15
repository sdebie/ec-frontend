import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
  adminGraphqlClient: {
    request: vi.fn(),
  },
}))

vi.mock('@/shared/ui/components/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'
import { useOrders, buildVariables } from '../useOrders'
import { useOrderDetail } from '../useOrderDetail'
import { useUpdateOrderStatus } from '../useUpdateOrderStatus'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

/** The operation text actually sent, so a test can assert which one ran. */
function lastRequest() {
  const calls = vi.mocked(adminGraphqlClient.request).mock.calls
  const [document, variables] = calls[calls.length - 1] as unknown as [
    string,
    Record<string, unknown>,
  ]
  return { document, variables }
}

describe('admin order hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useOrders', () => {
    it('queries GraphQL adminOrderList and flattens it into the table\'s page shape', async () => {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue({
        adminOrderList: {
          content: [
            {
              id: 'o1',
              reference: 'ORD-ABCD1234',
              customerName: 'Thandi Nkosi',
              placedAt: '2026-08-15T09:00:00',
              itemCount: 3,
              total: 250,
              status: OrderStatus.PAID,
            },
          ],
          totalElements: 42,
        },
      })

      const { result } = renderHook(
        () => useOrders({ page: 1, pageSize: 10 }),
        { wrapper: createWrapper() },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(lastRequest().document).toContain('adminOrderList')
      expect(result.current.data).toEqual({
        data: [
          {
            id: 'o1',
            reference: 'ORD-ABCD1234',
            customerName: 'Thandi Nkosi',
            placedAt: '2026-08-15T09:00:00',
            itemCount: 3,
            total: 250,
            status: OrderStatus.PAID,
          },
        ],
        total: 42,
      })
    })

    it('converts the table\'s 1-based page to the backend\'s 0-based pageIndex', () => {
      expect(buildVariables({ page: 1, pageSize: 10 })).toMatchObject({ pageIndex: 0 })
      expect(buildVariables({ page: 3, pageSize: 25 })).toMatchObject({ pageIndex: 2, pageSize: 25 })
    })

    it('omits the ALL sentinel and empty dates instead of sending them as filters', () => {
      const variables = buildVariables({
        page: 1,
        pageSize: 10,
        status: 'ALL',
        fromDate: '',
        toDate: '',
      })

      expect(variables).not.toHaveProperty('status')
      expect(variables).not.toHaveProperty('fromDate')
      expect(variables).not.toHaveProperty('toDate')
    })

    it('passes a real status and date range through', () => {
      expect(
        buildVariables({
          page: 1,
          pageSize: 10,
          status: 'PAID',
          fromDate: '2026-08-01',
          toDate: '2026-08-15',
        }),
      ).toMatchObject({ status: 'PAID', fromDate: '2026-08-01', toDate: '2026-08-15' })
    })
  })

  describe('useOrderDetail', () => {
    it('queries GraphQL adminOrder by id and returns the detail unwrapped', async () => {
      const detail = {
        id: 'o1',
        reference: 'ORD-ABCD1234',
        customerName: 'Thandi Nkosi',
        customerEmail: 'thandi@example.com',
        placedAt: '2026-08-15T09:00:00',
        itemCount: 1,
        total: 115,
        status: OrderStatus.PAID,
        shippingAddress: {
          street: '12 Loop Street',
          city: 'Cape Town',
          province: 'Western Cape',
          postalCode: '8001',
        },
        lineItems: [],
        subtotal: 100,
        shippingCost: 0,
        vatAmount: 15,
        grandTotal: 115,
        statusHistory: [],
      }
      vi.mocked(adminGraphqlClient.request).mockResolvedValue({ adminOrder: detail })

      const { result } = renderHook(() => useOrderDetail('o1'), { wrapper: createWrapper() })

      await waitFor(() => expect(result.current.data).toEqual(detail))
      expect(lastRequest().document).toContain('adminOrder')
      expect(lastRequest().variables).toEqual({ id: 'o1' })
    })

    it('does not fire without an order id', () => {
      renderHook(() => useOrderDetail(''), { wrapper: createWrapper() })
      expect(adminGraphqlClient.request).not.toHaveBeenCalled()
    })
  })

  describe('useUpdateOrderStatus', () => {
    it('sends the mutation keyed by orderId, which is what the backend accepts', async () => {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue({
        updateOrderStatus: { id: 'o1', status: OrderStatus.ADMIN_CANCELED },
      })

      const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper: createWrapper() })

      result.current.mutate({ orderId: 'o1', status: OrderStatus.ADMIN_CANCELED })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      const { document, variables } = lastRequest()
      expect(document).toContain('updateOrderStatus')
      expect(document).toContain('$orderId')
      expect(document).not.toContain('sessionId')
      expect(variables).toMatchObject({ orderId: 'o1', status: OrderStatus.ADMIN_CANCELED })
      // Tracking is declared on the operation, so it is always sent — null when the
      // transition has none, which is every transition except Ship.
      expect(variables).toMatchObject({ trackingNumber: null, trackingCarrier: null })
    })

    /**
     * What happens to an order's goods follows from the status it moves to, so the
     * wire carries no stock instruction at all. Sending one would be a way for a
     * caller to move stock by asking, which is exactly what the server no longer
     * accepts.
     */
    it('sends no stock instruction, not even on a refund', async () => {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue({
        updateOrderStatus: { id: 'o1', status: OrderStatus.REFUNDED },
      })

      const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper: createWrapper() })

      result.current.mutate({ orderId: 'o1', status: OrderStatus.REFUNDED })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      const { document, variables } = lastRequest()
      expect(document).not.toContain('restockItems')
      expect(variables).not.toHaveProperty('restockItems')
    })
  })
})
