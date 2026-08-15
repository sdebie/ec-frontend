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
  action: 'refund' | 'cancel',
  rowIndex = 0,
) {
  const menus = screen.getAllByTestId('order-actions-menu')
  await user.click(within(menus[rowIndex]).getByRole('button'))
  // The testid sits on a wrapper; the handler is on the menuitem inside it. Clicking
  // the wrapper fires nothing, since events bubble up rather than down.
  await user.click(within(screen.getByTestId(`action-${action}`)).getByRole('menuitem'))
}

const openRefund = (user: ReturnType<typeof userEvent.setup>, rowIndex = 0) =>
  openRowAction(user, 'refund', rowIndex)

/**
 * The list page shares its confirmation state with the detail page via
 * `useOrderStatusConfirmation`, so the logic is covered once in that hook's own tests.
 * What is only exercised here is the list's own wiring: each row must pass *its* status
 * into the prompt. A row passing the wrong order's status would default the restock
 * decision from the wrong order — invisible in a hook test.
 */
describe('OrderListPage — refund restock decision', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('defaults from the row being refunded, not from the first row', async () => {
    const user = userEvent.setup()
    // Row 0 is dispatched, row 1 is not: if the page passed a fixed or wrong row's
    // status, one of these two assertions has to fail.
    setup([
      order({ id: 'delivered-order', reference: 'ORD-1', status: OrderStatus.DELIVERED }),
      order({ id: 'paid-order', reference: 'ORD-2', status: OrderStatus.PAID }),
    ])

    await openRefund(user, 1)
    expect(within(screen.getByTestId('refund-restock-choice')).getByRole('checkbox')).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Refund Order' }))

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'paid-order',
        status: OrderStatus.REFUNDED,
        restockItems: true,
      }),
      expect.anything(),
    )
  })

  it('leaves the choice unticked when refunding a delivered row', async () => {
    const user = userEvent.setup()
    setup([order({ id: 'delivered-order', status: OrderStatus.DELIVERED })])

    await openRefund(user)
    expect(within(screen.getByTestId('refund-restock-choice')).getByRole('checkbox')).not.toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Refund Order' }))

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: 'delivered-order', restockItems: false }),
      expect.anything(),
    )
  })

  it('sends the staff answer over the row-derived default', async () => {
    const user = userEvent.setup()
    setup([order({ id: 'paid-order', status: OrderStatus.PAID })])

    await openRefund(user)
    // Dispatched but never marked In Transit — the case the prompt exists for.
    await user.click(within(screen.getByTestId('refund-restock-choice')).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Refund Order' }))

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ orderId: 'paid-order', restockItems: false }),
      expect.anything(),
    )
  })

  it('does not attach a restock decision to a cancellation', async () => {
    const user = userEvent.setup()
    setup([order({ id: 'paid-order', status: OrderStatus.PAID })])

    await openRowAction(user, 'cancel')

    expect(screen.queryByTestId('refund-restock-choice')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Cancel Order' }))

    const [payload] = mutate.mock.calls[0]
    expect(payload.status).toBe(OrderStatus.CANCELLED)
    expect(payload).not.toHaveProperty('restockItems')
  })

  it('offers the refund action to ORDER_MANAGER, not only SUPER_ADMIN', async () => {
    const user = userEvent.setup()
    setup([order({ id: 'paid-order', status: OrderStatus.PAID })], 'ORDER_MANAGER')

    await openRefund(user)
    expect(screen.getByTestId('refund-restock-choice')).toBeInTheDocument()
  })
})
