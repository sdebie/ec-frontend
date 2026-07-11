import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useWholesaleApplications } from '@/admin/hooks/wholesale/useWholesaleApplications'
import { useWholesaleApplicationAction } from '@/admin/hooks/wholesale/useWholesaleApplicationAction'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import type { WholesaleApplicationListItem } from '@/admin/hooks/wholesale/types'
import { WholesaleApplicationQueuePage } from '../WholesaleApplicationQueuePage'

vi.mock('@/admin/hooks/wholesale/useWholesaleApplications', () => ({
  useWholesaleApplications: vi.fn(),
}))
vi.mock('@/admin/hooks/wholesale/useWholesaleApplicationAction', () => ({
  useWholesaleApplicationAction: vi.fn(),
}))
vi.mock('@/shared/auth/adminAuthStore', () => ({
  useAdminAuthStore: vi.fn(),
}))

// --- Mock Data Helpers ---

function createMockApplication(overrides?: Partial<WholesaleApplicationListItem>): WholesaleApplicationListItem {
  return {
    id: 'app-1',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    status: 'PENDING',
    createdAt: '2025-06-15T10:32:00Z',
    ...overrides,
  }
}

// --- Setup Helpers ---

const mockMutate = vi.fn()

function setupDefaultMocks(overrides?: {
  role?: string
  applications?: WholesaleApplicationListItem[]
  total?: number
  isLoading?: boolean
}) {
  const applications = overrides?.applications ?? [createMockApplication()]

  vi.mocked(useWholesaleApplications).mockReturnValue({
    data: applications,
    total: overrides?.total ?? applications.length,
    isLoading: overrides?.isLoading ?? false,
  })

  vi.mocked(useWholesaleApplicationAction).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as unknown as ReturnType<typeof useWholesaleApplicationAction>)

  vi.mocked(useAdminAuthStore).mockImplementation((selector: unknown) => {
    const state = { role: overrides?.role ?? 'SUPER_ADMIN' }
    return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
  })
}

function renderPage() {
  return render(
    <MemoryRouter>
      <WholesaleApplicationQueuePage />
    </MemoryRouter>,
  )
}

describe('WholesaleApplicationQueuePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('default filter is PENDING on initial render', () => {
    it('calls useWholesaleApplications with status PENDING on mount', () => {
      setupDefaultMocks()

      renderPage()

      const firstCall = vi.mocked(useWholesaleApplications).mock.calls[0]
      expect(firstCall?.[0]).toMatchObject({ status: 'PENDING' })
    })
  })

  describe('filter change updates query params and resets to page 1', () => {
    it('resets pagination to page 1 when filter changes to Approved', () => {
      setupDefaultMocks()

      renderPage()

      const approvedButton = screen.getByRole('button', { name: 'Approved' })
      fireEvent.click(approvedButton)

      const lastCall = vi.mocked(useWholesaleApplications).mock.calls.at(-1)
      expect(lastCall?.[0]).toMatchObject({ status: 'APPROVED', page: 1 })
    })

    it('resets pagination to page 1 when filter changes to All', () => {
      setupDefaultMocks()

      renderPage()

      const allButton = screen.getByRole('button', { name: 'All' })
      fireEvent.click(allButton)

      const lastCall = vi.mocked(useWholesaleApplications).mock.calls.at(-1)
      expect(lastCall?.[0]).toMatchObject({ page: 1 })
    })
  })

  describe('applicant name rendering', () => {
    it('renders the applicant name as plain text (applications are actioned inline, not via a detail page)', () => {
      setupDefaultMocks()

      renderPage()

      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Jane Doe' })).not.toBeInTheDocument()
    })
  })

  describe('actions menu visibility', () => {
    it('renders actions menu for SUPER_ADMIN with PENDING status', () => {
      setupDefaultMocks({
        role: 'SUPER_ADMIN',
        applications: [createMockApplication({ status: 'PENDING' })],
      })

      renderPage()

      expect(screen.getByTestId('application-actions-menu')).toBeInTheDocument()
    })

    it('does not render actions menu for SUPER_ADMIN with non-PENDING status', () => {
      setupDefaultMocks({
        role: 'SUPER_ADMIN',
        applications: [createMockApplication({ status: 'APPROVED' })],
      })

      renderPage()

      expect(screen.queryByTestId('application-actions-menu')).not.toBeInTheDocument()
    })

    it('does not render actions menu for VIEWER role', () => {
      setupDefaultMocks({
        role: 'VIEWER',
        applications: [createMockApplication({ status: 'PENDING' })],
      })

      renderPage()

      expect(screen.queryByTestId('application-actions-menu')).not.toBeInTheDocument()
    })
  })

  describe('reject triggers ConfirmationDialog, approve does not', () => {
    it('reject action opens ConfirmationDialog before mutation', () => {
      setupDefaultMocks({
        role: 'SUPER_ADMIN',
        applications: [createMockApplication({ status: 'PENDING' })],
      })

      renderPage()

      // Open dropdown menu
      const actionsMenu = screen.getByTestId('application-actions-menu')
      const triggerButton = actionsMenu.querySelector('button')!
      fireEvent.click(triggerButton)

      // Click "Reject" action
      const rejectButton = screen.getByRole('menuitem', { name: 'Reject' })
      fireEvent.click(rejectButton)

      // ConfirmationDialog should now be open
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Are you sure you want to reject this wholesale application?', { exact: false })).toBeInTheDocument()

      // mutate should NOT have been called yet
      expect(mockMutate).not.toHaveBeenCalled()
    })

    it('approve action triggers mutation directly without dialog', () => {
      setupDefaultMocks({
        role: 'SUPER_ADMIN',
        applications: [createMockApplication({ status: 'PENDING' })],
      })

      renderPage()

      // Open dropdown menu
      const actionsMenu = screen.getByTestId('application-actions-menu')
      const triggerButton = actionsMenu.querySelector('button')!
      fireEvent.click(triggerButton)

      // Click "Approve" action
      const approveButton = screen.getByRole('menuitem', { name: 'Approve' })
      fireEvent.click(approveButton)

      // mutate should be called directly
      expect(mockMutate).toHaveBeenCalledWith({ applicationId: 'app-1', action: 'approve' })

      // No dialog should appear
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
