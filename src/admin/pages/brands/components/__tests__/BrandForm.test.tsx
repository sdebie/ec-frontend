import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BrandForm } from '../BrandForm'

const mockUploadLogo = vi.fn()

vi.mock('@/admin/hooks/images', () => ({
  useUploadBrandLogo: vi.fn(() => ({ mutate: mockUploadLogo, isPending: false })),
  useImageList: vi.fn(() => ({
    data: {
      pages: [{ images: ['brands/logo-a.png', 'brands/logo-b.png'], totalCount: 2, page: 0, pageSize: 15 }],
    },
    isLoading: false,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  })),
}))

function renderBrandForm() {
  return render(
    <MemoryRouter>
      <BrandForm onSubmit={vi.fn()} />
    </MemoryRouter>,
  )
}

describe('BrandForm logo toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('defaults to upload mode with the dropzone visible', () => {
    renderBrandForm()

    expect(screen.getByText('Click to upload')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload new' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choose from library' })).toBeInTheDocument()
  })

  it('switching to library mode shows the picker and hides the dropzone', () => {
    renderBrandForm()

    fireEvent.click(screen.getByRole('button', { name: 'Choose from library' }))

    expect(screen.queryByText('Click to upload')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'logo-a.png' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'logo-b.png' })).toBeInTheDocument()
  })

  it('selecting a library image sets the logo, reflected back in upload mode', () => {
    renderBrandForm()

    fireEvent.click(screen.getByRole('button', { name: 'Choose from library' }))
    fireEvent.click(screen.getByRole('button', { name: 'logo-a.png' }))
    fireEvent.click(screen.getByRole('button', { name: 'Upload new' }))

    const logoPreview = screen.getByRole('img', { name: 'Current' })
    expect(logoPreview).toHaveAttribute('src', expect.stringContaining('logo-a.png'))
  })
})
