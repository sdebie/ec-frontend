import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useWholesaleApplications } from '@/admin/hooks/wholesale/useWholesaleApplications'
import type { WholesaleApplicationListItem } from '@/admin/hooks/wholesale/types'
import { WholesaleApplicationQueuePage } from '../WholesaleApplicationQueuePage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/admin/hooks/wholesale/useWholesaleApplications', () => ({
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
    it('renders the applicant name as plain text', () => {
      setupDefaultMocks()

      renderPage()

      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
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
