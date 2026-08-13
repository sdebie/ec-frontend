import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BrandForm } from '../BrandForm'
import type { BrandFormValues } from '../BrandForm'

const mockUploadLogo = vi.fn()

// Page-aware: two pages of results so pagination controls have something to
// page between. totalCount must exceed BrandForm's own LOGO_LIBRARY_PAGE_SIZE
// (12) for libraryTotalPages to come out to 2 — the mock's own pageSize field
// is just descriptive, the component never reads it back.
interface LibraryPage {
  images: string[]
  totalCount: number
  page: number
  pageSize: number
}

const LIBRARY_PAGES: Record<number, LibraryPage> = {
  0: { images: ['brands/logo-a.png', 'brands/logo-b.png'], totalCount: 20, page: 0, pageSize: 12 },
  1: { images: ['brands/logo-c.png'], totalCount: 20, page: 1, pageSize: 12 },
}

interface ImageListPageResult {
  data: LibraryPage | undefined
  isLoading: boolean
  isFetching: boolean
}

const mockUseImageListPage = vi.fn(
  (params: { page: number }): ImageListPageResult => ({
    data: LIBRARY_PAGES[params.page] ?? LIBRARY_PAGES[0],
    isLoading: false,
    isFetching: false,
  }),
)

vi.mock('@/admin/hooks/images', () => ({
  useUploadBrandLogo: vi.fn(() => ({ mutate: mockUploadLogo, isPending: false })),
  useImageListPage: (params: { page: number }) => mockUseImageListPage(params),
}))

function renderBrandForm(defaultValues?: Partial<BrandFormValues>) {
  return render(
    <MemoryRouter>
      <BrandForm onSubmit={vi.fn()} defaultValues={defaultValues} />
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
    expect(screen.getByRole('button', { name: 'Upload New' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choose from Library' })).toBeInTheDocument()
  })

  it('switching to library mode shows the picker and hides the dropzone', () => {
    renderBrandForm()

    fireEvent.click(screen.getByRole('button', { name: 'Choose from Library' }))

    expect(screen.queryByText('Click to upload')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'logo-a.png' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'logo-b.png' })).toBeInTheDocument()
  })

  it('selecting a library image sets the logo, reflected back in upload mode', () => {
    renderBrandForm()

    fireEvent.click(screen.getByRole('button', { name: 'Choose from Library' }))
    fireEvent.click(screen.getByRole('button', { name: 'logo-a.png' }))
    fireEvent.click(screen.getByRole('button', { name: 'Upload New' }))

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

    fireEvent.click(screen.getByRole('button', { name: 'Choose from Library' }))

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

    fireEvent.click(screen.getByRole('button', { name: 'Choose from Library' }))
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
      data: { images: ['brands/logo-a.png'], totalCount: 1, page: 0, pageSize: 12 },
      isLoading: false,
      isFetching: false,
    })
    renderBrandForm()

    fireEvent.click(screen.getByRole('button', { name: 'Choose from Library' }))

    expect(screen.queryByText(/Page \d+ of \d+/)).not.toBeInTheDocument()
  })

  it('keeps the previous page visible with a spinner overlay while the next page fetches, instead of blanking the grid', () => {
    // isFetching without isLoading is exactly the placeholderData:keepPreviousData
    // state — a background refetch with stale-but-still-shown data.
    mockUseImageListPage.mockReturnValue({
      data: LIBRARY_PAGES[0],
      isLoading: false,
      isFetching: true,
    })
    renderBrandForm()

    fireEvent.click(screen.getByRole('button', { name: 'Choose from Library' }))

    expect(screen.getByRole('button', { name: 'logo-a.png' })).toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('does not show the spinner overlay during the true first load into library mode', () => {
    mockUseImageListPage.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
    })
    renderBrandForm()

    fireEvent.click(screen.getByRole('button', { name: 'Choose from Library' }))

    // ImageGalleryPicker's own full "Loading images..." state owns this case.
    expect(screen.getByText('Loading images...')).toBeInTheDocument()
    expect(document.querySelector('.animate-spin.text-\\(--c-text-muted\\)')).not.toBeInTheDocument()
  })
})

describe('BrandForm slug lock (edit mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const editDefaults: Partial<BrandFormValues> = {
    name: 'Dromex',
    slug: 'dromex',
    description: '',
    logoUrl: '',
  }

  it('makes the slug field read-only once a brand already exists', () => {
    renderBrandForm(editDefaults)

    const slugInput = screen.getByPlaceholderText('brand-slug')
    expect(slugInput).toHaveAttribute('readonly')
    expect(screen.getByText(/locked once a brand is created/i)).toBeInTheDocument()
  })

  it('leaves the slug field editable while creating a new brand', () => {
    renderBrandForm()

    const slugInput = screen.getByPlaceholderText('brand-slug')
    expect(slugInput).not.toHaveAttribute('readonly')
    expect(screen.getByText(/automatically created from the name/i)).toBeInTheDocument()
  })
})
