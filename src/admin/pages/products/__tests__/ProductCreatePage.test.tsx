import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ProductCreatePage } from '../ProductCreatePage'

const mockCreateMutate = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/admin/hooks/products/useCreateProduct', () => ({
  useCreateProduct: vi.fn(() => ({
    mutate: mockCreateMutate,
    isLoading: false,
  })),
}))

vi.mock('@/admin/hooks/products/useCategories', () => ({
  useCategories: vi.fn(() => ({
    data: [{ id: 'cat-1', name: 'Electronics' }],
    isLoading: false,
  })),
}))

vi.mock('@/admin/hooks/media', () => ({
  useMediaUpload: () => ({ upload: vi.fn().mockResolvedValue('/static/images/test.jpg'), isUploading: false }),
  useMediaDelete: () => ({ remove: vi.fn().mockResolvedValue(undefined), isDeleting: false }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/shared/ui/components', async () => {
  const actual = await vi.importActual('@/shared/ui/components')
  return {
    ...actual,
    toast: { success: vi.fn(), error: vi.fn() },
  }
})

vi.mock('axios', () => ({
  isAxiosError: (err: unknown) => !!(err as any)?.isAxiosError,
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <ProductCreatePage />
    </MemoryRouter>,
  )
}

describe('ProductCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form in create mode with categories', () => {
    renderPage()

    expect(screen.getByText('Add Product')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Product name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('product-slug')).toBeInTheDocument()
    expect(screen.getByText('Create Product')).toBeInTheDocument()
  })

  it('auto-generates slug from name field', async () => {
    const user = userEvent.setup()
    renderPage()

    const nameInput = screen.getByPlaceholderText('Product name')
    await user.type(nameInput, 'My Cool Product')

    await waitFor(() => {
      const slugInput = screen.getByPlaceholderText('product-slug')
      expect(slugInput).toHaveValue('my-cool-product')
    })
  })

  it('stops auto-generating slug after manual slug edit', async () => {
    const user = userEvent.setup()
    renderPage()

    const slugInput = screen.getByPlaceholderText('product-slug')
    const nameInput = screen.getByPlaceholderText('Product name')

    // First type a name to trigger auto-generation
    await user.type(nameInput, 'First')
    await waitFor(() => {
      expect(slugInput).toHaveValue('first')
    })

    // Manually edit the slug
    await user.clear(slugInput)
    await user.type(slugInput, 'custom-slug')

    // Now change the name again
    await user.clear(nameInput)
    await user.type(nameInput, 'Second Name')

    // Slug should stay as the manually typed value, not auto-generate
    await waitFor(() => {
      expect(slugInput).toHaveValue('custom-slug')
    })
  })

  it('navigates to /admin/products on cancel without calling API', async () => {
    const user = userEvent.setup()
    renderPage()

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    expect(mockNavigate).toHaveBeenCalledWith('/admin/products')
    expect(mockCreateMutate).not.toHaveBeenCalled()
  })

  it('displays slug duplicate error on FormItem when API returns slug field error', async () => {
    // Mock mutate to immediately call onError with slug conflict
    mockCreateMutate.mockImplementation((_payload, options) => {
      const error = new Error('Request failed') as any
      error.response = { data: { field: 'slug', message: 'Slug already exists' } }
      error.isAxiosError = true
      options?.onError?.(error)
    })

    const user = userEvent.setup()
    renderPage()

    // Fill required fields for form submission
    const nameInput = screen.getByPlaceholderText('Product name')
    await user.type(nameInput, 'Test Product')

    await waitFor(() => {
      expect(screen.getByPlaceholderText('product-slug')).toHaveValue('test-product')
    })

    // Fill category - click the SearchableSelect trigger button
    const categoryTrigger = screen.getByRole('button', { name: /select a category/i })
    await user.click(categoryTrigger)
    const categoryOption = await screen.findByText('Electronics')
    await user.click(categoryOption)

    // Fill variant SKU and price
    const skuInput = screen.getByPlaceholderText('e.g. PROD-001')
    await user.type(skuInput, 'SKU-001')

    const priceInput = screen.getByPlaceholderText('e.g. 99.99')
    await user.type(priceInput, '19.99')

    // Submit
    const submitButton = screen.getByRole('button', { name: 'Create Product' })
    await user.click(submitButton)

    // The slug error should be displayed
    await waitFor(() => {
      expect(screen.getByText('Slug already exists')).toBeInTheDocument()
    })
  })
})
