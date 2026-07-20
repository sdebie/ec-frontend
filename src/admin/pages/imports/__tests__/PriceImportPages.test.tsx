import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { usePriceUploadBatches } from '@/admin/hooks/imports/usePriceUploadBatches'
import { useRefreshBatchStatus } from '@/admin/hooks/imports/useRefreshBatchStatus'
import { useUploadCsv } from '@/admin/hooks/imports/useUploadCsv'
import { usePriceImportRows } from '@/admin/hooks/imports/usePriceImportRows'
import { useBatchStatusPolling } from '@/admin/hooks/imports/useBatchStatusPolling'
import { useApproveBatch } from '@/admin/hooks/imports/useApproveBatch'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import type { ProductUploadBatchDto, ProductPriceComparisonDto } from '@/admin/hooks/imports/types'

import PriceImportListPage from '../PriceImportListPage'
import PriceImportUploadPage from '../PriceImportUploadPage'
import PriceImportReviewPage from '../PriceImportReviewPage'

// --- Mocks ---

const mockNavigate = vi.fn()

vi.mock('@/admin/hooks/imports/usePriceUploadBatches', () => ({
  usePriceUploadBatches: vi.fn(),
}))
vi.mock('@/admin/hooks/imports/useRefreshBatchStatus', () => ({
  useRefreshBatchStatus: vi.fn(),
}))
vi.mock('@/admin/hooks/imports/useUploadCsv', () => ({
  useUploadCsv: vi.fn(),
}))
vi.mock('@/admin/hooks/imports/usePriceImportRows', () => ({
  usePriceImportRows: vi.fn(),
}))
vi.mock('@/admin/hooks/imports/useBatchStatusPolling', () => ({
  useBatchStatusPolling: vi.fn(),
}))
vi.mock('@/admin/hooks/imports/useApproveBatch', () => ({
  useApproveBatch: vi.fn(),
}))
vi.mock('@/shared/auth/adminAuthStore', () => ({
  useAdminAuthStore: vi.fn(),
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ batchId: 'batch-123' }),
  }
})

// --- Mock Data Helpers ---

function createMockBatch(overrides?: Partial<ProductUploadBatchDto>): ProductUploadBatchDto {
  return {
    id: 'batch-1',
    filename: 'prices.csv',
    status: 'PENDING',
    totalRows: 50,
    processedRows: 0,
    skippedRows: 0,
    validationErrorCount: 2,
    createdAt: '2025-01-15T10:00:00Z',
    completedAt: null,
    uploadedByUsername: 'admin@test.com',
    approvedByUsername: null,
    ...overrides,
  }
}

function createMockPriceRow(overrides?: Partial<ProductPriceComparisonDto>): ProductPriceComparisonDto {
  return {
    stagedId: 'staged-1',
    sku: 'SKU-001',
    validationStatus: 'VALID',
    validationErrors: null,
    hasChanges: true,
    currentRetailPrice: 100,
    proposedRetailPrice: 120,
    currentWholesalePrice: 80,
    proposedWholesalePrice: 95,
    ...overrides,
  }
}

// --- Setup Helpers ---

function setupAuthMock(role: string) {
  vi.mocked(useAdminAuthStore).mockImplementation((selector: unknown) => {
    const state = { role }
    return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
  })
}

function setupListPageMocks(overrides?: {
  batches?: ProductUploadBatchDto[]
  isLoading?: boolean
  role?: string
}) {
  setupAuthMock(overrides?.role ?? 'SUPER_ADMIN')

  vi.mocked(usePriceUploadBatches).mockReturnValue({
    data: overrides?.batches ?? [createMockBatch()],
    isLoading: overrides?.isLoading ?? false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof usePriceUploadBatches>)

  vi.mocked(useRefreshBatchStatus).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useRefreshBatchStatus>)

  // The list page renders the upload dialog inline and calls useUploadCsv itself
  vi.mocked(useUploadCsv).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useUploadCsv>)
}

function setupUploadPageMocks(role: string = 'SUPER_ADMIN') {
  setupAuthMock(role)

  vi.mocked(useUploadCsv).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useUploadCsv>)
}

function setupReviewPageMocks(overrides?: {
  rows?: ProductPriceComparisonDto[]
  batchStatus?: string | null
  role?: string
}) {
  setupAuthMock(overrides?.role ?? 'SUPER_ADMIN')

  const status = overrides?.batchStatus ?? 'PENDING'

  vi.mocked(usePriceImportRows).mockReturnValue({
    data: overrides?.rows ?? [createMockPriceRow()],
    isLoading: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof usePriceImportRows>)

  // The component uses useBatchStatusPolling's onStatusChange callback to update internal state.
  // We simulate this by calling the onStatusChange callback immediately when the hook is invoked.
  vi.mocked(useBatchStatusPolling).mockImplementation(({ onStatusChange }) => {
    if (status && onStatusChange) {
      // Use a microtask-free approach: call onStatusChange synchronously during render
      // would cause issues, so we rely on the component's useState initialisation.
      // Instead, schedule it for the next microtask.
      Promise.resolve().then(() => {
        onStatusChange({
          batchId: 'batch-123',
          status: status as 'PENDING' | 'IMPORTING' | 'PROCESSING' | 'PROCESSED' | 'FAILED',
          totalRows: 50,
          processedRows: 0,
          skippedRows: 0,
          validationErrorCount: 0,
        })
      })
    }
    return { data: null, isPolling: false }
  })

  vi.mocked(useApproveBatch).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useApproveBatch>)
}

// --- Tests ---

describe('PriceImportListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Bulk Price Changes" title and DataTable with correct columns', () => {
    setupListPageMocks()

    render(
      <MemoryRouter>
        <PriceImportListPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Bulk Price Changes')).toBeInTheDocument()
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Filename')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Total Rows')).toBeInTheDocument()
    expect(screen.getByText('Processed')).toBeInTheDocument()
    expect(screen.getByText('Skipped')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('shows "+ Upload CSV" button for SUPER_ADMIN', () => {
    setupListPageMocks({ role: 'SUPER_ADMIN' })

    render(
      <MemoryRouter>
        <PriceImportListPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('+ Upload CSV')).toBeInTheDocument()
  })

  it('hides "+ Upload CSV" button for VIEWER', () => {
    setupListPageMocks({ role: 'VIEWER' })

    render(
      <MemoryRouter>
        <PriceImportListPage />
      </MemoryRouter>,
    )

    expect(screen.queryByText('+ Upload CSV')).not.toBeInTheDocument()
  })
})

describe('PriceImportUploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows CSV column hint text with required and optional columns', () => {
    setupUploadPageMocks('SUPER_ADMIN')

    render(
      <MemoryRouter>
        <PriceImportUploadPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/Required columns/)).toBeInTheDocument()
    expect(screen.getByText('sku')).toBeInTheDocument()
    expect(screen.getByText('retail_price')).toBeInTheDocument()
  })

  it('redirects VIEWER to price list page', () => {
    setupUploadPageMocks('VIEWER')

    render(
      <MemoryRouter>
        <PriceImportUploadPage />
      </MemoryRouter>,
    )

    // When canMutate is false, the component renders <Navigate> instead of the upload form
    expect(screen.queryByText('Upload Price CSV')).not.toBeInTheDocument()
    expect(screen.queryByText(/Required columns/)).not.toBeInTheDocument()
  })
})

describe('PriceImportReviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows correct price columns in the DataTable', async () => {
    setupReviewPageMocks({
      rows: [createMockPriceRow()],
      batchStatus: 'PENDING',
    })

    render(
      <MemoryRouter>
        <PriceImportReviewPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Current Retail')).toBeInTheDocument()
    })
    expect(screen.getByText('Proposed Retail')).toBeInTheDocument()
    expect(screen.getByText('Current Wholesale')).toBeInTheDocument()
    expect(screen.getByText('Proposed Wholesale')).toBeInTheDocument()
    expect(screen.getByText('Change')).toBeInTheDocument()
    expect(screen.getByText('Validation')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('shows "Approve Import" button when status is PENDING and canMutate is true', async () => {
    setupReviewPageMocks({
      batchStatus: 'PENDING',
      role: 'SUPER_ADMIN',
    })

    render(
      <MemoryRouter>
        <PriceImportReviewPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Approve Import')).toBeInTheDocument()
    })
  })

  it('hides "Approve Import" button when canMutate is false', async () => {
    setupReviewPageMocks({
      batchStatus: 'PENDING',
      role: 'VIEWER',
    })

    render(
      <MemoryRouter>
        <PriceImportReviewPage />
      </MemoryRouter>,
    )

    // Even after status callback fires, button shouldn't appear for VIEWER
    await waitFor(() => {
      expect(screen.getByText('Price Import Review')).toBeInTheDocument()
    })
    expect(screen.queryByText('Approve Import')).not.toBeInTheDocument()
  })

  it('hides "Approve Import" button when status is PROCESSED', async () => {
    setupReviewPageMocks({
      batchStatus: 'PROCESSED',
      role: 'SUPER_ADMIN',
    })

    render(
      <MemoryRouter>
        <PriceImportReviewPage />
      </MemoryRouter>,
    )

    // After status callback fires with PROCESSED, approve button shouldn't appear
    await waitFor(() => {
      expect(screen.getByText('Price Import Review')).toBeInTheDocument()
    })
    expect(screen.queryByText('Approve Import')).not.toBeInTheDocument()
  })

  it('shows the view-errors eye button only for rows with validation errors', async () => {
    setupReviewPageMocks({
      rows: [
        createMockPriceRow(),
        createMockPriceRow({
          stagedId: 'staged-2',
          sku: 'SKU-002',
          validationStatus: 'INVALID',
          validationErrors: 'SKU not found; Proposed retail price must be positive',
        }),
      ],
      batchStatus: 'PENDING',
    })

    render(
      <MemoryRouter>
        <PriceImportReviewPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('SKU-002')).toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: 'View validation errors for SKU-002' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'View validation errors for SKU-001' }),
    ).not.toBeInTheDocument()
  })

  it('opens a dialog listing the row validation errors when the eye button is clicked', async () => {
    setupReviewPageMocks({
      rows: [
        createMockPriceRow({
          sku: 'SKU-002',
          validationStatus: 'INVALID',
          validationErrors: 'SKU not found; Proposed retail price must be positive',
        }),
      ],
      batchStatus: 'PENDING',
    })

    render(
      <MemoryRouter>
        <PriceImportReviewPage />
      </MemoryRouter>,
    )

    const user = userEvent.setup()
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'View validation errors for SKU-002' }),
      ).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'View validation errors for SKU-002' }))

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveTextContent('Validation Errors')
    expect(dialog).toHaveTextContent('SKU: SKU-002')
    expect(dialog).toHaveTextContent('SKU not found')
    expect(dialog).toHaveTextContent('Proposed retail price must be positive')

    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
