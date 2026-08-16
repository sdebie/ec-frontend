import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useCustomers } from '@/admin/hooks/customers/useCustomers'
import { useUpdateCustomerStatus } from '@/admin/hooks/customers/useUpdateCustomerStatus'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import type { AdminCustomerSummary, CustomersPage } from '@/admin/hooks/customers/types'
import { CustomerListPage } from '../CustomerListPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/admin/hooks/customers/useCustomers', () => ({
  useCustomers: vi.fn(),
}))
vi.mock('@/admin/hooks/customers/useUpdateCustomerStatus', () => ({
  useUpdateCustomerStatus: vi.fn(),
}))
vi.mock('@/shared/auth/adminAuthStore', () => ({
  useAdminAuthStore: vi.fn(),
}))

// --- Mock Data Helpers ---

function createMockCustomer(overrides?: Partial<AdminCustomerSummary>): AdminCustomerSummary {
  return {
    id: 'customer-1',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    shopperType: 'RETAILER',
    status: 'ACTIVE',
    registeredAt: '2025-01-15T10:30:00Z',
    ...overrides,
  }
}

function createMockCustomersPage(overrides?: Partial<CustomersPage>): CustomersPage {
  return {
    data: [createMockCustomer()],
    total: 1,
    ...overrides,
  }
}

// --- Setup Helpers ---

const mockMutate = vi.fn()

function setupDefaultMocks(overrides?: {
  useCustomersReturn?: Partial<ReturnType<typeof useCustomers>>
  role?: string
  customersData?: CustomersPage
}) {
  const customersData = overrides?.customersData ?? createMockCustomersPage()

  vi.mocked(useCustomers).mockReturnValue({
    data: customersData,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides?.useCustomersReturn,
  } as unknown as ReturnType<typeof useCustomers>)

  vi.mocked(useUpdateCustomerStatus).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useUpdateCustomerStatus>)

  vi.mocked(useAdminAuthStore).mockImplementation((selector: unknown) => {
    const state = { role: overrides?.role ?? 'SUPER_ADMIN' }
    return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
  })
}

function renderPage() {
  return render(
    <MemoryRouter>
      <CustomerListPage />
    </MemoryRouter>,
  )
}

describe('CustomerListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('renders DataTable with customer rows', () => {
    it('renders customer name as a Link to detail page', () => {
      setupDefaultMocks()

      renderPage()

      const link = screen.getByRole('link', { name: 'Jane Doe' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/admin/customers/customer-1')
    })
  })

  describe('registered column is first and formatted yyyy-mm-dd hh:mm', () => {
    it('renders Registered as the first column header', () => {
      setupDefaultMocks()

      renderPage()

      const headers = screen.getAllByRole('columnheader')
      expect(headers[0]).toHaveTextContent('Registered')
    })

    it('renders the registeredAt timestamp in the shared date-time format', () => {
      setupDefaultMocks({
        customersData: createMockCustomersPage({
          data: [createMockCustomer({ registeredAt: '2025-01-15T10:30:00' })],
        }),
      })

      renderPage()

      expect(screen.getByText('2025-01-15 10:30')).toBeInTheDocument()
    })
  })

  describe('filter interactions reset pagination', () => {
    it('resets pagination to page 1 when status filter changes', () => {
      setupDefaultMocks()

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'Filter by status' }))
      fireEvent.click(screen.getByRole('option', { name: 'Pending' }))

      const lastCall = vi.mocked(useCustomers).mock.calls.at(-1)
      expect(lastCall?.[0]).toMatchObject({ page: 1 })
    })
  })

  describe('search input debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('passes search param to useCustomers after 300ms debounce', () => {
      setupDefaultMocks()

      renderPage()

      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      fireEvent.change(searchInput, { target: { value: 'jane' } })

      // Before debounce fires, search should not yet be set
      const callBeforeDebounce = vi.mocked(useCustomers).mock.calls.at(-1)
      expect(callBeforeDebounce?.[0]?.search).toBeUndefined()

      // Advance timers past the 300ms debounce
      act(() => {
        vi.advanceTimersByTime(300)
      })

      const lastCall = vi.mocked(useCustomers).mock.calls.at(-1)
      expect(lastCall?.[0]).toMatchObject({ search: 'jane', page: 1 })
    })
  })

  describe('actions visibility', () => {
    it('renders a Suspend icon button for SUPER_ADMIN with ACTIVE customer (has suspend transition)', () => {
      setupDefaultMocks({
        role: 'SUPER_ADMIN',
        customersData: createMockCustomersPage({
          data: [createMockCustomer({ status: 'ACTIVE' })],
        }),
      })

      renderPage()

      expect(screen.getByRole('button', { name: 'Suspend customer' })).toBeInTheDocument()
    })

    it('renders the View action for every role, including VIEWER', () => {
      setupDefaultMocks({
        role: 'VIEWER',
        customersData: createMockCustomersPage({
          data: [createMockCustomer({ status: 'ACTIVE' })],
        }),
      })

      renderPage()

      expect(screen.getByRole('button', { name: 'View customer' })).toBeInTheDocument()
    })

    it('does not render Suspend/Activate for VIEWER role', () => {
      setupDefaultMocks({
        role: 'VIEWER',
        customersData: createMockCustomersPage({
          data: [createMockCustomer({ status: 'ACTIVE' })],
        }),
      })

      renderPage()

      expect(screen.queryByRole('button', { name: 'Suspend customer' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Activate customer' })).not.toBeInTheDocument()
    })
  })

  describe('status change actions', () => {
    it('suspend triggers ConfirmationDialog before mutation', () => {
      setupDefaultMocks({
        role: 'SUPER_ADMIN',
        customersData: createMockCustomersPage({
          data: [createMockCustomer({ status: 'ACTIVE' })],
        }),
      })

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'Suspend customer' }))

      // ConfirmationDialog should now be open
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(
        screen.getByText('Are you sure you want to suspend this customer?', { exact: false }),
      ).toBeInTheDocument()

      // mutate should NOT have been called yet
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('activate triggers mutation directly without dialog', () => {
      setupDefaultMocks({
        role: 'SUPER_ADMIN',
        customersData: createMockCustomersPage({
          data: [createMockCustomer({ status: 'PENDING' })],
        }),
      })

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'Activate customer' }))

      // mutate should be called directly with ACTIVE status
      expect(mockMutate).toHaveBeenCalledWith({ customerId: 'customer-1', status: 'ACTIVE' })

      // No dialog should appear
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('row navigation', () => {
    it('navigates to the detail route when the View action is clicked', () => {
      setupDefaultMocks()

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'View customer' }))

      expect(mockNavigate).toHaveBeenCalledWith('/admin/customers/customer-1')
    })

    it('navigates to the detail route when a row is double-clicked', () => {
      setupDefaultMocks()

      renderPage()

      fireEvent.doubleClick(screen.getByText('jane@example.com'))

      expect(mockNavigate).toHaveBeenCalledWith('/admin/customers/customer-1')
    })
  })
})
