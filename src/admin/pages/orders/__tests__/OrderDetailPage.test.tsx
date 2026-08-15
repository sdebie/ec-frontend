import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useOrderDetail } from '@/admin/hooks/orders/useOrderDetail'
import { useUpdateOrderStatus } from '@/admin/hooks/orders/useUpdateOrderStatus'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'
import type { AdminOrderDetail } from '@/admin/hooks/orders/types'
import { OrderDetailPage } from '../OrderDetailPage'

vi.mock('@/admin/hooks/orders/useOrderDetail', () => ({
  useOrderDetail: vi.fn(),
}))
vi.mock('@/admin/hooks/orders/useUpdateOrderStatus', () => ({
  useUpdateOrderStatus: vi.fn(),
}))
vi.mock('@/shared/auth/adminAuthStore', () => ({
  useAdminAuthStore: vi.fn(),
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ orderId: 'test-order-id' }),
  }
})

// --- Mock Data ---

const mockOrder: AdminOrderDetail = {
  id: 'test-order-id',
  reference: 'ORD-00123',
  customerName: 'John Smith',
  customerEmail: 'john@example.com',
  placedAt: '2025-06-15T10:32:00Z',
  itemCount: 2,
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
      thumbnailUrl: 'https://example.com/widget.jpg',
      unitPrice: 10000,
      quantity: 2,
      lineTotal: 20000,
    },
    {
      id: 'item-2',
      productName: 'Basic Gadget',
      variantSku: 'GDG-002-WHT',
      thumbnailUrl: null,
      unitPrice: 5000,
      quantity: 1,
      lineTotal: 5000,
    },
  ],
  subtotal: 25000,
  shippingCost: 1500,
  vatAmount: 3750,
  grandTotal: 30250,
  statusHistory: [
    {
      status: OrderStatus.CREATED,
      timestamp: '2025-06-15T10:30:00Z',
    },
    {
      status: OrderStatus.PAID,
      timestamp: '2025-06-15T10:32:00Z',
      staffName: 'Admin User',
    },
  ],
}

// --- Setup Helpers ---

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function setupMocks(overrides?: {
  data?: AdminOrderDetail | null
  isLoading?: boolean
  role?: string
}) {
  const hasDataOverride = overrides !== undefined && 'data' in overrides
  vi.mocked(useOrderDetail).mockReturnValue({
    data: hasDataOverride ? (overrides.data ?? undefined) : mockOrder,
    isLoading: overrides?.isLoading ?? false,
    error: null,
  } as unknown as ReturnType<typeof useOrderDetail>)

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
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OrderDetailPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('OrderDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('404 state', () => {
    it('renders not-found panel when isLoading=false and data=undefined', () => {
      setupMocks({ data: null, isLoading: false })

      renderPage()

      expect(screen.getByText('Not Found')).toBeInTheDocument()
      expect(screen.getByText('Order not found')).toBeInTheDocument()
    })

    it('renders a back link to /admin/orders', () => {
      setupMocks({ data: null, isLoading: false })

      renderPage()

      const backLink = screen.getByRole('link', { name: 'Back to orders' })
      expect(backLink).toBeInTheDocument()
      expect(backLink).toHaveAttribute('href', '/admin/orders')
    })
  })

  describe('loading state', () => {
    it('renders PageLoadingSpinner when isLoading=true', () => {
      setupMocks({ isLoading: true, data: null })

      renderPage()

      // PageLoadingSpinner renders an animate-spin element
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('does not render order content while loading', () => {
      setupMocks({ isLoading: true, data: null })

      renderPage()

      expect(screen.queryByText('ORD-00123')).not.toBeInTheDocument()
    })
  })

  describe('action buttons visibility', () => {
    it('renders action buttons for SUPER_ADMIN with available transitions', () => {
      setupMocks({ role: 'SUPER_ADMIN', data: mockOrder })

      renderPage()

      expect(screen.getByTestId('order-action-buttons')).toBeInTheDocument()
    })

    it('renders the actions a PAID order allows, and none it does not', () => {
      setupMocks({ role: 'SUPER_ADMIN', data: mockOrder })

      renderPage()

      // A paid order is processed next; the cancellations stay available because its
      // goods have not left. Refunding needs the goods delivered or collected first.
      expect(screen.getByRole('button', { name: 'Start Processing' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel — Store' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel — Customer' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Ship' })).toBeNull()
      expect(screen.queryByRole('button', { name: 'Refund' })).toBeNull()
    })

    it('renders action buttons for ORDER_MANAGER (order:write mirrors updateOrderStatus)', () => {
      setupMocks({ role: 'ORDER_MANAGER', data: mockOrder })

      renderPage()

      expect(screen.getByTestId('order-action-buttons')).toBeInTheDocument()
    })

    it('does not render action buttons for VIEWER role', () => {
      setupMocks({ role: 'VIEWER', data: mockOrder })

      renderPage()

      expect(screen.queryByTestId('order-action-buttons')).not.toBeInTheDocument()
    })

    it('does not render action buttons when order has no available transitions', () => {
      setupMocks({
        role: 'SUPER_ADMIN',
        data: { ...mockOrder, status: OrderStatus.CANCELLED },
      })

      renderPage()

      expect(screen.queryByTestId('order-action-buttons')).not.toBeInTheDocument()
    })
  })

  describe('order fields rendered correctly', () => {
    beforeEach(() => {
      setupMocks({ data: mockOrder, role: 'SUPER_ADMIN' })
      renderPage()
    })

    it('renders order reference in uppercase monospace', () => {
      const reference = screen.getByText('ORD-00123')
      expect(reference).toBeInTheDocument()
      expect(reference).toHaveClass('uppercase')
      expect(reference.className).toMatch(/mono/)
    })

    it('renders customer name', () => {
      expect(screen.getByText('John Smith')).toBeInTheDocument()
    })

    it('renders customer email', () => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('renders shipping address street', () => {
      expect(screen.getByText('123 Main Street')).toBeInTheDocument()
    })

    it('renders shipping address city, province, and postal code', () => {
      expect(screen.getByText('Cape Town, Western Cape, 8001')).toBeInTheDocument()
    })

    it('omits blank address parts rather than rendering stray separators', () => {
      cleanup()
      setupMocks({
        data: {
          ...mockOrder,
          shippingAddress: { street: null, city: 'Cape Town', province: null, postalCode: '8001' },
        },
      })
      renderPage()

      expect(screen.getByText('Cape Town, 8001')).toBeInTheDocument()
    })

    it('says so when an order carries no address at all', () => {
      cleanup()
      setupMocks({
        data: {
          ...mockOrder,
          shippingAddress: { street: null, city: null, province: null, postalCode: null },
        },
      })
      renderPage()

      expect(screen.getByText('No address captured')).toBeInTheDocument()
    })

    it('renders order summary values using formatAmount', () => {
      // formatAmount with ZAR locale returns values like "R 25 000,00"
      // We check that the formatted values appear in the document
      const summarySection = screen.getByText('Order Summary').closest('section')!
      expect(summarySection).toBeInTheDocument()

      // Check labels are present
      expect(screen.getByText('Subtotal')).toBeInTheDocument()
      expect(screen.getByText('Shipping')).toBeInTheDocument()
      expect(screen.getByText('VAT')).toBeInTheDocument()
      expect(screen.getByText('Grand Total')).toBeInTheDocument()
    })

    it('renders line items section', () => {
      expect(screen.getByText('Line Items')).toBeInTheDocument()
      expect(screen.getByText('Premium Widget')).toBeInTheDocument()
      expect(screen.getByText('Basic Gadget')).toBeInTheDocument()
    })

    it('renders status history section', () => {
      expect(screen.getByText('Status History')).toBeInTheDocument()
    })
  })
})
