import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { useProductUploadBatches } from '@/admin/hooks/imports/useProductUploadBatches'
import { useRefreshBatchStatus } from '@/admin/hooks/imports/useRefreshBatchStatus'
import { useUploadCsv } from '@/admin/hooks/imports/useUploadCsv'
import { useProductImportRows } from '@/admin/hooks/imports/useProductImportRows'
import { useBatchStatusPolling } from '@/admin/hooks/imports/useBatchStatusPolling'
import { useApproveBatch } from '@/admin/hooks/imports/useApproveBatch'
import type { ProductUploadBatchDto, ProductComparisonDto } from '@/admin/hooks/imports/types'

import ProductImportListPage from '../ProductImportListPage'
import ProductImportUploadPage from '../ProductImportUploadPage'
import ProductImportReviewPage from '../ProductImportReviewPage'

// --- Mocks ---

vi.mock('@/admin/hooks/imports/useProductUploadBatches', () => ({
  useProductUploadBatches: vi.fn(),
}))
vi.mock('@/admin/hooks/imports/useRefreshBatchStatus', () => ({
  useRefreshBatchStatus: vi.fn(),
}))
vi.mock('@/admin/hooks/imports/useUploadCsv', () => ({
  useUploadCsv: vi.fn(),
}))
vi.mock('@/admin/hooks/imports/useProductImportRows', () => ({
  useProductImportRows: vi.fn(),
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

// --- Helpers ---

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function mockRole(role: string) {
  vi.mocked(useAdminAuthStore).mockImplementation((selector: unknown) => {
    const state = { role }
    return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
  })
}

function createMockBatch(overrides?: Partial<ProductUploadBatchDto>): ProductUploadBatchDto {
  return {
    id: 'batch-1',
    filename: 'products.csv',
    status: 'PENDING',
    totalRows: 100,
    processedRows: 0,
    skippedRows: 0,
    validationErrorCount: 2,
    createdAt: '2025-01-15T10:30:00Z',
    completedAt: null,
    uploadedByUsername: 'admin@test.com',
    approvedByUsername: null,
    ...overrides,
  }
}

function createMockRow(overrides?: Partial<ProductComparisonDto>): ProductComparisonDto {
  return {
    stagedId: 'row-1',
    sku: 'SKU-001',
    validationStatus: 'VALID',
    validationErrors: null,
    imageErrors: null,
    newProduct: false,
    newVariant: false,
    hasChanges: true,
    currentName: 'Old Product',
    proposedName: 'New Product',
    currentDescription: 'Old desc',
    proposedDescription: 'New desc',
    currentStock: 10,
    proposedStock: 20,
    currentImages: 'old-front.jpg',
    proposedImages: 'front.jpg,back.jpg',
    currentAttributes: null,
    proposedAttributes: '{"size":"M"}',
    ...overrides,
  }
}

function setupListPageDefaults(overrides?: {
  batches?: ProductUploadBatchDto[]
  role?: string
}) {
  const batches = overrides?.batches ?? [createMockBatch()]

  vi.mocked(useProductUploadBatches).mockReturnValue({
    data: batches,
    isLoading: false,
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useProductUploadBatches>)

  vi.mocked(useRefreshBatchStatus).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useRefreshBatchStatus>)

  // The list page renders the upload dialog inline and calls useUploadCsv itself
  vi.mocked(useUploadCsv).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useUploadCsv>)

  mockRole(overrides?.role ?? 'SUPER_ADMIN')
}

function setupUploadPageDefaults(overrides?: { role?: string; isPending?: boolean }) {
  vi.mocked(useUploadCsv).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: overrides?.isPending ?? false,
  } as unknown as ReturnType<typeof useUploadCsv>)

  mockRole(overrides?.role ?? 'SUPER_ADMIN')
}

function setupReviewPageDefaults(overrides?: {
  role?: string
  rows?: ProductComparisonDto[]
  batchStatus?: string
}) {
  const batchStatus = overrides?.batchStatus ?? 'PENDING'
  const rows = overrides?.rows ?? [createMockRow()]

  vi.mocked(useProductImportRows).mockReturnValue({
    data: batchStatus === 'PENDING' || batchStatus === 'PROCESSED' || batchStatus === 'FAILED' ? rows : undefined,
    isLoading: false,
  } as unknown as ReturnType<typeof useProductImportRows>)

  vi.mocked(useBatchStatusPolling).mockImplementation(({ onStatusChange }) => {
    // Simulate immediate status transition to the desired status
    if (onStatusChange && batchStatus !== 'IMPORTING') {
      // Call onStatusChange synchronously during render setup
      setTimeout(() => {
        onStatusChange({
          batchId: 'batch-1',
          status: batchStatus as ProductUploadBatchDto['status'],
          totalRows: 100,
          processedRows: batchStatus === 'PROCESSED' ? 100 : 0,
          skippedRows: batchStatus === 'PROCESSED' ? 5 : 0,
          validationErrorCount: 0,
        })
      }, 0)
    }
    return { data: null, isPolling: false }
  })

  vi.mocked(useApproveBatch).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as unknown as ReturnType<typeof useApproveBatch>)

  mockRole(overrides?.role ?? 'SUPER_ADMIN')
}

function renderListPage() {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/imports/products/list']}>
        <ProductImportListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function renderUploadPage() {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/imports/products/bulk-upload']}>
        <Routes>
          <Route path="/admin/imports/products/bulk-upload" element={<ProductImportUploadPage />} />
          <Route path="/admin/imports/products/list" element={<div>Product Import List Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function renderReviewPage() {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/imports/products/bulk-upload/review/batch-1']}>
        <Routes>
          <Route path="/admin/imports/products/bulk-upload/review/:batchId" element={<ProductImportReviewPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

// --- Tests ---

describe('ProductImportListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders DataTable with correct column headers', () => {
    setupListPageDefaults()
    renderListPage()

    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('Filename')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Total Rows')).toBeInTheDocument()
    expect(screen.getByText('Processed')).toBeInTheDocument()
    expect(screen.getByText('Skipped')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('renders "+ Upload CSV" button when canMutate is true (SUPER_ADMIN)', () => {
    setupListPageDefaults({ role: 'SUPER_ADMIN' })
    renderListPage()

    expect(screen.getByRole('button', { name: '+ Upload CSV' })).toBeInTheDocument()
  })

  it('does NOT render "+ Upload CSV" button when canMutate is false (VIEWER)', () => {
    setupListPageDefaults({ role: 'VIEWER' })
    renderListPage()

    expect(screen.queryByRole('button', { name: '+ Upload CSV' })).not.toBeInTheDocument()
  })

  it('renders "Review" button for PENDING batches', () => {
    setupListPageDefaults({
      batches: [createMockBatch({ status: 'PENDING' })],
    })
    renderListPage()

    expect(screen.getByRole('button', { name: 'Review' })).toBeInTheDocument()
  })

  it('does NOT render "Review" button for PROCESSED batches', () => {
    setupListPageDefaults({
      batches: [createMockBatch({ status: 'PROCESSED' })],
    })
    renderListPage()

    expect(screen.queryByRole('button', { name: 'Review' })).not.toBeInTheDocument()
  })
})

describe('ProductImportUploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects VIEWER to list page', () => {
    setupUploadPageDefaults({ role: 'VIEWER' })
    renderUploadPage()

    expect(screen.getByText('Product Import List Page')).toBeInTheDocument()
    expect(screen.queryByText('Upload Product CSV')).not.toBeInTheDocument()
  })

  it('renders upload page for SUPER_ADMIN', () => {
    setupUploadPageDefaults({ role: 'SUPER_ADMIN' })
    renderUploadPage()

    expect(screen.getByRole('heading', { name: 'Upload Product CSV' })).toBeInTheDocument()
  })

  it('renders Upload button disabled when no file is selected', () => {
    setupUploadPageDefaults({ role: 'SUPER_ADMIN' })
    renderUploadPage()

    const uploadButton = screen.getByRole('button', { name: 'Upload' })
    expect(uploadButton).toBeDisabled()
  })

  it('shows "Processing CSV..." text and disables button when upload is in progress', () => {
    setupUploadPageDefaults({ role: 'SUPER_ADMIN', isPending: true })
    renderUploadPage()

    const processingButton = screen.getByRole('button', { name: 'Processing CSV...' })
    expect(processingButton).toBeDisabled()
  })
})

describe('ProductImportReviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows "Approve Import" button when status is PENDING and canMutate is true', async () => {
    setupReviewPageDefaults({ role: 'SUPER_ADMIN', batchStatus: 'PENDING' })
    renderReviewPage()

    // The component starts in IMPORTING and transitions after polling callback
    // But since useBatchStatusPolling fires onStatusChange via setTimeout,
    // we need to wait for the state update
    const approveButton = await screen.findByRole('button', { name: 'Approve Import' })
    expect(approveButton).toBeInTheDocument()
  })

  it('does NOT show "Approve Import" button when canMutate is false (VIEWER)', async () => {
    setupReviewPageDefaults({ role: 'VIEWER', batchStatus: 'PENDING' })
    renderReviewPage()

    // Wait for potential render cycle to complete
    await screen.findByText('Review Product Import')
    expect(screen.queryByRole('button', { name: 'Approve Import' })).not.toBeInTheDocument()
  })

  it('does NOT show "Approve Import" button when status is PROCESSED', async () => {
    setupReviewPageDefaults({ role: 'SUPER_ADMIN', batchStatus: 'PROCESSED' })
    renderReviewPage()

    // Wait for the status update to propagate
    await screen.findByText('Review Product Import')
    expect(screen.queryByRole('button', { name: 'Approve Import' })).not.toBeInTheDocument()
  })

  it('does NOT show "Approve Import" button when status is FAILED (read-only mode)', async () => {
    setupReviewPageDefaults({ role: 'SUPER_ADMIN', batchStatus: 'FAILED' })
    renderReviewPage()

    await screen.findByText('Review Product Import')
    expect(screen.queryByRole('button', { name: 'Approve Import' })).not.toBeInTheDocument()
  })
})
