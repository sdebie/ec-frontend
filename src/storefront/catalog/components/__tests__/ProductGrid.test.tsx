import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProductGrid } from '../ProductGrid'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/config/storefrontConfig.context', () => ({
  useStorefrontConfig: () => ({ currency: 'ZAR', locale: 'en-ZA' }),
}))

vi.mock('@/shared/auth/customerAuthStore', () => ({
  useCustomerAuthStore: (selector?: (state: { customerType: string; isSignedIn: boolean }) => unknown) => {
    const state = { customerType: 'RETAIL', isSignedIn: false }
    return selector ? selector(state) : state
  },
}))

vi.mock('@/storefront/customer/account/wishlist/components/WishlistButton', () => ({
    WishlistPromptLink: ({productUrl, className}: {productUrl: string; className?: string}) => (
        <a href={productUrl} aria-label="Choose options to save to wishlist" className={className}>♡</a>
    ),
  WishlistButton: ({ variantId, className }: { variantId: string; className?: string }) => (
    <button type="button" aria-label={`Wishlist ${variantId}`} className={className}>♡</button>
  ),
}))

const products = [
  {
    id: '1',
    name: 'Product A',
    slug: 'product-a',
    shortDescription: 'Description A',
    images: [{ imageUrl: 'https://example.com/a.jpg', featured: true, sortOrder: 1 }],
    retailPrice: { price: 100 },
    wholesalePrice: null,
    retailSalePrice: null,
    wholesaleSalePrice: null,
    variantId: 'v1',
    sku: 'SKU-A',
    inStock: true,
  },
  {
    id: '2',
    name: 'Product B',
    slug: 'product-b',
    shortDescription: 'Description B',
    images: [{ imageUrl: 'https://example.com/b.jpg', featured: true, sortOrder: 1 }],
    retailPrice: { price: 200 },
    wholesalePrice: null,
    retailSalePrice: null,
    wholesaleSalePrice: null,
    variantId: 'v2',
    sku: 'SKU-B',
    inStock: false,
  },
]

function renderGrid(view: 'grid' | 'list' = 'grid') {
  return render(
    <MemoryRouter>
      <ProductGrid products={products} isLoading={false} view={view} />
    </MemoryRouter>,
  )
}

describe('ProductGrid', () => {
  it('renders in grid mode with multi-column class by default', () => {
    const { container } = renderGrid('grid')
    const grid = container.querySelector('[data-view="grid"]')
    expect(grid).toBeInTheDocument()
    expect(grid?.className).toContain('grid-cols-2')
  })

  it('renders in list mode with single-column layout', () => {
    const { container } = renderGrid('list')
    const list = container.querySelector('[data-view="list"]')
    expect(list).toBeInTheDocument()
    expect(list?.className).toContain('flex-col')
    expect(list?.className).not.toContain('grid-cols')
  })

  it('renders ProductCard with layout="row" in list mode', () => {
    const { container } = renderGrid('list')
    const rowCards = container.querySelectorAll('[data-layout="row"]')
    expect(rowCards.length).toBe(2)
  })

  it('renders ProductCard with layout="grid" in grid mode', () => {
    const { container } = renderGrid('grid')
    const gridCards = container.querySelectorAll('[data-layout="grid"]')
    expect(gridCards.length).toBe(2)
  })

  it('renders the same product set in both modes', () => {
    const { unmount } = renderGrid('grid')
    const gridNames = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    unmount()

    renderGrid('list')
    const listNames = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)

    expect(gridNames).toEqual(listNames)
    expect(gridNames).toEqual(['Product A', 'Product B'])
  })
})
