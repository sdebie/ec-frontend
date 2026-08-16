import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useCustomerDetail } from '@/admin/pages/customers/retail/hooks/useCustomerDetail'
import { useWholesaleApplicationAction } from '@/admin/pages/customers/hooks/useWholesaleApplicationAction'
import { useUpdateCustomerStatus } from '@/admin/pages/customers/hooks/useUpdateCustomerStatus'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import type { AdminCustomerDetail } from '@/admin/pages/customers/types'
import { CustomerDetailPage } from '../CustomerDetailPage'

vi.mock('@/admin/pages/customers/retail/hooks/useCustomerDetail', () => ({
  useCustomerDetail: vi.fn(),
}))
vi.mock('@/admin/pages/customers/hooks/useWholesaleApplicationAction', () => ({
  useWholesaleApplicationAction: vi.fn(),
}))
vi.mock('@/admin/pages/customers/hooks/useUpdateCustomerStatus', () => ({
  useUpdateCustomerStatus: vi.fn(),
}))
vi.mock('@/shared/auth/adminAuthStore', () => ({
  useAdminAuthStore: vi.fn(),
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ customerId: 'test-customer-id' }),
  }
})

// --- Mock Data ---

const mockCustomer: AdminCustomerDetail = {
  id: 'test-customer-id',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john@example.com',
  phone: '+27821234567',
  shopperType: 'RETAILER',
  status: 'ACTIVE',
  registeredAt: '2025-06-15T10:32:00Z',
  recentOrders: [
    { id: 'order-1', reference: 'ORD-001', placedAt: '2025-06-10T08:00:00Z', total: 15000, status: 'PAID' },
    { id: 'order-2', reference: 'ORD-002', placedAt: '2025-06-12T09:00:00Z', total: 8000, status: 'DELIVERED' },
  ],
  wholesaleApplication: {
    id: 'app-1',
    companyName: 'Smith Trading Co',
    vatNumber: 'VAT123456',
    regNumber: 'REG789',
    status: 'PENDING',
    submittedAt: '2025-06-01T08:00:00Z',
    applicantEmail: 'applicant@example.com',
    accountEmail: 'john.account@example.com',
    tradingName: 'Smith Traders',
    companyPhone: '+27111234567',
    companyEmail: 'info@smithtrading.co.za',
    financeContactName: 'Jane Smith',
    financeContactEmail: 'jane@smithtrading.co.za',
    financeContactPhone: '+27119876543',
    purchaseOrderRequired: true,
  },
}

// --- Setup Helpers ---

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function setupMocks(overrides?: {
  data?: AdminCustomerDetail | null
  isLoading?: boolean
  role?: string
}) {
  const hasDataOverride = overrides !== undefined && 'data' in overrides
  vi.mocked(useCustomerDetail).mockReturnValue({
    data: hasDataOverride ? (overrides.data ?? undefined) : mockCustomer,
    isLoading: overrides?.isLoading ?? false,
    error: null,
  } as unknown as ReturnType<typeof useCustomerDetail>)

  vi.mocked(useWholesaleApplicationAction).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useWholesaleApplicationAction>)

  vi.mocked(useUpdateCustomerStatus).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateCustomerStatus>)

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
        <CustomerDetailPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CustomerDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('404 state', () => {
    it('renders not-found panel when isLoading=false and data=undefined', () => {
      setupMocks({ data: null, isLoading: false })

      renderPage()

      expect(screen.getByText('Not Found')).toBeInTheDocument()
      expect(screen.getByText('Customer not found')).toBeInTheDocument()
    })

    it('renders a back link to /admin/customers', () => {
      setupMocks({ data: null, isLoading: false })

      renderPage()

      const backLink = screen.getByRole('link', { name: 'Back to customers' })
      expect(backLink).toBeInTheDocument()
      expect(backLink).toHaveAttribute('href', '/admin/customers')
    })
  })

  describe('loading state', () => {
    it('renders PageLoadingSpinner when isLoading=true', () => {
      setupMocks({ isLoading: true, data: null })

      renderPage()

      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('does not render customer content while loading', () => {
      setupMocks({ isLoading: true, data: null })

      renderPage()

      expect(screen.queryByText('John Smith')).not.toBeInTheDocument()
    })
  })

  describe('profile fields rendered correctly', () => {
    beforeEach(() => {
      setupMocks({ data: mockCustomer, role: 'SUPER_ADMIN' })
      renderPage()
    })

    it('renders customer full name', () => {
      expect(screen.getByText('John Smith')).toBeInTheDocument()
    })

    it('renders customer email', () => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('renders customer phone', () => {
      expect(screen.getByText('+27821234567')).toBeInTheDocument()
    })

    it('renders customer type as a badge next to the name', () => {
      expect(screen.getByText('RETAILER')).toBeInTheDocument()
    })

    it('renders "Customer since" with the registration date', () => {
      expect(screen.getByText(/Customer since/)).toBeInTheDocument()
    })
  })

  describe('order history', () => {
    beforeEach(() => {
      setupMocks({ data: mockCustomer, role: 'SUPER_ADMIN' })
      renderPage()
    })

    it('renders Recent Orders heading', () => {
      expect(screen.getByText('Recent Orders')).toBeInTheDocument()
    })

    it('renders recent order references as links to order detail', () => {
      const link1 = screen.getByRole('link', { name: 'ORD-001' })
      expect(link1).toHaveAttribute('href', '/admin/orders/order-1')

      const link2 = screen.getByRole('link', { name: 'ORD-002' })
      expect(link2).toHaveAttribute('href', '/admin/orders/order-2')
    })
  })

  describe('wholesale section always present (mirrors Wholesale Customer Detail)', () => {
    it('renders the no-application message when wholesaleApplication is null', () => {
      setupMocks({
        data: { ...mockCustomer, wholesaleApplication: null },
        role: 'SUPER_ADMIN',
      })

      renderPage()

      expect(screen.getByText('Wholesale Account')).toBeInTheDocument()
      expect(
        screen.getByText('No wholesale application exists for this customer.'),
      ).toBeInTheDocument()
    })
  })

  describe('wholesale section present', () => {
    it('renders wholesale section heading and business name when application exists', () => {
      setupMocks({ data: mockCustomer, role: 'SUPER_ADMIN' })

      renderPage()

      expect(screen.getByText('Wholesale Account')).toBeInTheDocument()
      expect(screen.getByText('Smith Trading Co')).toBeInTheDocument()
    })

    it('renders approve and reject buttons for SUPER_ADMIN when application status is PENDING', () => {
      setupMocks({ data: mockCustomer, role: 'SUPER_ADMIN' })

      renderPage()

      expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()
    })

    it('renders a Pending status badge instead of decision buttons for VIEWER role', () => {
      setupMocks({ data: mockCustomer, role: 'VIEWER' })

      renderPage()

      expect(screen.getByText('Wholesale Account')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
    })

    it('renders approve/reject buttons for ORDER_MANAGER but hides account actions', () => {
      setupMocks({ data: mockCustomer, role: 'ORDER_MANAGER' })

      renderPage()

      expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()
      // Account-status actions remain customer:write-only (SUPER_ADMIN)
      expect(screen.queryByTestId('account-action-buttons')).not.toBeInTheDocument()
    })
  })

  describe('action buttons visibility', () => {
    it('renders action buttons for SUPER_ADMIN with available transitions', () => {
      setupMocks({ role: 'SUPER_ADMIN', data: mockCustomer })

      renderPage()

      expect(screen.getByTestId('account-action-buttons')).toBeInTheDocument()
    })

    it('renders Suspend button for ACTIVE customer', () => {
      setupMocks({ role: 'SUPER_ADMIN', data: mockCustomer })

      renderPage()

      expect(screen.getByRole('button', { name: 'Suspend' })).toBeInTheDocument()
    })

    it('does not render action buttons for VIEWER role', () => {
      setupMocks({ role: 'VIEWER', data: mockCustomer })

      renderPage()

      expect(screen.queryByTestId('account-action-buttons')).not.toBeInTheDocument()
    })
  })

  describe('suspend triggers ConfirmationDialog', () => {
    it('opens confirmation dialog when Suspend button is clicked', () => {
      setupMocks({ role: 'SUPER_ADMIN', data: mockCustomer })

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'Suspend' }))

      expect(screen.getByText('Suspend Customer')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Are you sure you want to suspend this customer? They will no longer be able to access the storefront.',
        ),
      ).toBeInTheDocument()
    })
  })

  describe('reject opens RejectApplicationDialog and requires a reason', () => {
    it('opens RejectApplicationDialog when Reject button is clicked', () => {
      setupMocks({ role: 'SUPER_ADMIN', data: mockCustomer })

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'Reject' }))

      expect(screen.getByText('Reject Wholesale Application')).toBeInTheDocument()
    })

    it('shows validation error when submitting without a reason', () => {
      setupMocks({ role: 'SUPER_ADMIN', data: mockCustomer })

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'Reject' }))

      // Click the Reject button inside the dialog without entering a reason
      const dialogRejectButtons = screen.getAllByRole('button', { name: 'Reject' })
      const dialogRejectButton = dialogRejectButtons[dialogRejectButtons.length - 1]
      fireEvent.click(dialogRejectButton)

      expect(screen.getByText('A rejection reason is required.')).toBeInTheDocument()
    })

    it('shows validation error when reason is whitespace-only', () => {
      setupMocks({ role: 'SUPER_ADMIN', data: mockCustomer })

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'Reject' }))

      const textarea = screen.getByPlaceholderText('Enter reason for rejection…')
      fireEvent.change(textarea, { target: { value: '   ' } })

      const dialogRejectButtons = screen.getAllByRole('button', { name: 'Reject' })
      const dialogRejectButton = dialogRejectButtons[dialogRejectButtons.length - 1]
      fireEvent.click(dialogRejectButton)

      expect(screen.getByText('A rejection reason is required.')).toBeInTheDocument()
    })

    it('does not fire the mutation when reason is empty', () => {
      setupMocks({ role: 'SUPER_ADMIN', data: mockCustomer })

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'Reject' }))

      const dialogRejectButtons = screen.getAllByRole('button', { name: 'Reject' })
      const dialogRejectButton = dialogRejectButtons[dialogRejectButtons.length - 1]
      fireEvent.click(dialogRejectButton)

      const mutateFn = vi.mocked(useWholesaleApplicationAction).mock.results[0]
        .value.mutate as ReturnType<typeof vi.fn>
      expect(mutateFn).not.toHaveBeenCalled()
    })
  })
})
