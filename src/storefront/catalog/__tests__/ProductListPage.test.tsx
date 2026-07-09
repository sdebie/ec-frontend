import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ProductListPage } from '../ProductListPage'

// --- Mocks ---

const mockCategories = [
  { id: '1', name: 'Electronics', slug: 'electronics' },
]

const mockBrands = [
  { id: '2', name: 'Nike', slug: 'nike' },
]

const mockProducts = [
  {
    id: 'p1',
    name: 'Test Product',
    slug: 'test-product',
    shortDescription: 'A test product',
    images: [{ id: 'img1', imageUrl: 'https://example.com/img.jpg', isFeatured: true, sortOrder: 0 }],
    variants: [
      {
        id: 'v1',
        retailPrice: 100,
        wholesalePrice: 80,
        retailSalePrice: null,
        wholesaleSalePrice: null,
        stockQuantity: 10,
        attributesJson: '{}',
      },
    ],
  },
]

vi.mock('../hooks/useCategories', () => ({
  useCategories: () => ({
    categories: mockCategories,
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('../hooks/useBrands', () => ({
  useBrands: () => ({
    brands: mockBrands,
    isLoading: false,
    isError: false,
  }),
}))

const mockUseProducts = vi.fn()

vi.mock('../hooks/useProducts', () => ({
  useProducts: (params: unknown) => mockUseProducts(params),
}))

vi.mock('@/shared/config/storefrontConfig.context', () => ({
  useStorefrontConfig: () => ({
    currency: 'ZAR',
    locale: 'en-ZA',
  }),
}))

vi.mock('@/shared/auth/customerAuthStore', () => ({
  useCustomerAuthStore: (selector?: (state: unknown) => unknown) => {
    const state = {
      isSignedIn: false,
      token: null,
      customerType: 'RETAIL',
      email: null,
    }
    return selector ? selector(state) : state
  },
}))

// --- Helpers ---

function defaultUseProductsReturn() {
  return {
    products: mockProducts,
    totalElements: 1,
    totalPages: 1,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }
}

function renderWithRouter(initialEntries: string[] = ['/products']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ProductListPage />
    </MemoryRouter>,
  )
}

// --- Tests ---

describe('ProductListPage integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseProducts.mockReturnValue(defaultUseProductsReturn())
  })

  describe('URL param initialisation', () => {
    it('mounts with ?category=electronics&page=2 and displays category name as page title', () => {
      renderWithRouter(['/products?category=electronics&page=2'])

      // Page title should reflect active category
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Electronics')

      // Category filter chip should be visible
      expect(screen.getByText('Category: Electronics')).toBeInTheDocument()

      // useProducts should be called with resolved category ID and page 2
      expect(mockUseProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: '1',
          page: 2,
        }),
      )
    })
  })

  describe('filter change resets page', () => {
    it('changing category sets page to 1', async () => {
      const user = userEvent.setup()
      renderWithRouter(['/products?page=2'])

      // Select a category from the sidebar dropdown
      const categorySelect = screen.getByLabelText('Category')
      await user.selectOptions(categorySelect, 'electronics')

      // After category change, useProducts should be called with page 1
      const lastCall = mockUseProducts.mock.calls[mockUseProducts.mock.calls.length - 1][0]
      expect(lastCall.page).toBe(1)
    })
  })

  describe('Clear all filters', () => {
    it('removes all active filter params when "Clear all filters" is clicked', async () => {
      const user = userEvent.setup()
      renderWithRouter(['/products?category=electronics&brand=nike&search=shoes'])

      // Both filter chips should be visible before clearing
      expect(screen.getByText('Category: Electronics')).toBeInTheDocument()
      expect(screen.getByText('Brand: Nike')).toBeInTheDocument()

      // Click "Clear all filters"
      const clearButton = screen.getByRole('button', { name: /clear all filters/i })
      await user.click(clearButton)

      // After clearing, no filter chips should be visible
      expect(screen.queryByText('Category: Electronics')).not.toBeInTheDocument()
      expect(screen.queryByText('Brand: Nike')).not.toBeInTheDocument()
      expect(screen.queryByText(/Search:/)).not.toBeInTheDocument()
    })
  })

  describe('default state with no params', () => {
    it('shows "All Products" title and no filter chips', () => {
      renderWithRouter(['/products'])

      // Page title should be "All Products"
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('All Products')

      // No filter chips should be visible
      expect(screen.queryByText(/Category:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Brand:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Search:/)).not.toBeInTheDocument()

      // useProducts should be called with default sort and page 1
      expect(mockUseProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: 'name',
          page: 1,
        }),
      )
    })
  })

  describe('?q= search param support', () => {
    it('passes search value to useProducts when ?q= is present', () => {
      renderWithRouter(['/products?q=sneakers'])

      expect(mockUseProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'sneakers',
        }),
      )
    })

    it('does not pass search filter when ?q= is absent', () => {
      renderWithRouter(['/products'])

      expect(mockUseProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          search: '',
        }),
      )
    })

    it('combines ?q= with category and brand filters', () => {
      renderWithRouter(['/products?q=shoes&category=electronics&brand=nike'])

      expect(mockUseProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'shoes',
          categoryId: '1',
          brandId: '2',
        }),
      )
    })

    it('displays search chip when ?q= is present', () => {
      renderWithRouter(['/products?q=sneakers'])

      expect(screen.getByText('Search: sneakers')).toBeInTheDocument()
    })

    it('falls back to ?search= when ?q= is absent', () => {
      renderWithRouter(['/products?search=boots'])

      expect(mockUseProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'boots',
        }),
      )
    })

    it('prefers ?q= over ?search= when both are present', () => {
      renderWithRouter(['/products?q=sneakers&search=boots'])

      expect(mockUseProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'sneakers',
        }),
      )
    })
  })
})
