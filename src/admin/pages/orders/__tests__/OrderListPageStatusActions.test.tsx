import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { useOrders } from '@/admin/hooks/orders/useOrders'
import { useUpdateOrderStatus } from '@/admin/hooks/orders/useUpdateOrderStatus'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'
import type { AdminOrderSummary, OrdersPage } from '@/admin/hooks/orders/types'
import { OrderListPage } from '../OrderListPage'

vi.mock('@/admin/hooks/orders/useOrders', () => ({ useOrders: vi.fn() }))
vi.mock('@/admin/hooks/orders/useUpdateOrderStatus', () => ({ useUpdateOrderStatus: vi.fn() }))
vi.mock('@/shared/auth/adminAuthStore', () => ({ useAdminAuthStore: vi.fn() }))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

const mutate = vi.fn()

function order(overrides: Partial<AdminOrderSummary>): AdminOrderSummary {
  return {
    id: 'order-1',
    reference: 'ORD-00001',
    customerName: 'Jane Doe',
    placedAt: '2025-01-15T10:30:00Z',
    itemCount: 3,
    total: 1500,
    status: OrderStatus.PAID,
    ...overrides,
  }
}

function setup(orders: AdminOrderSummary[], role = 'SUPER_ADMIN') {
  vi.mocked(useOrders).mockReturnValue({
    data: { data: orders, total: orders.length } as OrdersPage,
    isLoading: false,
  } as unknown as ReturnType<typeof useOrders>)

  vi.mocked(useUpdateOrderStatus).mockReturnValue({
    mutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateOrderStatus>)

  vi.mocked(useAdminAuthStore).mockImplementation((selector: unknown) => {
    const state = { role }
    return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
  })

  return render(
    <MemoryRouter>
      <OrderListPage />
    </MemoryRouter>,
  )
}

/**
 * The trigger lives in the row, but `DropdownMenu` portals its items to document.body —
 * so the trigger is scoped to the row and the item is queried globally. Only one menu is
 * open at a time, so the global query is unambiguous.
 */
async function openRowAction(
  user: ReturnType<typeof userEvent.setup>,
  action: string,
  rowIndex = 0,
) {
  const menus = screen.getAllByTestId('order-actions-menu')
  await user.click(within(menus[rowIndex]).getByRole('button'))
  // The testid sits on a wrapper; the handler is on the menuitem inside it. Clicking
  // the wrapper fires nothing, since events bubble up rather than down.
  await user.click(within(screen.getByTestId(`action-${action}`)).getByRole('menuitem'))
}

/**
 * The list shares its confirmation state with the detail page via
 * `useOrderStatusConfirmation`, so the payload logic is covered once in that hook's own
 * tests. What is only exercised here is the list's own wiring: each row must act on
 * *its* order, and offer only the actions that row's status actually allows.
 */
describe('OrderListPage — status actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('acts on the row that was clicked, not the first row', async () => {
    const user = userEvent.setup()
    setup([
      order({ id: 'delivered-order', reference: 'ORD-1', status: OrderStatus.DELIVERED }),
      order({ id: 'paid-order', reference: 'ORD-2', status: OrderStatus.PAID }),
    ])

    await openRowAction(user, 'cancel — store', 1)
    await user.click(screen.getByRole('button', { name: 'Cancel Order' }))

    expect(mutate).toHaveBeenCalledWith(
      { orderId: 'paid-order', status: OrderStatus.ADMIN_CANCELED },
      expect.anything(),
    )
  })

  it('sends a refund with no stock instruction attached', async () => {
    const user = userEvent.setup()
    setup([order({ id: 'delivered-order', status: OrderStatus.DELIVERED })])

    await openRowAction(user, 'refund')
    await user.click(screen.getByRole('button', { name: 'Refund Order' }))

    const [payload] = mutate.mock.calls[0]
    expect(payload).toEqual({ orderId: 'delivered-order', status: OrderStatus.REFUNDED })
  })

  /**
   * A forward fulfilment step is reversible by moving forward again and has nothing
   * outward-facing to warn about, so it fires straight away rather than prompting.
   */
  it('runs a forward fulfilment step without a confirmation prompt', async () => {
    const user = userEvent.setup()
    setup([order({ id: 'paid-order', status: OrderStatus.PAID })])

    await openRowAction(user, 'start processing')

    expect(mutate).toHaveBeenCalledWith({
      orderId: 'paid-order',
      status: OrderStatus.PROCESSING,
    })
  })

  /** The UI half of "no step may be skipped". */
  it('offers only the next step of the workflow for a row, never one further on', async () => {
    const user = userEvent.setup()
    setup([order({ id: 'paid-order', status: OrderStatus.PAID })])

    await user.click(within(screen.getAllByTestId('order-actions-menu')[0]).getByRole('button'))

    expect(screen.getByTestId('action-start processing')).toBeInTheDocument()
    expect(screen.queryByTestId('action-ship')).toBeNull()
    expect(screen.queryByTestId('action-deliver')).toBeNull()
  })

  /**
   * A middle-privilege role, not just the two extremes: a capability collapsed onto
   * the wrong backend role passes a SUPER_ADMIN-vs-VIEWER check by accident.
   */
  it('offers the refund action to ORDER_MANAGER, not only SUPER_ADMIN', async () => {
    const user = userEvent.setup()
    setup([order({ id: 'delivered-order', status: OrderStatus.DELIVERED })], 'ORDER_MANAGER')

    await openRowAction(user, 'refund')
    await user.click(screen.getByRole('button', { name: 'Refund Order' }))

    expect(mutate.mock.calls[0][0].status).toBe(OrderStatus.REFUNDED)
  })
})
