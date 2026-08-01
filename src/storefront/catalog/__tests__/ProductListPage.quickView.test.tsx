import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProductListPage } from '../ProductListPage'

// --- Mocks ---

const mockProducts = [
  {
    id: 'p1',
    name: 'Quick View Product',
    slug: 'quick-view-product',
    shortDescription: 'A quick view product',
    images: [{ id: 'img1', imageUrl: 'https://example.com/img.jpg', featured: true, sortOrder: 0 }],
    retailPrice: { price: 100 },
    wholesalePrice: { price: 80 },
    retailSalePrice: null,
    wholesaleSalePrice: null,
    variantId: 'v1',
    sku: 'QV-001',
    inStock: true,
  },
]

vi.mock('../hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [],
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('../hooks/useCategoryTree', () => ({
  useCategoryTree: () => ({
    tree: [],
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('../hooks/useBrands', () => ({
  useBrands: () => ({
    brands: [],
    isLoading: false,
    isError: false,
  }),
}))

vi.mock('../hooks/useProducts', () => ({
  useProducts: () => ({
    products: mockProducts,
    totalElements: 1,
    totalPages: 1,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
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

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/products']}>
        <ProductListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ProductListPage quick view open/close flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('clicking "Quick view" opens the QuickViewModal', async () => {
    const user = userEvent.setup()
    renderPage()

    // The Quick view button should be rendered (since ProductGrid passes onQuickView)
    const quickViewBtn = screen.getByRole('button', { name: 'Quick view' })
    await user.click(quickViewBtn)

    // Modal should now be visible — it has role="dialog" with aria-modal
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    // The modal heading (h2) should carry the product name as the accessible name
    expect(dialog).toHaveAccessibleName('Quick View Product')
  })

  it('closing the modal removes it from the DOM', async () => {
    const user = userEvent.setup()
    renderPage()

    // Open the modal
    const quickViewBtn = screen.getByRole('button', { name: 'Quick view' })
    await user.click(quickViewBtn)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Close via the close button
    const closeBtn = screen.getByLabelText('Close quick view')
    await user.click(closeBtn)

    // Modal should be gone
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('pressing Escape closes the modal', async () => {
    const user = userEvent.setup()
    renderPage()

    // Open the modal
    await user.click(screen.getByRole('button', { name: 'Quick view' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Press Escape
    await user.keyboard('{Escape}')

    // Modal should be gone
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('no QuickViewModal rendered initially', () => {
    renderPage()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
