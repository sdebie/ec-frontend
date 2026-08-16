import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useWholesaleApplications } from '../hooks/useWholesaleApplications'
import type { WholesaleApplicationListItem } from '../types'
import { WholesaleApplicationQueuePage } from '../WholesaleApplicationQueuePage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('../hooks/useWholesaleApplications', () => ({
  useWholesaleApplications: vi.fn(),
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

function setupDefaultMocks(overrides?: {
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

      fireEvent.click(screen.getByRole('button', { name: 'Filter by status' }))
      fireEvent.click(screen.getByRole('option', { name: 'Approved' }))

      const lastCall = vi.mocked(useWholesaleApplications).mock.calls.at(-1)
      expect(lastCall?.[0]).toMatchObject({ status: 'APPROVED', page: 1 })
    })

    it('resets pagination to page 1 when filter changes to All', () => {
      setupDefaultMocks()

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'Filter by status' }))
      fireEvent.click(screen.getByRole('option', { name: 'All' }))

      const lastCall = vi.mocked(useWholesaleApplications).mock.calls.at(-1)
      expect(lastCall?.[0]).toMatchObject({ page: 1 })
    })

    it('resets pagination to page 1 when the date filter changes', () => {
      setupDefaultMocks()

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'Filter by submitted date' }))
      fireEvent.click(screen.getByRole('option', { name: 'This Month' }))

      const lastCall = vi.mocked(useWholesaleApplications).mock.calls.at(-1)
      expect(lastCall?.[0]).toMatchObject({ page: 1 })
    })
  })

  describe('date filter', () => {
    it('sends no date bounds until a range is chosen', () => {
      setupDefaultMocks()

      renderPage()

      const lastCall = vi.mocked(useWholesaleApplications).mock.calls.at(-1)
      expect(lastCall?.[0].fromDate).toBeUndefined()
      expect(lastCall?.[0].toDate).toBeUndefined()
    })

    it('resolves the chosen range into inclusive yyyy-MM-dd bounds', () => {
      setupDefaultMocks()

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: 'Filter by submitted date' }))
      fireEvent.click(screen.getByRole('option', { name: 'Today' }))

      // Asserted against a shape rather than a fixed date: the page resolves the preset
      // against the real clock on purpose, so that "Today" keeps meaning today.
      const lastCall = vi.mocked(useWholesaleApplications).mock.calls.at(-1)
      expect(lastCall?.[0].fromDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(lastCall?.[0].fromDate).toBe(lastCall?.[0].toDate)
    })
  })

  describe('applicant name rendering', () => {
    it('renders the applicant name as plain text', () => {
      setupDefaultMocks()

      renderPage()

      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })
  })

  describe('email is masked, never shown in full', () => {
    it('does not render the raw email address', () => {
      setupDefaultMocks({
        applications: [createMockApplication({ email: 'jane@example.com' })],
      })

      renderPage()

      expect(screen.queryByText('jane@example.com')).not.toBeInTheDocument()
      expect(screen.getByText('ja***@example.com')).toBeInTheDocument()
    })
  })

  describe('submitted date is formatted yyyy-mm-dd hh:mm', () => {
    it('renders the createdAt timestamp in the shared date-time format', () => {
      setupDefaultMocks({
        applications: [createMockApplication({ createdAt: '2025-06-15T10:32:00' })],
      })

      renderPage()

      expect(screen.getByText('2025-06-15 10:32')).toBeInTheDocument()
    })
  })

  describe('status badge uses the shared WholesaleApplicationStatusDisplay labels', () => {
    it('renders "Pending Review", not the raw "PENDING" enum value', () => {
      setupDefaultMocks({
        applications: [createMockApplication({ status: 'PENDING' })],
      })

      renderPage()

      expect(screen.getByText('Pending Review')).toBeInTheDocument()
      expect(screen.queryByText('PENDING')).not.toBeInTheDocument()
    })
  })

  describe('View action navigates to the detail route', () => {
    it('renders a View button for PENDING applications', () => {
      setupDefaultMocks({
        applications: [createMockApplication({ status: 'PENDING' })],
      })

      renderPage()

      expect(screen.getByTestId('action-view')).toBeInTheDocument()
    })

    it('renders a View button for APPROVED applications', () => {
      setupDefaultMocks({
        applications: [createMockApplication({ status: 'APPROVED' })],
      })

      renderPage()

      expect(screen.getByTestId('action-view')).toBeInTheDocument()
    })

    it('renders a View button for REJECTED applications', () => {
      setupDefaultMocks({
        applications: [createMockApplication({ status: 'REJECTED' })],
      })

      renderPage()

      expect(screen.getByTestId('action-view')).toBeInTheDocument()
    })

    it('navigates to the detail route when View is clicked', () => {
      setupDefaultMocks({
        applications: [createMockApplication({ id: 'app-42', status: 'PENDING' })],
      })

      renderPage()

      const viewButton = screen.getByTestId('action-view')
      fireEvent.click(viewButton)

      expect(mockNavigate).toHaveBeenCalledWith('/admin/wholesale/applications/app-42')
    })

    it('navigates to the detail route when a row is double-clicked', () => {
      setupDefaultMocks({
        applications: [createMockApplication({ id: 'app-42', status: 'PENDING' })],
      })

      renderPage()

      fireEvent.doubleClick(screen.getByText('Jane Doe'))

      expect(mockNavigate).toHaveBeenCalledWith('/admin/wholesale/applications/app-42')
    })
  })

  describe('no inline approve/reject actions', () => {
    it('does not render a dropdown menu', () => {
      setupDefaultMocks({
        applications: [createMockApplication({ status: 'PENDING' })],
      })

      renderPage()

      expect(screen.queryByTestId('application-actions-menu')).not.toBeInTheDocument()
    })

    it('does not render a confirmation dialog', () => {
      setupDefaultMocks()

      renderPage()

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
