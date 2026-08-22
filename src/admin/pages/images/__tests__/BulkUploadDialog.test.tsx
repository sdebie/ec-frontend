import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { useBulkUpload } from '@/admin/pages/images/hooks/useBulkUpload'
import { useImageDirectories } from '@/admin/pages/images/hooks/useImageDirectories'

import { BulkUploadDialog } from '../BulkUploadDialog'

// --- Mocks ---

vi.mock('@/admin/pages/images/hooks/useBulkUpload', () => ({
  useBulkUpload: vi.fn(),
}))
vi.mock('@/admin/pages/images/hooks/useImageDirectories', () => ({
  useImageDirectories: vi.fn(),
}))

// --- Helpers ---

function setupMocks(overrides?: {
  isUploading?: boolean
  progress?: { currentBatch: number; totalBatches: number } | null
}) {
  vi.mocked(useBulkUpload).mockReturnValue({
    upload: vi.fn().mockResolvedValue({ uploaded: 0, skipped: 0 }),
    progress: overrides?.progress ?? null,
    isUploading: overrides?.isUploading ?? false,
  })

  vi.mocked(useImageDirectories).mockReturnValue({
    data: ['products', 'brands'],
    isLoading: false,
  } as unknown as ReturnType<typeof useImageDirectories>)
}

function renderDialog() {
  return render(<BulkUploadDialog open onClose={vi.fn()} />)
}

function getFileInput(): HTMLInputElement {
  const input = document.querySelector('input[type="file"][multiple]:not([webkitdirectory])')
  expect(input).not.toBeNull()
  return input as HTMLInputElement
}

function getFolderInput(): HTMLInputElement {
  const input = document.querySelector('input[type="file"][webkitdirectory]')
  expect(input).not.toBeNull()
  return input as HTMLInputElement
}

describe('BulkUploadDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders mode toggle and destination select', () => {
    setupMocks()
    renderDialog()

    expect(screen.getByRole('button', { name: 'Select Files' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select Folder' })).toBeInTheDocument()
    expect(screen.getByText('Destination directory')).toBeInTheDocument()
  })

  it('non-image files are skipped and warning count shown', () => {
    setupMocks()
    renderDialog()

    const files = [
      new File([''], 'photo.jpg', { type: 'image/jpeg' }),
      new File([''], 'photo.png', { type: 'image/png' }),
      new File([''], 'notes.txt', { type: 'text/plain' }),
      new File([''], 'doc.pdf', { type: 'application/pdf' }),
    ]

    fireEvent.change(getFileInput(), { target: { files } })

    expect(screen.getByText(/2 file\(s\) skipped/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload (2 images)' })).toBeInTheDocument()
  })

  it('progress label updates per batch while uploading', () => {
    setupMocks({ isUploading: true, progress: { currentBatch: 2, totalBatches: 5 } })
    renderDialog()

    expect(screen.getByText('Batch 2 of 5')).toBeInTheDocument()
  })

  it('upload button is disabled when no files are selected', () => {
    setupMocks()
    renderDialog()

    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled()
  })

  it('folder mode rejects non-allowlisted image types the same way files mode does', () => {
    setupMocks()
    renderDialog()

    fireEvent.click(screen.getByRole('button', { name: 'Select Folder' }))

    const files = [
      new File([''], 'sku-1.jpg', { type: 'image/jpeg' }),
      new File([''], 'sku-2.gif', { type: 'image/gif' }),
    ]
    fireEvent.change(getFolderInput(), { target: { files } })

    expect(screen.getByText('1 image found for Storage root.')).toBeInTheDocument()
    expect(screen.queryByText(/sku-2\.gif/)).not.toBeInTheDocument()
  })
})
