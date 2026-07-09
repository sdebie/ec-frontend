import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { deriveCanMutate } from '@/admin/hooks/imports/utils'
import { useBulkUpload } from '@/admin/hooks/images/useBulkUpload'
import { useImageDirectories } from '@/admin/hooks/images/useImageDirectories'

import BulkUploaderPage from '../BulkUploaderPage'

// --- Mocks ---

vi.mock('@/shared/auth/adminAuthStore', () => ({
  useAdminAuthStore: vi.fn(),
}))
vi.mock('@/admin/hooks/imports/utils', () => ({
  deriveCanMutate: vi.fn(),
}))
vi.mock('@/admin/hooks/images/useBulkUpload', () => ({
  useBulkUpload: vi.fn(),
}))
vi.mock('@/admin/hooks/images/useImageDirectories', () => ({
  useImageDirectories: vi.fn(),
}))

// --- Helpers ---

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function setupDefaults(overrides?: { canMutate?: boolean; progress?: { currentBatch: number; totalBatches: number } | null; isUploading?: boolean }) {
  vi.mocked(useAdminAuthStore).mockImplementation((selector: unknown) => {
    const state = { role: overrides?.canMutate === false ? 'VIEWER' : 'SUPER_ADMIN' }
    return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
  })

  vi.mocked(deriveCanMutate).mockReturnValue(overrides?.canMutate ?? true)

  vi.mocked(useImageDirectories).mockReturnValue({
    data: ['products', 'brands'],
  } as unknown as ReturnType<typeof useImageDirectories>)

  vi.mocked(useBulkUpload).mockReturnValue({
    upload: vi.fn(),
    progress: overrides?.progress ?? null,
    isUploading: overrides?.isUploading ?? false,
  })
}

function renderBulkUploaderPage() {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/images/bulk-upload']}>
        <Routes>
          <Route path="/admin/images/bulk-upload" element={<BulkUploaderPage />} />
          <Route path="/admin/images" element={<div>Image Gallery Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

// --- Tests ---

describe('BulkUploaderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects VIEWER to /admin/images', () => {
    setupDefaults({ canMutate: false })
    renderBulkUploaderPage()

    expect(screen.getByText('Image Gallery Page')).toBeInTheDocument()
    expect(screen.queryByText('Bulk Upload Images')).not.toBeInTheDocument()
  })

  it('non-image files are skipped and warning count shown', () => {
    setupDefaults({ canMutate: true })
    const { container } = renderBulkUploaderPage()

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement

    const validFile1 = new File([''], 'photo.jpg', { type: 'image/jpeg' })
    const validFile2 = new File([''], 'banner.png', { type: 'image/png' })
    const invalidFile = new File([''], 'readme.txt', { type: 'text/plain' })

    fireEvent.change(fileInput, {
      target: { files: [validFile1, validFile2, invalidFile] },
    })

    expect(screen.getByText('1 file(s) were skipped (unsupported format)')).toBeInTheDocument()
    expect(screen.getByText('2 file(s) selected')).toBeInTheDocument()
  })

  it('progress label updates per batch', () => {
    setupDefaults({
      canMutate: true,
      progress: { currentBatch: 2, totalBatches: 5 },
      isUploading: true,
    })
    renderBulkUploaderPage()

    expect(screen.getByText('Uploading batch 2 of 5')).toBeInTheDocument()
  })
})
