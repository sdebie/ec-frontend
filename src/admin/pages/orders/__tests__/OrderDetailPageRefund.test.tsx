import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useOrderDetail } from '@/admin/hooks/orders/useOrderDetail'
import { useUpdateOrderStatus } from '@/admin/hooks/orders/useUpdateOrderStatus'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'
import type { AdminOrderDetail } from '@/admin/hooks/orders/types'
import { OrderDetailPage } from '../OrderDetailPage'

vi.mock('@/admin/hooks/orders/useOrderDetail', () => ({ useOrderDetail: vi.fn() }))
vi.mock('@/admin/hooks/orders/useUpdateOrderStatus', () => ({ useUpdateOrderStatus: vi.fn() }))
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

async function openRefundDialog(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /refund/i }))
  return screen.getByTestId('refund-restock-choice')
}

/**
 * The refund dialog is where the stock decision is made, so these assert the decision
 * that actually reaches the mutation — not merely that a checkbox rendered. A wrong
 * default silently overstates sellable stock, which is invisible until an oversell.
 */
describe('OrderDetailPage — refund restock decision', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('pre-ticks the choice for an undispatched order and sends restockItems: true', async () => {
    const user = userEvent.setup()
    setup(OrderStatus.PAID)

    const choice = await openRefundDialog(user)
    expect(within(choice).getByRole('checkbox')).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Refund Order' }))

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ status: OrderStatus.REFUNDED, restockItems: true }),
      expect.anything(),
    )
  })

  it('leaves the choice unticked for a delivered order and sends restockItems: false', async () => {
    const user = userEvent.setup()
    setup(OrderStatus.DELIVERED)

    const choice = await openRefundDialog(user)
    expect(within(choice).getByRole('checkbox')).not.toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Refund Order' }))

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ status: OrderStatus.REFUNDED, restockItems: false }),
      expect.anything(),
    )
  })

  it('sends the staff member’s answer, not the status-derived default', async () => {
    const user = userEvent.setup()
    setup(OrderStatus.PAID)

    const choice = await openRefundDialog(user)
    // The case the whole design exists for: dispatched but never marked In Transit.
    await user.click(within(choice).getByRole('checkbox'))

    await user.click(screen.getByRole('button', { name: 'Refund Order' }))

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ status: OrderStatus.REFUNDED, restockItems: false }),
      expect.anything(),
    )
  })

  it('does not attach a restock decision to a cancellation', async () => {
    const user = userEvent.setup()
    setup(OrderStatus.PAID)

    // The page's trigger is "Cancel"; the dialog's confirm is "Cancel Order".
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(screen.queryByTestId('refund-restock-choice')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Cancel Order' }))

    const [payload] = mutate.mock.calls[0]
    expect(payload.status).toBe(OrderStatus.CANCELLED)
    expect(payload).not.toHaveProperty('restockItems')
  })

  it('offers the refund action to ORDER_MANAGER, not only SUPER_ADMIN', async () => {
    const user = userEvent.setup()
    setup(OrderStatus.PAID, 'ORDER_MANAGER')

    const choice = await openRefundDialog(user)
    expect(within(choice).getByRole('checkbox')).toBeChecked()
  })
})
