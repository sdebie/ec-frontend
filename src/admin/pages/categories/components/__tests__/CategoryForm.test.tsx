import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CategoryForm } from '../CategoryForm'
import type { CategoryFormValues } from '../CategoryForm'

const mockUploadImage = vi.fn()

// Page-aware: two pages of results so pagination controls have something to
// page between. totalCount must exceed CategoryForm's own IMAGE_LIBRARY_PAGE_SIZE
// (12) for libraryTotalPages to come out to 2 — the mock's own pageSize field
// is just descriptive, the component never reads it back.
interface LibraryPage {
  images: string[]
  totalCount: number
  page: number
  pageSize: number
}

const LIBRARY_PAGES: Record<number, LibraryPage> = {
  0: { images: ['categories/cat-a.png', 'categories/cat-b.png'], totalCount: 20, page: 0, pageSize: 12 },
  1: { images: ['categories/cat-c.png'], totalCount: 20, page: 1, pageSize: 12 },
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
  useUploadImageAsset: vi.fn(() => ({ mutate: mockUploadImage, isPending: false })),
  useImageListPage: (params: { page: number }) => mockUseImageListPage(params),
}))

// Feeds both the parent-category picker and the duplicate name/slug pre-check:
// two top-level categories (deliberately unsorted to pin the picker's sort) and
// one child, which must never be offered as a parent.
vi.mock('@/admin/pages/categories/hooks/useCategoryList', () => ({
  useCategoryList: vi.fn(() => ({
    data: {
      content: [
        { id: 'parent-2', name: 'Outdoor', slug: 'outdoor', description: null, imageUrl: null, parent: null },
        { id: 'parent-1', name: 'Cleaning', slug: 'cleaning', description: null, imageUrl: null, parent: null },
        { id: 'child-1', name: 'Mops', slug: 'mops', description: null, imageUrl: null, parent: { id: 'parent-1', name: 'Cleaning' } },
      ],
      totalElements: 3,
      totalPages: 1,
    },
    isLoading: false,
    error: null,
    sorting: [],
    onSortingChange: vi.fn(),
  })),
}))

type SubmitMock = ReturnType<typeof vi.fn<(values: CategoryFormValues) => void>>

function renderCategoryForm(
  defaultValues?: Partial<CategoryFormValues>,
  {onSubmit = vi.fn<(values: CategoryFormValues) => void>(), editingCategoryId}: {onSubmit?: SubmitMock; editingCategoryId?: string} = {},
) {
  return render(
    <MemoryRouter>
      <CategoryForm onSubmit={onSubmit} defaultValues={defaultValues} editingCategoryId={editingCategoryId} />
    </MemoryRouter>,
  )
}

describe('CategoryForm image toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('defaults to upload mode with the dropzone visible', () => {
    renderCategoryForm()

    expect(screen.getByText('Click to upload')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload New' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Choose from Library' })).toBeInTheDocument()
  })

  it('switching to library mode shows the picker and hides the dropzone', () => {
    renderCategoryForm()

    fireEvent.click(screen.getByRole('button', { name: 'Choose from Library' }))

    expect(screen.queryByText('Click to upload')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cat-a.png' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cat-b.png' })).toBeInTheDocument()
  })

  it('selecting a library image sets the image, reflected back in upload mode', () => {
    renderCategoryForm()

    fireEvent.click(screen.getByRole('button', { name: 'Choose from Library' }))
    fireEvent.click(screen.getByRole('button', { name: 'cat-a.png' }))
    fireEvent.click(screen.getByRole('button', { name: 'Upload New' }))

    const imagePreview = screen.getByRole('img', { name: 'Current' })
    expect(imagePreview).toHaveAttribute('src', expect.stringContaining('cat-a.png'))
  })
})

describe('CategoryForm library pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a page indicator and lets Next replace the grid with the next page', () => {
    renderCategoryForm()

    fireEvent.click(screen.getByRole('button', { name: 'Choose from Library' }))

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'cat-a.png' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))

    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'cat-a.png' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cat-c.png' })).toBeInTheDocument()
  })

  it('resets to page 1 when the search term changes', async () => {
    renderCategoryForm()

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
      data: { images: ['categories/cat-a.png'], totalCount: 1, page: 0, pageSize: 12 },
      isLoading: false,
      isFetching: false,
    })
    renderCategoryForm()

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
    renderCategoryForm()

    fireEvent.click(screen.getByRole('button', { name: 'Choose from Library' }))

    expect(screen.getByRole('button', { name: 'cat-a.png' })).toBeInTheDocument()
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('does not show the spinner overlay during the true first load into library mode', () => {
    mockUseImageListPage.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
    })
    renderCategoryForm()

    fireEvent.click(screen.getByRole('button', { name: 'Choose from Library' }))

    // ImageGalleryPicker's own full "Loading images..." state owns this case.
    expect(screen.getByText('Loading images...')).toBeInTheDocument()
    expect(document.querySelector('.animate-spin.text-\\(--c-text-muted\\)')).not.toBeInTheDocument()
  })
})

describe('CategoryForm slug lock (edit mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const editDefaults: Partial<CategoryFormValues> = {
    name: 'Electronics',
    slug: 'electronics',
    description: '',
    imageUrl: '',
    parentId: null,
  }

  it('makes the slug field read-only once a category already exists', () => {
    renderCategoryForm(editDefaults)

    const slugInput = screen.getByPlaceholderText('category-slug')
    expect(slugInput).toHaveAttribute('readonly')
    expect(screen.getByText(/locked once a category is created/i)).toBeInTheDocument()
  })

  it('keeps the stored slug when the name has diverged from it — the auto-slug must not regenerate a locked slug on mount', () => {
    // A name whose toSlug() differs from the stored slug is exactly the case
    // where a mount-time regeneration becomes visible (and would be saved).
    renderCategoryForm({ name: 'Electronics Renamed', slug: 'electronics' })

    expect(screen.getByPlaceholderText('category-slug')).toHaveValue('electronics')
  })

  it('leaves the slug field editable while creating a new category', () => {
    renderCategoryForm()

    const slugInput = screen.getByPlaceholderText('category-slug')
    expect(slugInput).not.toHaveAttribute('readonly')
    expect(screen.getByText(/automatically created from the name/i)).toBeInTheDocument()
  })
})

describe('CategoryForm actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('labels the submit button by mode', () => {
    const { unmount } = renderCategoryForm()
    expect(screen.getByRole('button', { name: 'Create Category' })).toBeInTheDocument()
    unmount()

    renderCategoryForm({ name: 'Electronics', slug: 'electronics' })
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })

  it('still offers the parent-category selector alongside the image picker', () => {
    renderCategoryForm()

    expect(screen.getByText('Parent Category')).toBeInTheDocument()
  })
})

describe('CategoryForm parent picker (searchable)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // The trigger's accessible name is the FormItem label (associated via the
  // injected id → htmlFor), so this query also pins that association working.
  const openParentPicker = () => {
    fireEvent.click(screen.getByRole('button', { name: 'Parent Category' }))
  }

  it('offers only top-level categories, alphabetically, under the None option', () => {
    renderCategoryForm()
    openParentPicker()

    const options = screen.getAllByRole('option').map((el) => el.textContent)
    expect(options).toEqual(['None (top-level)', 'Cleaning', 'Outdoor'])
  })

  it('filters options as the user types in the search input', () => {
    renderCategoryForm()
    openParentPicker()

    fireEvent.change(screen.getByPlaceholderText('Search categories...'), { target: { value: 'out' } })

    const options = screen.getAllByRole('option').map((el) => el.textContent)
    expect(options).toEqual(['Outdoor'])
  })

  it('selecting an option closes the menu and shows the chosen parent on the trigger', () => {
    renderCategoryForm()
    openParentPicker()

    fireEvent.click(screen.getByRole('option', { name: 'Outdoor' }))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Parent Category' })).toHaveTextContent('Outdoor')
  })

  it('excludes the category being edited from the options', () => {
    renderCategoryForm(
      { name: 'Cleaning', slug: 'cleaning' },
      { editingCategoryId: 'parent-1' },
    )
    openParentPicker()

    const options = screen.getAllByRole('option').map((el) => el.textContent)
    expect(options).toEqual(['None (top-level)', 'Outdoor'])
  })
})

describe('CategoryForm duplicate pre-check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const fillName = (value: string) =>
    fireEvent.change(screen.getByPlaceholderText('Category name'), { target: { value } })
  const submit = () => fireEvent.click(screen.getByRole('button', { name: /Create Category|Save Changes/ }))

  it('blocks submit and shows a field error when the name matches an existing category (case-insensitive)', async () => {
    const onSubmit = vi.fn<(values: CategoryFormValues) => void>()
    renderCategoryForm(undefined, { onSubmit })

    fillName('cLEANing')
    submit()

    expect(await screen.findByText('A category with this name already exists')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('blocks submit on a slug collision even when the name itself is new', async () => {
    const onSubmit = vi.fn<(values: CategoryFormValues) => void>()
    renderCategoryForm(undefined, { onSubmit })

    fillName('Fresh Name')
    fireEvent.change(screen.getByPlaceholderText('category-slug'), { target: { value: 'mops' } })
    submit()

    expect(await screen.findByText('This slug is already used by another category')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not flag the category being edited as its own duplicate', async () => {
    const onSubmit = vi.fn<(values: CategoryFormValues) => void>()
    renderCategoryForm(
      { name: 'Cleaning', slug: 'cleaning' },
      { onSubmit, editingCategoryId: 'parent-1' },
    )

    submit()

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('A category with this name already exists')).not.toBeInTheDocument()
  })

  it('submits cleanly when name and slug are unique', async () => {
    const onSubmit = vi.fn<(values: CategoryFormValues) => void>()
    renderCategoryForm(undefined, { onSubmit })

    fillName('Brand New Category')
    submit()

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: 'Brand New Category', slug: 'brand-new-category' })
  })
})
