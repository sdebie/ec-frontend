import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProductEditPage } from '../ProductEditPage'

// --- Mocks ---

const mockUpdateMutate = vi.fn()
const mockNavigate = vi.fn()

vi.mock('@/admin/hooks/products/useProductDetail', () => ({
  useProductDetail: vi.fn(),
}))

vi.mock('@/admin/hooks/products/useUpdateProduct', () => ({
  useUpdateProduct: vi.fn(() => ({
    mutate: mockUpdateMutate,
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
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ productId: 'prod-123' }),
  }
})

vi.mock('@/shared/ui/components', async () => {
  const actual = await vi.importActual('@/shared/ui/components')
  return {
    ...actual,
    toast: { success: vi.fn(), error: vi.fn() },
  }
})

import { useProductDetail } from '@/admin/hooks/products/useProductDetail'

// --- Mock Data ---

const mockProduct = {
  id: 'prod-123',
  name: 'Test Widget',
  slug: 'test-widget',
  shortDescription: 'A test widget',
  description: 'Detailed description',
  status: 'ACTIVE',
  category: { id: 'cat-1', name: 'Electronics' },
  images: ['https://example.com/img1.jpg'],
  variants: [{ id: 'var-1', sku: 'WDG-001', price: '49.99', stock: 10 }],
}

// --- Helpers ---

function renderPage() {
  return render(
    <MemoryRouter>
      <ProductEditPage />
    </MemoryRouter>,
  )
}

// --- Tests ---

describe('ProductEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading state (Requirement 3.3)', () => {
    it('shows PageLoadingSpinner when product is loading', () => {
      vi.mocked(useProductDetail).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      })

      renderPage()

      // PageLoadingSpinner renders a spinning div inside a flex container
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('404 error state (Requirement 3.4)', () => {
    it('renders "Product not found" when API returns 404', () => {
      vi.mocked(useProductDetail).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { response: { status: 404 } } as any,
      })

      renderPage()

      expect(screen.getByText('Not Found')).toBeInTheDocument()
      expect(screen.getByText('Product not found')).toBeInTheDocument()
      expect(screen.getByText('Back to products')).toBeInTheDocument()
    })

    it('renders a link back to /admin/products on 404', () => {
      vi.mocked(useProductDetail).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { response: { status: 404 } } as any,
      })

      renderPage()

      const link = screen.getByText('Back to products')
      expect(link).toHaveAttribute('href', '/admin/products')
    })
  })

  describe('Form populated with product data (Requirement 3.2)', () => {
    it('populates form fields with product data from useProductDetail', async () => {
      vi.mocked(useProductDetail).mockReturnValue({
        data: mockProduct,
        isLoading: false,
        error: null,
      })

      renderPage()

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Product name')
        expect(nameInput).toHaveValue('Test Widget')
      })

      const slugInput = screen.getByPlaceholderText('product-slug')
      expect(slugInput).toHaveValue('test-widget')

      const shortDescInput = screen.getByPlaceholderText('Brief product summary')
      expect(shortDescInput).toHaveValue('A test widget')
    })

    it('renders the page title as "Edit Product"', () => {
      vi.mocked(useProductDetail).mockReturnValue({
        data: mockProduct,
        isLoading: false,
        error: null,
      })

      renderPage()

      expect(screen.getByText('Edit Product')).toBeInTheDocument()
    })
  })

  describe('Successful edit navigates to product list (Requirement 3.5)', () => {
    it('navigates to /admin/products on successful update', async () => {
      vi.mocked(useProductDetail).mockReturnValue({
        data: mockProduct,
        isLoading: false,
        error: null,
      })

      // Capture the onSuccess callback when mutate is called
      mockUpdateMutate.mockImplementation((_values, options) => {
        options?.onSuccess?.()
      })

      renderPage()

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Product name')).toHaveValue('Test Widget')
      })

      // Submit the form by clicking the "Save Changes" button
      const submitButton = screen.getByRole('button', { name: /save changes/i })
      submitButton.click()

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin/products')
      })
    })
  })
})
