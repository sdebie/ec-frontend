import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useWholesaleCustomers } from '../hooks/useWholesaleCustomers'
import { useWholesaleCustomerStatusAction } from '../hooks/useWholesaleCustomerStatusAction'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import type { WholesaleCustomerListItem } from '../types'
import { WholesaleCustomerListPage } from '../WholesaleCustomerListPage'

vi.mock('../hooks/useWholesaleCustomers', () => ({
  useWholesaleCustomers: vi.fn(),
}))
vi.mock('../hooks/useWholesaleCustomerStatusAction', () => ({
  useWholesaleCustomerStatusAction: vi.fn(),
}))
vi.mock('@/shared/auth/adminAuthStore', () => ({
  useAdminAuthStore: vi.fn(),
}))

// --- Mock Data Helpers ---

function createMockCustomer(overrides?: Partial<WholesaleCustomerListItem>): WholesaleCustomerListItem {
  return {
    id: 'customer-1',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@wholesale.com',
    status: 'ACTIVE',
    wholesaleApplicationStatus: 'APPROVED',
    registeredAt: '2025-01-15T10:30:00Z',
    ...overrides,
  }
}

// --- Setup Helpers ---

const mockMutate = vi.fn()

function setupDefaultMocks(overrides?: {
  role?: string
  customersData?: WholesaleCustomerListItem[]
  total?: number
}) {
  const data = overrides?.customersData ?? [createMockCustomer()]
  const total = overrides?.total ?? data.length

  vi.mocked(useWholesaleCustomers).mockReturnValue({
    data,
    total,
    isLoading: false,
  })

  vi.mocked(useWholesaleCustomerStatusAction).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useWholesaleCustomerStatusAction>)

  vi.mocked(useAdminAuthStore).mockImplementation((selector: unknown) => {
    const state = { role: overrides?.role ?? 'SUPER_ADMIN' }
    return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
  })
}

function renderPage() {
  return render(
    <MemoryRouter>
      <WholesaleCustomerListPage />
    </MemoryRouter>,
  )
}

describe('WholesaleCustomerListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('search input debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('passes search param to useWholesaleCustomers after 300ms debounce', () => {
      setupDefaultMocks()

      renderPage()

      const searchInput = screen.getByPlaceholderText('Search by name or email...')
      fireEvent.change(searchInput, { target: { value: 'jane' } })

      // Before debounce fires, search should not yet be set
      const callBeforeDebounce = vi.mocked(useWholesaleCustomers).mock.calls.at(-1)
      expect(callBeforeDebounce?.[0]?.search).toBeUndefined()

      // Advance timers past the 300ms debounce
      act(() => {
        vi.advanceTimersByTime(300)
      })

      const lastCall = vi.mocked(useWholesaleCustomers).mock.calls.at(-1)
      expect(lastCall?.[0]).toMatchObject({ search: 'jane', page: 1 })
    })
  })

  describe('filter interactions reset pagination', () => {
    it('resets pagination to page 1 when status filter changes', () => {
      setupDefaultMocks()

      renderPage()

      const pendingButton = screen.getByRole('button', { name: 'Pending' })
      fireEvent.click(pendingButton)

      const lastCall = vi.mocked(useWholesaleCustomers).mock.calls.at(-1)
      expect(lastCall?.[0]).toMatchObject({ page: 1 })
    })
  })

  describe('row navigation', () => {
    it('renders customer name as a Link to the detail page', () => {
      setupDefaultMocks()

      renderPage()

      const link = screen.getByRole('link', { name: 'Jane Doe' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/admin/wholesale/customers/customer-1')
    })
  })

  // Row actions live inside a DropdownMenu behind an unnamed ellipsis
  // trigger button — open it before asserting on the menu items.
  function openRowActionsMenu() {
    const trigger = screen
      .getAllByRole('button')
      .find((button) => button.querySelector('svg') !== null)
    expect(trigger).toBeDefined()
    fireEvent.click(trigger!)
  }

  describe('actions menu visibility', () => {
    it('renders Suspend menu item for SUPER_ADMIN with ACTIVE customer (has suspend transition)', () => {
      setupDefaultMocks({
        role: 'SUPER_ADMIN',
        customersData: [createMockCustomer({ status: 'ACTIVE' })],
      })

      renderPage()
      openRowActionsMenu()

      expect(screen.getByRole('menuitem', { name: 'Suspend' })).toBeInTheDocument()
    })

    it('does not render action buttons for VIEWER role', () => {
      setupDefaultMocks({
        role: 'VIEWER',
        customersData: [createMockCustomer({ status: 'ACTIVE' })],
      })

      renderPage()

      expect(screen.queryByRole('button', { name: 'Suspend' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Activate' })).not.toBeInTheDocument()
    })
  })

  describe('status change actions', () => {
    it('suspend triggers ConfirmationDialog before mutation', () => {
      setupDefaultMocks({
        role: 'SUPER_ADMIN',
        customersData: [createMockCustomer({ status: 'ACTIVE' })],
      })

      renderPage()
      openRowActionsMenu()

      // Click "Suspend" menu item
      const suspendButton = screen.getByRole('menuitem', { name: 'Suspend' })
      fireEvent.click(suspendButton)

      // ConfirmationDialog should now be open
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(
        screen.getByText('Are you sure you want to suspend this wholesale customer?', { exact: false }),
      ).toBeInTheDocument()

      // mutate should NOT have been called yet
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('activate triggers mutation directly without dialog', () => {
      setupDefaultMocks({
        role: 'SUPER_ADMIN',
        customersData: [createMockCustomer({ status: 'DISABLED' })],
      })

      renderPage()
      openRowActionsMenu()

      // Click "Activate" menu item
      const activateButton = screen.getByRole('menuitem', { name: 'Activate' })
      fireEvent.click(activateButton)

      // mutate should be called directly with ACTIVE status
      expect(mockMutate).toHaveBeenCalledWith({ customerId: 'customer-1', status: 'ACTIVE' })

      // No dialog should appear
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
