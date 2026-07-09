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

  describe('filter interactions reset pagination', () => {
    it('resets pagination to page 1 when status filter changes', () => {
      setupDefaultMocks()

      renderPage()

      // Click a status filter option (e.g., "Pending")
      const pendingButton = screen.getByRole('button', { name: 'Pending' })
      fireEvent.click(pendingButton)

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
