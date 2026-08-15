import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useOrders } from '@/admin/hooks/orders/useOrders'
import { useUpdateOrderStatus } from '@/admin/hooks/orders/useUpdateOrderStatus'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'
import type { AdminOrderSummary, OrdersPage } from '@/admin/hooks/orders/types'
import { OrderListPage } from '../OrderListPage'

const mockNavigate = vi.fn()

vi.mock('@/admin/hooks/orders/useOrders', () => ({
  useOrders: vi.fn(),
}))
vi.mock('@/admin/hooks/orders/useUpdateOrderStatus', () => ({
  useUpdateOrderStatus: vi.fn(),
}))
vi.mock('@/shared/auth/adminAuthStore', () => ({
  useAdminAuthStore: vi.fn(),
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

// --- Mock Data Helpers ---

export function createMockOrder(overrides?: Partial<AdminOrderSummary>): AdminOrderSummary {
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

export function createMockOrdersPage(overrides?: Partial<OrdersPage>): OrdersPage {
  return {
    data: [createMockOrder()],
    total: 1,
    ...overrides,
  }
}

// --- Setup Helpers ---

function setupDefaultMocks(overrides?: {
  useOrdersReturn?: Partial<ReturnType<typeof useOrders>>
  role?: string
  ordersData?: OrdersPage
}) {
  const ordersData = overrides?.ordersData ?? createMockOrdersPage()

  vi.mocked(useOrders).mockReturnValue({
    data: ordersData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides?.useOrdersReturn,
  } as unknown as ReturnType<typeof useOrders>)

  vi.mocked(useUpdateOrderStatus).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateOrderStatus>)

  vi.mocked(useAdminAuthStore).mockImplementation((selector: unknown) => {
    const state = { role: overrides?.role ?? 'SUPER_ADMIN' }
    return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
  })
}

function renderPage() {
  return render(
    <MemoryRouter>
      <OrderListPage />
    </MemoryRouter>,
  )
}

describe('OrderListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading skeleton', () => {
    it('renders loading skeleton (animate-pulse) when isLoading is true', () => {
      setupDefaultMocks({
        useOrdersReturn: { data: undefined, isLoading: true },
      })

      renderPage()

      const pulsingElements = document.querySelectorAll('.animate-pulse')
      expect(pulsingElements.length).toBeGreaterThan(0)
    })
  })

  /**
   * The status filter is a dropdown, not a row of tabs. With twenty-one statuses the tab
   * strip overflowed into a horizontal scroll that hid most of them behind a swipe, and a
   * filter nobody can see is a filter nobody uses.
   */
  describe('status filter', () => {
    // `Select` is a custom listbox rather than a native <select>, so each change means
    // opening the trigger and then picking the option — mirrors the products page.
    function chooseStatus(label: string) {
      fireEvent.click(screen.getByRole('button', { name: 'Filter by status' }))
      fireEvent.click(screen.getByRole('option', { name: label }))
    }

    it('is a dropdown rather than a tab strip', () => {
      setupDefaultMocks()
      renderPage()

      expect(screen.getByRole('button', { name: 'Filter by status' })).toBeInTheDocument()
    })

    it('passes the chosen status through to the query', () => {
      setupDefaultMocks()
      renderPage()

      chooseStatus('Processing')

      expect(vi.mocked(useOrders).mock.calls.at(-1)?.[0]).toMatchObject({ status: 'PROCESSING' })
    })

    it('sends no status filter at all when All is chosen', () => {
      setupDefaultMocks()
      renderPage()

      chooseStatus('Processing')
      chooseStatus('All')

      expect(vi.mocked(useOrders).mock.calls.at(-1)?.[0]).toMatchObject({ status: undefined })
    })
  })

  describe('filter interactions reset pagination', () => {
    it('resets pagination to page 1 when status filter changes', () => {
      setupDefaultMocks()

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'Filter by status' }))
      fireEvent.click(screen.getByRole('option', { name: 'Processing' }))

      // Verify useOrders was called with page: 1
      const lastCall = vi.mocked(useOrders).mock.calls.at(-1)
      expect(lastCall?.[0]).toMatchObject({ page: 1 })
    })

    it('resets pagination to page 1 when from-date filter changes', () => {
      setupDefaultMocks()

      renderPage()

      const fromDateInput = screen.getByLabelText('From')
      fireEvent.change(fromDateInput, { target: { value: '2025-01-01' } })

      // Verify useOrders was called with page: 1
      const lastCall = vi.mocked(useOrders).mock.calls.at(-1)
      expect(lastCall?.[0]).toMatchObject({ page: 1 })
    })

    it('resets pagination to page 1 when to-date filter changes', () => {
      setupDefaultMocks()

      renderPage()

      const toDateInput = screen.getByLabelText('To')
      fireEvent.change(toDateInput, { target: { value: '2025-12-31' } })

      // Verify useOrders was called with page: 1
      const lastCall = vi.mocked(useOrders).mock.calls.at(-1)
      expect(lastCall?.[0]).toMatchObject({ page: 1 })
    })
  })

  describe('order reference navigation', () => {
    it('renders order reference as a Link to /admin/orders/{orderId}', () => {
      setupDefaultMocks()

      renderPage()

      const link = screen.getByRole('link', { name: 'ORD-00001' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/admin/orders/order-1')
    })
  })

  /**
   * Viewing is not mutating, so the view action is gated differently from the rest of the
   * row actions: a VIEWER can reach every order's detail but must still be offered no way
   * to change one. Pinned in both directions, because collapsing the two gates would be
   * invisible — the page would simply look slightly wrong to one role.
   */
  describe('view action', () => {
    it('links to the order detail page', () => {
      setupDefaultMocks()

      renderPage()

      const view = screen.getByRole('link', { name: /view order ORD-00001/i })
      expect(view).toHaveAttribute('href', '/admin/orders/order-1')
    })

    it('is offered to a VIEWER, who cannot mutate anything', () => {
      setupDefaultMocks({ role: 'VIEWER' })

      renderPage()

      expect(screen.getByRole('link', { name: /view order ORD-00001/i })).toBeInTheDocument()
      expect(screen.queryByTestId('order-actions-menu')).not.toBeInTheDocument()
    })

    /**
     * A terminal order has no transitions, so its kebab menu is gone — but it is exactly
     * the kind of order somebody needs to open and read.
     */
    it('survives on an order with no available transitions', () => {
      setupDefaultMocks({
        ordersData: createMockOrdersPage({
          data: [createMockOrder({ status: OrderStatus.REFUNDED })],
        }),
      })

      renderPage()

      expect(screen.getByRole('link', { name: /view order ORD-00001/i })).toBeInTheDocument()
      expect(screen.queryByTestId('order-actions-menu')).not.toBeInTheDocument()
    })
  })

  describe('actions menu visibility', () => {
    it('renders actions menu for SUPER_ADMIN with eligible orders (status PAID)', () => {
      setupDefaultMocks({
        role: 'SUPER_ADMIN',
        ordersData: createMockOrdersPage({
          data: [createMockOrder({ status: OrderStatus.PAID })],
        }),
      })

      renderPage()

      expect(screen.getByTestId('order-actions-menu')).toBeInTheDocument()
    })

    it('renders actions menu for ORDER_MANAGER (order:write mirrors updateOrderStatus)', () => {
      setupDefaultMocks({
        role: 'ORDER_MANAGER',
        ordersData: createMockOrdersPage({
          data: [createMockOrder({ status: OrderStatus.PAID })],
        }),
      })

      renderPage()

      expect(screen.getByTestId('order-actions-menu')).toBeInTheDocument()
    })

    it('does not render actions menu for VIEWER role', () => {
      setupDefaultMocks({
        role: 'VIEWER',
        ordersData: createMockOrdersPage({
          data: [createMockOrder({ status: OrderStatus.PAID })],
        }),
      })

      renderPage()

      expect(screen.queryByTestId('order-actions-menu')).not.toBeInTheDocument()
    })

    it('does not render actions menu for orders with no available transitions', () => {
      setupDefaultMocks({
        role: 'SUPER_ADMIN',
        ordersData: createMockOrdersPage({
          data: [createMockOrder({ status: OrderStatus.CANCELLED })],
        }),
      })

      renderPage()

      expect(screen.queryByTestId('order-actions-menu')).not.toBeInTheDocument()
    })
  })
})
