import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { useQuoteRequests } from '@/admin/hooks/quotes/useQuoteRequests'
import type { QuoteRequestListItem } from '@/admin/hooks/quotes/useQuoteRequests'
import { QuoteRequestQueuePage } from '../QuoteRequestQueuePage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/admin/hooks/quotes/useQuoteRequests', () => ({
  useQuoteRequests: vi.fn(),
}))

// --- Mock Data Helpers ---

function createMockQuoteRequest(
  overrides?: Partial<QuoteRequestListItem>,
): QuoteRequestListItem {
  return {
    id: 'qr-1',
    name: 'Jane Doe',
    company: 'Acme Corp',
    itemCount: 3,
    createdAt: '2025-07-10T08:30:00Z',
    status: 'NEW',
    ...overrides,
  }
}

// --- Setup Helpers ---

function setupDefaultMocks(overrides?: {
  data?: QuoteRequestListItem[]
  total?: number
  isLoading?: boolean
}) {
  const data = overrides?.data ?? [createMockQuoteRequest()]

  vi.mocked(useQuoteRequests).mockReturnValue({
    data,
    total: overrides?.total ?? data.length,
    isLoading: overrides?.isLoading ?? false,
  })
}

function renderPage() {
  return render(
    <MemoryRouter>
      <QuoteRequestQueuePage />
    </MemoryRouter>,
  )
}

describe('QuoteRequestQueuePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('page rendering', () => {
    it('renders the page title "Quote Requests"', () => {
      setupDefaultMocks()
      renderPage()

      expect(
        screen.getByRole('heading', { name: 'Quote Requests' }),
      ).toBeInTheDocument()
    })

    it('renders DataTable columns: Name, Company, Items, Submitted Date, Status', () => {
      setupDefaultMocks()
      renderPage()

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Company')).toBeInTheDocument()
      expect(screen.getByText('Items')).toBeInTheDocument()
      expect(screen.getByText('Submitted Date')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows loading state initially', () => {
      setupDefaultMocks({ isLoading: true, data: [] })
      renderPage()

      // DataTable renders skeleton rows with animate-pulse class when loading
      const skeletonRows = document.querySelectorAll('.animate-pulse')
      expect(skeletonRows.length).toBeGreaterThan(0)
    })
  })

  describe('data rendering', () => {
    it('renders data rows when loaded', () => {
      setupDefaultMocks({
        data: [
          createMockQuoteRequest({
            id: 'qr-1',
            name: 'Jane Doe',
            company: 'Acme Corp',
            itemCount: 3,
            status: 'NEW',
          }),
          createMockQuoteRequest({
            id: 'qr-2',
            name: 'Bob Smith',
            company: null,
            itemCount: 1,
            status: 'IN_PROGRESS',
          }),
        ],
      })
      renderPage()

      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()

      expect(screen.getByText('Bob Smith')).toBeInTheDocument()
      // null company renders as em-dash
      expect(screen.getByText('—')).toBeInTheDocument()
      // itemCount of 1 appears in a table cell
      const cells = document.querySelectorAll('td')
      const itemCountCell = Array.from(cells).find(
        (td) => td.textContent === '1',
      )
      expect(itemCountCell).toBeInTheDocument()
    })

    it('renders status badges for quote requests', () => {
      setupDefaultMocks({
        data: [createMockQuoteRequest({ status: 'NEW' })],
      })
      renderPage()

      // The status badge renders within a span with rounded-full class
      const badge = document.querySelector('span.inline-flex.items-center.rounded-full')
      expect(badge).toBeInTheDocument()
      expect(badge?.textContent).toBe('New')
    })

    it('renders View action button for each row', () => {
      setupDefaultMocks({
        data: [createMockQuoteRequest()],
      })
      renderPage()

      expect(screen.getByTestId('action-view')).toBeInTheDocument()
    })

    it('navigates to detail route when View is clicked', () => {
      setupDefaultMocks({
        data: [createMockQuoteRequest({ id: 'qr-42' })],
      })
      renderPage()

      const viewButton = screen.getByTestId('action-view')
      fireEvent.click(viewButton)

      expect(mockNavigate).toHaveBeenCalledWith('/admin/quotes/qr-42')
    })
  })
})
