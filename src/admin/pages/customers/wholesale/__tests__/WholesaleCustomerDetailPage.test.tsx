import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useWholesaleCustomerDetail } from '../hooks/useWholesaleCustomerDetail'
import { useWholesaleApplicationAction } from '@/admin/pages/customers/hooks/useWholesaleApplicationAction'
import { useUpdateCustomerStatus } from '@/admin/pages/customers/hooks/useUpdateCustomerStatus'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import type { WholesaleCustomerDetail } from '@/admin/pages/customers/types'
import { WholesaleCustomerDetailPage } from '../WholesaleCustomerDetailPage'

vi.mock('../hooks/useWholesaleCustomerDetail', () => ({
  useWholesaleCustomerDetail: vi.fn(),
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

const mockCustomer: WholesaleCustomerDetail = {
  id: 'test-customer-id',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john@wholesale.com',
  phone: '+27821234567',
  status: 'ACTIVE',
  registeredAt: '2025-06-15T10:32:00Z',
  wholesaleApplication: {
    id: 'app-1',
    companyName: 'Smith Trading Co',
    vatNumber: 'VAT123456',
    regNumber: 'REG789',
    status: 'PENDING',
    submittedAt: '2025-06-01T08:00:00Z',
    applicantEmail: 'john@example.com',
    accountEmail: 'john.account@wholesale.com',
    tradingName: 'Smith Traders',
    companyPhone: '+27111234567',
    companyEmail: 'info@smithtrading.co.za',
    financeContactName: 'Jane Smith',
    financeContactEmail: 'jane@smithtrading.co.za',
    financeContactPhone: '+27119876543',
    purchaseOrderRequired: true,
  },
  recentOrders: [
    { id: 'order-1', reference: 'ORD-001', placedAt: '2025-06-10T08:00:00Z', total: 15000, status: 'PAID' },
    { id: 'order-2', reference: 'ORD-002', placedAt: '2025-06-12T09:00:00Z', total: 8000, status: 'DELIVERED' },
  ],
}

// --- Setup Helpers ---

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function setupMocks(overrides?: {
  data?: WholesaleCustomerDetail | null
  isLoading?: boolean
  role?: string
}) {
  const hasDataOverride = overrides !== undefined && 'data' in overrides
  vi.mocked(useWholesaleCustomerDetail).mockReturnValue({
    data: hasDataOverride ? (overrides.data ?? undefined) : mockCustomer,
    isLoading: overrides?.isLoading ?? false,
    error: null,
  } as unknown as ReturnType<typeof useWholesaleCustomerDetail>)

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
        <WholesaleCustomerDetailPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('WholesaleCustomerDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
      expect(screen.getByText('john@wholesale.com')).toBeInTheDocument()
    })

    it('renders customer phone', () => {
      expect(screen.getByText('+27821234567')).toBeInTheDocument()
    })

    it('renders "Customer since" with the registration date', () => {
      expect(screen.getByText(/Customer since/)).toBeInTheDocument()
    })
  })

  describe('application section with details', () => {
    beforeEach(() => {
      setupMocks({ data: mockCustomer, role: 'SUPER_ADMIN' })
      renderPage()
    })

    it('renders Wholesale Account heading', () => {
      expect(screen.getByText('Wholesale Account')).toBeInTheDocument()
    })

    it('renders company name', () => {
      expect(screen.getByText('Smith Trading Co')).toBeInTheDocument()
    })

    it('renders submitted date as card metadata', () => {
      expect(screen.getByText(/Application submitted/)).toBeInTheDocument()
    })

    it('renders applicant email', () => {
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('renders account email', () => {
      expect(screen.getByText('john.account@wholesale.com')).toBeInTheDocument()
    })

    it('renders trading name', () => {
      expect(screen.getByText('Smith Traders')).toBeInTheDocument()
    })

    it('renders company phone', () => {
      expect(screen.getByText('+27111234567')).toBeInTheDocument()
    })

    it('renders company email', () => {
      expect(screen.getByText('info@smithtrading.co.za')).toBeInTheDocument()
    })

    it('renders finance contact name', () => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('renders finance contact email', () => {
      expect(screen.getByText('jane@smithtrading.co.za')).toBeInTheDocument()
    })

    it('renders finance contact phone', () => {
      expect(screen.getByText('+27119876543')).toBeInTheDocument()
    })

    it('renders purchase order required as a Yes badge when true', () => {
      expect(screen.getByText('Yes')).toBeInTheDocument()
    })

    it('does not render VAT Number or Registration Number, which are not part of this summary', () => {
      expect(screen.queryByText('VAT123456')).not.toBeInTheDocument()
      expect(screen.queryByText('REG789')).not.toBeInTheDocument()
    })
  })

  describe('application section with null/empty fields renders blanks', () => {
    beforeEach(() => {
      setupMocks({
        data: {
          ...mockCustomer,
          wholesaleApplication: {
            id: 'app-1',
            companyName: 'Smith Trading Co',
            vatNumber: null,
            regNumber: null,
            status: 'PENDING',
            submittedAt: '2025-06-01T08:00:00Z',
            applicantEmail: 'john@example.com',
            accountEmail: null,
            tradingName: null,
            companyPhone: null,
            companyEmail: null,
            financeContactName: null,
            financeContactEmail: null,
            financeContactPhone: null,
            purchaseOrderRequired: null,
          },
        },
        role: 'SUPER_ADMIN',
      })
      renderPage()
    })

    it('renders without error when optional fields are null', () => {
      expect(screen.getByText('Wholesale Account')).toBeInTheDocument()
      expect(screen.getByText('Smith Trading Co')).toBeInTheDocument()
    })

    it('renders account email as an em dash when null', () => {
      expect(screen.getByText('Account Email').nextElementSibling).toHaveTextContent('—')
    })

    it('renders trading name as an em dash when null', () => {
      expect(screen.getByText('Trading Name').nextElementSibling).toHaveTextContent('—')
    })

    it('renders company phone as an em dash when null', () => {
      expect(screen.getByText('Company Phone').nextElementSibling).toHaveTextContent('—')
    })

    it('renders company email as an em dash when null', () => {
      expect(screen.getByText('Company Email').nextElementSibling).toHaveTextContent('—')
    })

    it('renders finance contact name as an em dash when null', () => {
      expect(screen.getByText('Name').nextElementSibling).toHaveTextContent('—')
    })

    it('renders finance contact email as an em dash when null', () => {
      expect(screen.getByText('Email').nextElementSibling).toHaveTextContent('—')
    })

    it('renders finance contact phone as an em dash when null', () => {
      expect(screen.getByText('Phone').nextElementSibling).toHaveTextContent('—')
    })

    it('renders purchase order required as a No badge when null', () => {
      expect(screen.getByText('No')).toBeInTheDocument()
    })
  })

  describe('no application notice', () => {
    it('renders notice when wholesaleApplication is null', () => {
      setupMocks({
        data: { ...mockCustomer, wholesaleApplication: null },
        role: 'SUPER_ADMIN',
      })

      renderPage()

      expect(
        screen.getByText('No wholesale application exists for this customer.'),
      ).toBeInTheDocument()
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

  describe('404 state', () => {
    it('renders not-found message when isLoading=false and data is undefined', () => {
      setupMocks({ data: null, isLoading: false })

      renderPage()

      expect(screen.getByText('Not Found')).toBeInTheDocument()
      expect(screen.getByText('Customer not found')).toBeInTheDocument()
    })

    it('renders a back link to /admin/wholesale/customers', () => {
      setupMocks({ data: null, isLoading: false })

      renderPage()

      const backLink = screen.getByRole('link', { name: 'Back to wholesale customers' })
      expect(backLink).toBeInTheDocument()
      expect(backLink).toHaveAttribute('href', '/admin/wholesale/customers')
    })
  })

  describe('action buttons visibility based on role and status', () => {
    it('renders account action buttons for SUPER_ADMIN with ACTIVE status', () => {
      setupMocks({ role: 'SUPER_ADMIN', data: mockCustomer })

      renderPage()

      expect(screen.getByTestId('account-action-buttons')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Suspend' })).toBeInTheDocument()
    })

    it('renders Activate button for SUPER_ADMIN with DISABLED status', () => {
      setupMocks({
        role: 'SUPER_ADMIN',
        data: { ...mockCustomer, status: 'DISABLED' },
      })

      renderPage()

      expect(screen.getByTestId('account-action-buttons')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Activate' })).toBeInTheDocument()
    })

    it('does not render account action buttons for VIEWER role', () => {
      setupMocks({ role: 'VIEWER', data: mockCustomer })

      renderPage()

      expect(screen.queryByTestId('account-action-buttons')).not.toBeInTheDocument()
    })

    it('renders Approve and Reject buttons for SUPER_ADMIN when application is PENDING', () => {
      setupMocks({ role: 'SUPER_ADMIN', data: mockCustomer })

      renderPage()

      expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()
    })

    it('does not render Approve/Reject buttons for VIEWER role', () => {
      setupMocks({ role: 'VIEWER', data: mockCustomer })

      renderPage()

      expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
    })

    it('does not render Approve/Reject buttons when application is APPROVED', () => {
      setupMocks({
        role: 'SUPER_ADMIN',
        data: {
          ...mockCustomer,
          wholesaleApplication: {
            ...mockCustomer.wholesaleApplication!,
            status: 'APPROVED',
          },
        },
      })

      renderPage()

      expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
    })

    it('renders an Approved status badge instead of decision buttons when application is APPROVED', () => {
      setupMocks({
        role: 'SUPER_ADMIN',
        data: {
          ...mockCustomer,
          wholesaleApplication: {
            ...mockCustomer.wholesaleApplication!,
            status: 'APPROVED',
          },
        },
      })

      renderPage()

      expect(screen.getByText('Approved')).toBeInTheDocument()
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

  describe('orders table renders formatted amounts and links', () => {
    beforeEach(() => {
      setupMocks({ data: mockCustomer, role: 'SUPER_ADMIN' })
      renderPage()
    })

    it('renders Recent Orders heading', () => {
      expect(screen.getByText('Recent Orders')).toBeInTheDocument()
    })

    it('renders order references as links to order detail', () => {
      const link1 = screen.getByRole('link', { name: 'ORD-001' })
      expect(link1).toHaveAttribute('href', '/admin/orders/order-1')

      const link2 = screen.getByRole('link', { name: 'ORD-002' })
      expect(link2).toHaveAttribute('href', '/admin/orders/order-2')
    })

    it('renders formatted order amounts', () => {
      // formatAmount(15000) with en-ZA locale and ZAR currency
      expect(screen.getByText(/15[\s ]?000/)).toBeInTheDocument()
      expect(screen.getByText(/8[\s ]?000/)).toBeInTheDocument()
    })

    it('renders order status badges', () => {
      // RecentOrdersTable maps raw status → friendly label via OrderStatusOptions.
      expect(screen.getByText('Paid')).toBeInTheDocument()
      expect(screen.getByText('Delivered')).toBeInTheDocument()
    })
  })

  describe('empty orders state', () => {
    it('renders a richer empty state instead of a plain message', () => {
      setupMocks({
        role: 'SUPER_ADMIN',
        data: { ...mockCustomer, recentOrders: [] },
      })

      renderPage()

      expect(screen.getByText('No orders yet')).toBeInTheDocument()
      expect(
        screen.getByText('Orders placed by this customer will appear here.'),
      ).toBeInTheDocument()
    })
  })
})
