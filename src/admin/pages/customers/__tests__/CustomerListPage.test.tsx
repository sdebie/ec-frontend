import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useCustomers } from '@/admin/hooks/customers/useCustomers'
import { useUpdateCustomerStatus } from '@/admin/hooks/customers/useUpdateCustomerStatus'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import type { AdminCustomerSummary, CustomersPage } from '@/admin/hooks/customers/types'
import { CustomerListPage } from '../CustomerListPage'

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

  describe('filter interactions reset pagination', () => {
    it('resets pagination to page 1 when status filter changes', () => {
      setupDefaultMocks()

      renderPage()

      const pendingButton = screen.getByRole('button', { name: 'Pending' })
      fireEvent.click(pendingButton)

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

  describe('actions menu visibility', () => {
    it('renders actions menu for SUPER_ADMIN with ACTIVE customer', () => {
      setupDefaultMocks({
        role: 'SUPER_ADMIN',
        customersData: createMockCustomersPage({
          data: [createMockCustomer({ status: 'ACTIVE' })],
        }),
      })

      renderPage()

      expect(screen.getByTestId('customer-actions-menu')).toBeInTheDocument()
    })

    it('does not render actions menu for VIEWER role', () => {
      setupDefaultMocks({
        role: 'VIEWER',
        customersData: createMockCustomersPage({
          data: [createMockCustomer({ status: 'ACTIVE' })],
        }),
      })

      renderPage()

      expect(screen.queryByTestId('customer-actions-menu')).not.toBeInTheDocument()
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

      // Open dropdown menu
      const actionsMenu = screen.getByTestId('customer-actions-menu')
      const triggerButton = actionsMenu.querySelector('button')!
      fireEvent.click(triggerButton)

      // Click "Suspend" action
      const suspendButton = screen.getByRole('menuitem', { name: 'Suspend' })
      fireEvent.click(suspendButton)

      // ConfirmationDialog should now be open
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to suspend this customer?', { exact: false })).toBeInTheDocument()

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

      // Open dropdown menu
      const actionsMenu = screen.getByTestId('customer-actions-menu')
      const triggerButton = actionsMenu.querySelector('button')!
      fireEvent.click(triggerButton)

      // Click "Activate" action
      const activateButton = screen.getByRole('menuitem', { name: 'Activate' })
      fireEvent.click(activateButton)

      // mutate should be called directly with ACTIVE status
      expect(mockMutate).toHaveBeenCalledWith({ customerId: 'customer-1', status: 'ACTIVE' })

      // No dialog should appear
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
