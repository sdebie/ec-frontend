import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useOrderDetail } from '@/admin/pages/orders/hooks/useOrderDetail'
import { useUpdateOrderStatus } from '@/admin/pages/orders/hooks/useUpdateOrderStatus'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'
import type { AdminOrderDetail } from '@/admin/pages/orders/types'
import { OrderDetailPage } from '../OrderDetailPage'

vi.mock('@/admin/pages/orders/hooks/useOrderDetail', () => ({ useOrderDetail: vi.fn() }))
vi.mock('@/admin/pages/orders/hooks/useUpdateOrderStatus', () => ({ useUpdateOrderStatus: vi.fn() }))
vi.mock('@/shared/auth/adminAuthStore', () => ({ useAdminAuthStore: vi.fn() }))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useParams: () => ({ orderId: 'test-order-id' }) }
})

const baseOrder: AdminOrderDetail = {
  id: 'test-order-id',
  reference: 'ORD-00123',
  customerName: 'John Smith',
  customerEmail: 'john@example.com',
  placedAt: '2025-06-15T10:32:00Z',
  itemCount: 1,
  total: 25000,
  status: OrderStatus.PAID,
  shippingAddress: {
    street: '123 Main Street',
    city: 'Cape Town',
    province: 'Western Cape',
    postalCode: '8001',
  },
  lineItems: [
    {
      id: 'item-1',
      productName: 'Premium Widget',
      variantSku: 'WDG-001-BLK',
      thumbnailUrl: null,
      unitPrice: 25000,
      quantity: 1,
      lineTotal: 25000,
    },
  ],
  subtotal: 25000,
  shippingCost: 0,
  vatAmount: 0,
  grandTotal: 25000,
  statusHistory: [],
} as unknown as AdminOrderDetail

const mutate = vi.fn()

function setup(status: OrderStatus, role = 'SUPER_ADMIN') {
  vi.mocked(useOrderDetail).mockReturnValue({
    data: { ...baseOrder, status },
    isLoading: false,
    error: null,
  } as unknown as ReturnType<typeof useOrderDetail>)

  vi.mocked(useUpdateOrderStatus).mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateOrderStatus>)

  vi.mocked(useAdminAuthStore).mockImplementation((selector: unknown) => {
    const state = { role }
    return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
  })

  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <OrderDetailPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

/**
 * What actually reaches the mutation when a staff member acts, rather than merely
 * that a button rendered.
 *
 * The payload deliberately carries no stock instruction: what happens to an order's
 * goods follows from the status it moves to, so there is nothing here for a staff
 * member to answer and nothing for the page to get wrong.
 */
describe('OrderDetailPage — status actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends a refund with no stock instruction attached', async () => {
    const user = userEvent.setup()
    setup(OrderStatus.DELIVERED)

    // Refund is in the "More actions" dropdown for DELIVERED orders (Partial Refund is primary)
    await user.click(screen.getByText('More actions'))
    await user.click(screen.getByRole('menuitem', { name: 'Refund' }))
    await user.click(screen.getByRole('button', { name: 'Refund Order' }))

    const [payload] = mutate.mock.calls[0]
    expect(payload).toEqual({ orderId: 'test-order-id', status: OrderStatus.REFUNDED })
  })

  it('sends a partial refund as its own status', async () => {
    const user = userEvent.setup()
    setup(OrderStatus.DELIVERED)

    // Partial Refund is the primary button for DELIVERED orders
    await user.click(screen.getByRole('button', { name: 'Partial Refund' }))
    await user.click(screen.getByRole('button', { name: 'Partially Refund' }))

    const [payload] = mutate.mock.calls[0]
    expect(payload).toEqual({
      orderId: 'test-order-id',
      status: OrderStatus.PARTIALLY_REFUNDED,
    })
  })

  /** Who ended the order is recorded by the status itself, not just the timeline. */
  it('sends a store cancellation as ADMIN_CANCELED', async () => {
    const user = userEvent.setup()
    setup(OrderStatus.PAID)

    // Cancel — Store is in the "More actions" dropdown for PAID orders
    await user.click(screen.getByText('More actions'))
    await user.click(screen.getByText('Cancel — Store').closest('button')!)
    await user.click(screen.getByRole('button', { name: 'Cancel Order' }))

    expect(mutate.mock.calls[0][0].status).toBe(OrderStatus.ADMIN_CANCELED)
  })

  it('sends a customer cancellation as USER_CANCELED', async () => {
    const user = userEvent.setup()
    setup(OrderStatus.PAID)

    // Cancel — Customer is in the "More actions" dropdown for PAID orders
    await user.click(screen.getByText('More actions'))
    await user.click(screen.getByText('Cancel — Customer').closest('button')!)
    await user.click(screen.getByRole('button', { name: 'Cancel Order' }))

    expect(mutate.mock.calls[0][0].status).toBe(OrderStatus.USER_CANCELED)
  })

  it('no longer offers any stock decision on a refund', async () => {
    const user = userEvent.setup()
    setup(OrderStatus.DELIVERED)

    // Refund is in the dropdown for DELIVERED orders
    await user.click(screen.getByText('More actions'))
    await user.click(screen.getByRole('menuitem', { name: 'Refund' }))

    expect(screen.queryByTestId('refund-restock-choice')).toBeNull()
    expect(screen.queryByRole('checkbox')).toBeNull()
  })

  /**
   * A middle-privilege role, not just the two extremes: a capability collapsed onto
   * the wrong backend role passes a SUPER_ADMIN-vs-VIEWER check by accident.
   */
  it('offers the refund action to ORDER_MANAGER, not only SUPER_ADMIN', async () => {
    const user = userEvent.setup()
    setup(OrderStatus.DELIVERED, 'ORDER_MANAGER')

    // Refund is in the dropdown for DELIVERED orders
    await user.click(screen.getByText('More actions'))
    await user.click(screen.getByRole('menuitem', { name: 'Refund' }))
    await user.click(screen.getByRole('button', { name: 'Refund Order' }))

    expect(mutate.mock.calls[0][0].status).toBe(OrderStatus.REFUNDED)
  })

  /**
   * The UI half of "no step may be skipped": a paid order has to be processed before
   * it can be shipped, so Ship must not be on offer yet.
   */
  it('offers only the next step of the workflow, never one further on', async () => {
    setup(OrderStatus.PAID)

    expect(screen.getByRole('button', { name: 'Start Processing' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ship' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Deliver' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Mark Collected' })).toBeNull()
  })
})
