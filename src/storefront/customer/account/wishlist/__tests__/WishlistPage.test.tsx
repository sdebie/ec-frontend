import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// Mock dependencies — NOT the page component itself
vi.mock('../useEffectiveWishlist', () => ({
  useEffectiveWishlist: vi.fn(),
}))

vi.mock('../useWishlistHydration', () => ({
  useWishlistHydration: vi.fn(),
}))

vi.mock('../useToggleEffective', () => ({
  useToggleEffective: vi.fn(),
}))

vi.mock('../localWishlistStore', () => ({
  useLocalWishlistStore: Object.assign(vi.fn(() => new Set<string>()), {
    getState: vi.fn(() => ({ remove: vi.fn() })),
  }),
}))

vi.mock('@/shared/auth/customerAuthStore', () => ({
  useCustomerAuthStore: vi.fn((selector?: (s: unknown) => unknown) => {
    const state = { isSignedIn: false, customerType: 'RETAIL' as const }
    return selector ? selector(state) : state
  }),
}))

vi.mock('@/shared/config/storefrontConfig.context', () => ({
  useStorefrontConfig: vi.fn(() => ({ currency: 'ZAR', locale: 'en-ZA' })),
}))

vi.mock('@/shared/utils/imageUrl', () => ({
  resolveImageUrl: vi.fn((path: string | null) =>
    path ? `/static/images/${path}` : null,
  ),
}))

vi.mock('@/shared/utils/formatAmount', () => ({
  formatAmount: vi.fn((amount: number | null) =>
    amount != null ? `R ${amount.toFixed(2)}` : '-',
  ),
}))

vi.mock('@/storefront/catalog/utils/pricing', () => ({
  getDisplayPrice: vi.fn(() => ({ price: 100, originalPrice: null })),
}))

import { useEffectiveWishlist } from '../useEffectiveWishlist'
import { useWishlistHydration } from '../useWishlistHydration'
import { useToggleEffective } from '../useToggleEffective'
import { useLocalWishlistStore } from '../localWishlistStore'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { WishlistPage } from '../WishlistPage'

const mockedUseEffectiveWishlist = vi.mocked(useEffectiveWishlist)
const mockedUseWishlistHydration = vi.mocked(useWishlistHydration)
const mockedUseToggleEffective = vi.mocked(useToggleEffective)
const mockedUseCustomerAuthStore = vi.mocked(useCustomerAuthStore)

const mockToggle = vi.fn()
const mockLocalRemove = vi.fn()

function renderPage() {
  return render(
    <MemoryRouter>
      <WishlistPage />
    </MemoryRouter>,
  )
}

describe('WishlistPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockedUseToggleEffective.mockReturnValue({
      toggle: mockToggle,
      isPending: false,
    })

    mockedUseCustomerAuthStore.mockImplementation((selector?: unknown) => {
      const state = { isSignedIn: false, customerType: 'RETAIL' as const }
      return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
    })

    ;(useLocalWishlistStore as unknown as { getState: () => { remove: typeof mockLocalRemove } }).getState = vi.fn(() => ({
      remove: mockLocalRemove,
    }))
  })

  describe('loading state (Req 3.9)', () => {
    it('shows skeleton when wishlist is loading', () => {
      mockedUseEffectiveWishlist.mockReturnValue({
        variantIds: new Set<string>(),
        count: 0,
        isLoading: true,
      })
      mockedUseWishlistHydration.mockReturnValue({
        data: undefined,
        isLoading: false,
      } as ReturnType<typeof useWishlistHydration>)

      renderPage()

      expect(screen.getByText('Wishlist')).toBeInTheDocument()
      // Skeleton divs have animate-pulse class
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBe(6)
    })

    it('uses the standard bounded storefront container and responsive product grid', () => {
      mockedUseEffectiveWishlist.mockReturnValue({
        variantIds: new Set<string>(),
        count: 0,
        isLoading: true,
      })
      mockedUseWishlistHydration.mockReturnValue({
        data: undefined,
        isLoading: false,
      } as ReturnType<typeof useWishlistHydration>)

      renderPage()

      // Signed out, the page owns the shared shell: <main> rhythm > width cap > spacing
      const spacing = screen.getByRole('heading', { name: 'Wishlist' }).closest('.space-y-6')
      expect(spacing?.parentElement).toHaveClass('mx-auto', 'max-w-7xl')
      expect(spacing?.parentElement?.parentElement).toHaveClass('py-12', 'px-6', 'sm:px-8')
      expect(document.querySelector('.grid')).toHaveClass(
        'grid-cols-2',
        'md:grid-cols-3',
        'lg:grid-cols-4',
        'xl:grid-cols-5',
      )
    })

    it('shows skeleton when hydration is loading', () => {
      mockedUseEffectiveWishlist.mockReturnValue({
        variantIds: new Set(['v1']),
        count: 1,
        isLoading: false,
      })
      mockedUseWishlistHydration.mockReturnValue({
        data: undefined,
        isLoading: true,
      } as ReturnType<typeof useWishlistHydration>)

      renderPage()

      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBe(6)
    })
  })

  describe('empty state (Req 3.9)', () => {
    it('shows empty state with "Browse products" link when no items', () => {
      mockedUseEffectiveWishlist.mockReturnValue({
        variantIds: new Set<string>(),
        count: 0,
        isLoading: false,
      })
      mockedUseWishlistHydration.mockReturnValue({
        data: [],
        isLoading: false,
      } as unknown as ReturnType<typeof useWishlistHydration>)

      renderPage()

      expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument()
      const browseLink = screen.getByRole('link', { name: /browse products/i })
      expect(browseLink).toBeInTheDocument()
      expect(browseLink).toHaveAttribute('href', '/products')
    })

    it('shows empty state when items is undefined and not loading', () => {
      mockedUseEffectiveWishlist.mockReturnValue({
        variantIds: new Set<string>(),
        count: 0,
        isLoading: false,
      })
      mockedUseWishlistHydration.mockReturnValue({
        data: undefined,
        isLoading: false,
      } as ReturnType<typeof useWishlistHydration>)

      renderPage()

      expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument()
    })
  })

  describe('renders hydrated items (Req 3.5)', () => {
    const hydratedItems = [
      {
        variantId: 'variant-1',
        variantLabel: '{"Size":"Large","Color":"Red"}',
        sku: 'SKU-001',
        productId: 'prod-1',
        productName: 'Test Product One',
        productSlug: 'test-product-one',
        imagePath: 'images/01/product1.png',
        retailPrice: { price: 150 },
        wholesalePrice: { price: 120 },
        retailSalePrice: { price: 100, active: true },
        wholesaleSalePrice: null,
      },
      {
        variantId: 'variant-2',
        variantLabel: '',
        sku: 'SKU-002',
        productId: 'prod-2',
        productName: 'Test Product Two',
        productSlug: 'test-product-two',
        imagePath: null,
        retailPrice: { price: 200 },
        wholesalePrice: null,
        retailSalePrice: null,
        wholesaleSalePrice: null,
      },
    ]

    beforeEach(() => {
      mockedUseEffectiveWishlist.mockReturnValue({
        variantIds: new Set(['variant-1', 'variant-2']),
        count: 2,
        isLoading: false,
      })
      mockedUseWishlistHydration.mockReturnValue({
        data: hydratedItems,
        isLoading: false,
      } as unknown as ReturnType<typeof useWishlistHydration>)
    })

    it('renders product names', () => {
      renderPage()

      expect(screen.getByText('Test Product One')).toBeInTheDocument()
      expect(screen.getByText('Test Product Two')).toBeInTheDocument()
    })

    it('renders product image with resolved URL', () => {
      renderPage()

      const img = screen.getByAltText('Test Product One')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', '/static/images/images/01/product1.png')
    })

    it('renders price for each item', () => {
      renderPage()

      // formatAmount mock returns "R X.XX"
      expect(screen.getAllByText(/R \d+\.\d{2}/).length).toBeGreaterThan(0)
    })

    it('renders variant label parsed from JSON attributes', () => {
      renderPage()

      expect(screen.getByText('Size: Large, Color: Red')).toBeInTheDocument()
    })

    it('anchors the variant label and price together at the bottom of equally sized cards', () => {
      renderPage()

      expect(screen.getByText('Test Product One').parentElement).toHaveClass(
        'flex',
        'flex-1',
        'flex-col',
      )
      expect(screen.getByText('Size: Large, Color: Red').parentElement).toHaveClass(
        'mt-auto',
        'pt-2',
      )
      expect(screen.getAllByText('R 100.00')[0].parentElement).toHaveClass('mt-2')
    })

    it('product name links to correct product detail page (/products/{slug})', () => {
      renderPage()

      // Each item has two links (image wrapper + name text) — both point to the same slug
      const product1Links = screen.getAllByRole('link', { name: /Test Product One/i })
      expect(product1Links.length).toBeGreaterThanOrEqual(1)
      expect(product1Links[0]).toHaveAttribute('href', '/products/test-product-one')

      const product2Links = screen.getAllByRole('link', { name: /Test Product Two/i })
      expect(product2Links.length).toBeGreaterThanOrEqual(1)
      expect(product2Links[0]).toHaveAttribute('href', '/products/test-product-two')
    })
  })

  describe('remove button (Req 3.6)', () => {
    beforeEach(() => {
      mockedUseEffectiveWishlist.mockReturnValue({
        variantIds: new Set(['variant-1']),
        count: 1,
        isLoading: false,
      })
      mockedUseWishlistHydration.mockReturnValue({
        data: [
          {
            variantId: 'variant-1',
            variantLabel: '',
            sku: 'SKU-001',
            productId: 'prod-1',
            productName: 'Remove Me Product',
            productSlug: 'remove-me-product',
            imagePath: null,
            retailPrice: { price: 50 },
            wholesalePrice: null,
            retailSalePrice: null,
            wholesaleSalePrice: null,
          },
        ],
        isLoading: false,
      } as unknown as ReturnType<typeof useWishlistHydration>)
    })

    it('calls toggle with (variantId, false) when remove button clicked', async () => {
      const user = userEvent.setup()
      renderPage()

      const removeBtn = screen.getByRole('button', {
        name: /remove Remove Me Product from wishlist/i,
      })
      await user.click(removeBtn)

      expect(mockToggle).toHaveBeenCalledWith('variant-1', false)
    })
  })

  describe('prunes local IDs that fail hydration (Req 3.7)', () => {
    it('removes local IDs not present in hydrated response when signed out', () => {
      mockedUseCustomerAuthStore.mockImplementation((selector?: unknown) => {
        const state = { isSignedIn: false, customerType: 'RETAIL' as const }
        return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
      })

      mockedUseEffectiveWishlist.mockReturnValue({
        variantIds: new Set(['variant-1', 'variant-missing']),
        count: 2,
        isLoading: false,
      })
      mockedUseWishlistHydration.mockReturnValue({
        data: [
          {
            variantId: 'variant-1',
            variantLabel: '',
            sku: 'SKU-001',
            productId: 'prod-1',
            productName: 'Product One',
            productSlug: 'product-one',
            imagePath: null,
            retailPrice: { price: 50 },
            wholesalePrice: null,
            retailSalePrice: null,
            wholesaleSalePrice: null,
          },
        ],
        isLoading: false,
      } as unknown as ReturnType<typeof useWishlistHydration>)

      renderPage()

      // The useEffect should call localStore.remove for 'variant-missing'
      expect(mockLocalRemove).toHaveBeenCalledWith('variant-missing')
      expect(mockLocalRemove).not.toHaveBeenCalledWith('variant-1')
    })

    it('does not prune when signed in', () => {
      mockedUseCustomerAuthStore.mockImplementation((selector?: unknown) => {
        const state = { isSignedIn: true, customerType: 'RETAIL' as const }
        return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
      })

      mockedUseEffectiveWishlist.mockReturnValue({
        variantIds: new Set(['variant-1', 'variant-missing']),
        count: 2,
        isLoading: false,
      })
      mockedUseWishlistHydration.mockReturnValue({
        data: [
          {
            variantId: 'variant-1',
            variantLabel: '',
            sku: 'SKU-001',
            productId: 'prod-1',
            productName: 'Product One',
            productSlug: 'product-one',
            imagePath: null,
            retailPrice: { price: 50 },
            wholesalePrice: null,
            retailSalePrice: null,
            wholesaleSalePrice: null,
          },
        ],
        isLoading: false,
      } as unknown as ReturnType<typeof useWishlistHydration>)

      renderPage()

      expect(mockLocalRemove).not.toHaveBeenCalled()
    })
  })
})
