import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BrandForm } from '../BrandForm'

const mockUploadLogo = vi.fn()

// Page-aware: two pages of results so pagination controls have something to
// page between. totalCount must exceed BrandForm's own LOGO_LIBRARY_PAGE_SIZE
// (18) for libraryTotalPages to come out to 2 — the mock's own pageSize field
// is just descriptive, the component never reads it back.
const LIBRARY_PAGES: Record<number, { images: string[]; totalCount: number; page: number; pageSize: number }> = {
  0: { images: ['brands/logo-a.png', 'brands/logo-b.png'], totalCount: 20, page: 0, pageSize: 18 },
  1: { images: ['brands/logo-c.png'], totalCount: 20, page: 1, pageSize: 18 },
}

const mockUseImageListPage = vi.fn((params: { page: number }) => ({
  data: LIBRARY_PAGES[params.page] ?? LIBRARY_PAGES[0],
  isLoading: false,
  isFetching: false,
}))

vi.mock('@/admin/hooks/images', () => ({
  useUploadBrandLogo: vi.fn(() => ({ mutate: mockUploadLogo, isPending: false })),
  useImageListPage: (params: { page: number }) => mockUseImageListPage(params),
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

describe('BrandForm library pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a page indicator and lets Next replace the grid with the next page', () => {
    renderBrandForm()

    fireEvent.click(screen.getByRole('button', { name: 'Choose from library' }))

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'logo-a.png' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))

    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'logo-a.png' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'logo-c.png' })).toBeInTheDocument()
  })

  it('resets to page 1 when the search term changes', async () => {
    renderBrandForm()

    fireEvent.click(screen.getByRole('button', { name: 'Choose from library' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Search library images...'), { target: { value: 'kiddies' } })

    // The search is debounced (300ms) before it drives the page-reset effect.
    await waitFor(() => expect(screen.getByText('Page 1 of 2')).toBeInTheDocument())
  })

  it('hides the pagination controls when everything fits on one page', () => {
    // mockReturnValue (not -Once): the component calls the hook on every
    // render, including several before the user ever opens library mode.
    mockUseImageListPage.mockReturnValue({
      data: { images: ['brands/logo-a.png'], totalCount: 1, page: 0, pageSize: 18 },
      isLoading: false,
      isFetching: false,
    })
    renderBrandForm()

    fireEvent.click(screen.getByRole('button', { name: 'Choose from library' }))

    expect(screen.queryByText(/Page \d+ of \d+/)).not.toBeInTheDocument()
  })
})
