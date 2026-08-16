import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { WholesaleApplicationDetailPage } from '../WholesaleApplicationDetailPage'
import type { WholesaleApplicationDetail } from '../hooks/useWholesaleApplicationDetail'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'

// --- Mocks ---

const mockMutate = vi.fn()

vi.mock('../hooks', () => ({
  useWholesaleApplicationDetail: vi.fn(),
  useWholesaleApplicationAction: vi.fn(() => ({
    mutate: mockMutate,
    isPending: false,
  })),
}))

// Import after vi.mock so the mock is in place
import { useWholesaleApplicationDetail } from '../hooks'

// --- Test Data ---

function createPendingApplication(
  overrides?: Partial<WholesaleApplicationDetail>,
): WholesaleApplicationDetail {
  return {
    id: 'app-123',
    status: 'PENDING',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@corp.co.za',
    phone: '+27 82 123 4567',
    applicantEmail: 'john.smith@corp.co.za',
    companyName: 'Smith Corp',
    companyEmail: 'info@smithcorp.co.za',
    companyPhone: '+27 11 123 4567',
    tradingName: 'SmithCo',
    vatNumber: 'VAT12345',
    regNumber: 'REG67890',
    notes: 'We need wholesale pricing.',
    customerId: 'cust-1',
    financeContactName: 'Alice Finance',
    financeContactEmail: 'alice@smithcorp.co.za',
    financeContactPhone: '+27 82 999 9999',
    purchaseOrderRequired: true,
    physicalAddressLine1: '10 Main St',
    physicalAddressLine2: 'Unit 5',
    physicalSuburb: 'Sandton',
    physicalCity: 'Johannesburg',
    physicalProvince: 'Gauteng',
    physicalPostalCode: '2196',
    postalAddressLine1: 'PO Box 100',
    postalAddressLine2: null,
    postalSuburb: 'Sandton',
    postalCity: 'Johannesburg',
    postalProvince: 'Gauteng',
    postalPostalCode: '2196',
    createdAt: '2025-06-15T10:32:00Z',
    processedAt: null,
    rejectionReason: null,
    ...overrides,
  }
}

// --- Render Helper ---

function renderDetailPage(applicationId = 'app-123') {
  return render(
    <MemoryRouter
      initialEntries={[`/admin/wholesale/applications/${applicationId}`]}
    >
      <Routes>
        <Route
          path="/admin/wholesale/applications/:applicationId"
          element={<WholesaleApplicationDetailPage />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

// --- Tests ---

describe('WholesaleApplicationDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Decision buttons are role-gated; default to a mutating role
    useAdminAuthStore.setState({ role: 'SUPER_ADMIN' })
  })

  it('renders loading spinner while data is loading', () => {
    vi.mocked(useWholesaleApplicationDetail).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useWholesaleApplicationDetail>)

    renderDetailPage()

    // The PageLoadingSpinner renders an animated div with animate-spin
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders not-found message when isLoading=false and data is undefined', () => {
    vi.mocked(useWholesaleApplicationDetail).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useWholesaleApplicationDetail>)

    renderDetailPage()

    expect(screen.getByText('Not Found')).toBeInTheDocument()
    expect(screen.getByText('Application not found')).toBeInTheDocument()
  })

  it('renders a back link to /admin/wholesale', () => {
    vi.mocked(useWholesaleApplicationDetail).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useWholesaleApplicationDetail>)

    renderDetailPage()

    const backLink = screen.getByRole('link', { name: 'Back to wholesale applications' })
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/admin/wholesale')
  })

  it('renders all captured fields when data loads for a PENDING application', () => {
    const app = createPendingApplication()
    vi.mocked(useWholesaleApplicationDetail).mockReturnValue({
      data: app,
      isLoading: false,
    } as unknown as ReturnType<typeof useWholesaleApplicationDetail>)

    renderDetailPage()

    // Applicant name
    expect(screen.getByText('John Smith')).toBeInTheDocument()
    // Applicant email
    expect(
      screen.getByText(/john\.smith@corp\.co\.za/),
    ).toBeInTheDocument()
    // Account email
    expect(screen.getByText(/john@corp\.co\.za/)).toBeInTheDocument()
    // Phone
    expect(
      screen.getByText(/\+27 82 123 4567/),
    ).toBeInTheDocument()
    // Company name
    expect(screen.getByText('Smith Corp')).toBeInTheDocument()
    // Trading name
    expect(screen.getByText('SmithCo')).toBeInTheDocument()
    // Company phone
    expect(
      screen.getByText(/\+27 11 123 4567/),
    ).toBeInTheDocument()
    // Company email
    expect(
      screen.getByText(/info@smithcorp\.co\.za/),
    ).toBeInTheDocument()
    // VAT number
    expect(screen.getByText('VAT12345')).toBeInTheDocument()
    // Reg number
    expect(screen.getByText('REG67890')).toBeInTheDocument()
    // Purchase order required
    expect(screen.getByText('Yes')).toBeInTheDocument()
    // Finance contact
    expect(screen.getByText('Alice Finance')).toBeInTheDocument()
    expect(
      screen.getByText(/alice@smithcorp\.co\.za/),
    ).toBeInTheDocument()
    // Notes
    expect(
      screen.getByText('We need wholesale pricing.'),
    ).toBeInTheDocument()
    // Physical address
    expect(screen.getByText('10 Main St')).toBeInTheDocument()
    // Status renders as "Pending" (header badge + status panel), not the raw enum value
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0)
    expect(screen.queryByText('PENDING')).not.toBeInTheDocument()
  })

  it('shows Approve and Reject buttons when status is PENDING', () => {
    const app = createPendingApplication()
    vi.mocked(useWholesaleApplicationDetail).mockReturnValue({
      data: app,
      isLoading: false,
    } as unknown as ReturnType<typeof useWholesaleApplicationDetail>)

    renderDetailPage()

    const actionsContainer = screen.getByTestId('decision-actions')
    expect(actionsContainer).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Approve' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reject' }),
    ).toBeInTheDocument()
  })

  it('does NOT show Approve/Reject to VIEWER even when status is PENDING', () => {
    useAdminAuthStore.setState({ role: 'VIEWER' })
    vi.mocked(useWholesaleApplicationDetail).mockReturnValue({
      data: createPendingApplication(),
      isLoading: false,
    } as unknown as ReturnType<typeof useWholesaleApplicationDetail>)

    renderDetailPage()

    expect(screen.queryByTestId('decision-actions')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Approve' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Reject' }),
    ).not.toBeInTheDocument()
  })

  it('shows Approve and Reject buttons to ORDER_MANAGER when status is PENDING', () => {
    useAdminAuthStore.setState({ role: 'ORDER_MANAGER' })
    vi.mocked(useWholesaleApplicationDetail).mockReturnValue({
      data: createPendingApplication(),
      isLoading: false,
    } as unknown as ReturnType<typeof useWholesaleApplicationDetail>)

    renderDetailPage()

    expect(screen.getByTestId('decision-actions')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Approve' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument()
  })

  it('does NOT show Approve/Reject for APPROVED status and shows processed date', () => {
    const app = createPendingApplication({
      status: 'APPROVED',
      processedAt: '2025-06-20T14:00:00Z',
    })
    vi.mocked(useWholesaleApplicationDetail).mockReturnValue({
      data: app,
      isLoading: false,
    } as unknown as ReturnType<typeof useWholesaleApplicationDetail>)

    renderDetailPage()

    expect(screen.queryByTestId('decision-actions')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Approve' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Reject' }),
    ).not.toBeInTheDocument()
    // Processed date is shown
    expect(screen.getByText(/Processed:/)).toBeInTheDocument()
  })

  it('does NOT show Approve/Reject for REJECTED status and shows processed date and rejection reason', () => {
    const app = createPendingApplication({
      status: 'REJECTED',
      processedAt: '2025-06-20T14:00:00Z',
      rejectionReason: 'Incomplete documentation provided.',
    })
    vi.mocked(useWholesaleApplicationDetail).mockReturnValue({
      data: app,
      isLoading: false,
    } as unknown as ReturnType<typeof useWholesaleApplicationDetail>)

    renderDetailPage()

    expect(screen.queryByTestId('decision-actions')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Approve' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Reject' }),
    ).not.toBeInTheDocument()
    // Processed date shown
    expect(screen.getByText(/Processed:/)).toBeInTheDocument()
    // Rejection reason shown
    expect(
      screen.getByText('Incomplete documentation provided.'),
    ).toBeInTheDocument()
    expect(screen.getByText(/Rejection Reason:/)).toBeInTheDocument()
  })
})
