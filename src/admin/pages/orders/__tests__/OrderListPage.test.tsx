import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useOrders } from '@/admin/pages/orders/hooks/useOrders'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'
import type { AdminOrderSummary, OrdersPage } from '@/admin/pages/orders/types'
import { OrderListPage } from '../OrderListPage'

const mockNavigate = vi.fn()

vi.mock('@/admin/pages/orders/hooks/useOrders', () => ({
  useOrders: vi.fn(),
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
   * One status answers two questions staff ask separately — has the money arrived, and
   * where are the goods — so the filter is two dropdowns over two derived facets rather
   * than one list of every status.
   */
  describe('payment and fulfilment filters', () => {
    // `Select` is a custom listbox rather than a native <select>, so each change means
    // opening the trigger and then picking the option.
    function choose(control: string, label: string) {
      fireEvent.click(screen.getByRole('button', { name: control }))
      fireEvent.click(screen.getByRole('option', { name: label }))
    }

    it('offers a dropdown per facet, not a tab strip', () => {
      setupDefaultMocks()
      renderPage()

      expect(screen.getByRole('button', { name: 'Filter by payment status' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Filter by fulfilment status' })).toBeInTheDocument()
    })

    it('passes the chosen payment state through to the query', () => {
      setupDefaultMocks()
      renderPage()

      choose('Filter by payment status', 'Paid')

      expect(vi.mocked(useOrders).mock.calls.at(-1)?.[0]).toMatchObject({ paymentState: 'PAID' })
    })

    it('passes the chosen fulfilment state through to the query', () => {
      setupDefaultMocks()
      renderPage()

      choose('Filter by fulfilment status', 'Not started')

      expect(vi.mocked(useOrders).mock.calls.at(-1)?.[0]).toMatchObject({
        fulfilmentState: 'NOT_STARTED',
      })
    })

    /** The point of two facets: "paid but nobody has picked it" is one question. */
    it('combines both facets in a single query', () => {
      setupDefaultMocks()
      renderPage()

      choose('Filter by payment status', 'Paid')
      choose('Filter by fulfilment status', 'Not started')

      expect(vi.mocked(useOrders).mock.calls.at(-1)?.[0]).toMatchObject({
        paymentState: 'PAID',
        fulfilmentState: 'NOT_STARTED',
      })
    })

    it('sends no filter at all when a facet is cleared', () => {
      setupDefaultMocks()
      renderPage()

      choose('Filter by payment status', 'Paid')
      choose('Filter by payment status', 'Any payment')

      expect(vi.mocked(useOrders).mock.calls.at(-1)?.[0]).toMatchObject({ paymentState: undefined })
    })
  })

  describe('filter interactions reset pagination', () => {
    it('resets pagination to page 1 when a status filter changes', () => {
      setupDefaultMocks()

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'Filter by fulfilment status' }))
      fireEvent.click(screen.getByRole('option', { name: 'Processing' }))

      // Verify useOrders was called with page: 1
      const lastCall = vi.mocked(useOrders).mock.calls.at(-1)
      expect(lastCall?.[0]).toMatchObject({ page: 1 })
    })

    it('resets pagination to page 1 when the date filter changes', () => {
      setupDefaultMocks()

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'Filter by order date' }))
      fireEvent.click(screen.getByRole('option', { name: 'This Month' }))

      // Verify useOrders was called with page: 1
      const lastCall = vi.mocked(useOrders).mock.calls.at(-1)
      expect(lastCall?.[0]).toMatchObject({ page: 1 })
    })
  })

  describe('date filter', () => {
    it('sends no date bounds until a range is chosen', () => {
      setupDefaultMocks()

      renderPage()

      const lastCall = vi.mocked(useOrders).mock.calls.at(-1)
      expect(lastCall?.[0].fromDate).toBeUndefined()
      expect(lastCall?.[0].toDate).toBeUndefined()
    })

    it('resolves the chosen range into inclusive yyyy-MM-dd bounds', () => {
      setupDefaultMocks()

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'Filter by order date' }))
      fireEvent.click(screen.getByRole('option', { name: 'Today' }))

      // Asserted against a shape rather than a fixed date: the page resolves the preset
      // against the real clock on purpose, so that "Today" keeps meaning today.
      const lastCall = vi.mocked(useOrders).mock.calls.at(-1)
      expect(lastCall?.[0].fromDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(lastCall?.[0].fromDate).toBe(lastCall?.[0].toDate)
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
   * The row offers view-only navigation now — status changes happen on the order detail
   * page's Order Actions panel, not from a row-level menu. The view link is therefore
   * unconditional: it doesn't vary by role or by the order's status/available transitions.
   */
  describe('view action', () => {
    it('links to the order detail page', () => {
      setupDefaultMocks()

      renderPage()

      const view = screen.getByRole('link', { name: /view order ORD-00001/i })
      expect(view).toHaveAttribute('href', '/admin/orders/order-1')
    })

    it('is offered to a VIEWER, same as any other role', () => {
      setupDefaultMocks({ role: 'VIEWER' })

      renderPage()

      expect(screen.getByRole('link', { name: /view order ORD-00001/i })).toBeInTheDocument()
    })

    it('survives on an order with no available transitions', () => {
      setupDefaultMocks({
        ordersData: createMockOrdersPage({
          data: [createMockOrder({ status: OrderStatus.REFUNDED })],
        }),
      })

      renderPage()

      expect(screen.getByRole('link', { name: /view order ORD-00001/i })).toBeInTheDocument()
    })
  })
})
