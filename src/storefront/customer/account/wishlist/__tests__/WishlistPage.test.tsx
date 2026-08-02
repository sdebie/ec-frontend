import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// --- Mocks ---

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
    getState: vi.fn(() => ({
      variantIds: new Set<string>(),
      remove: vi.fn(),
      clear: vi.fn(),
    })),
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
  getDisplayPrice: vi.fn((tiers: { retailPrice: number | null }) => ({
    price: tiers.retailPrice,
    originalPrice: null,
  })),
}))

vi.mock('@/storefront/catalog/utils/productImage', () => ({
  pickFeaturedImage: vi.fn((images: Array<{ imageUrl: string }>) =>
    images.length > 0 ? `/static/images/${images[0].imageUrl}` : null,
  ),
}))

vi.mock('@/storefront/cart/cartStore', () => ({
  useCartStore: Object.assign(vi.fn(() => ({ items: [], itemCount: 0 })), {
    getState: vi.fn(() => ({
      addItem: vi.fn(),
      items: [],
      itemCount: 0,
    })),
  }),
}))

import { useEffectiveWishlist } from '../useEffectiveWishlist'
import { useWishlistHydration } from '../useWishlistHydration'
import { useToggleEffective } from '../useToggleEffective'
import { useLocalWishlistStore } from '../localWishlistStore'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { useCartStore } from '@/storefront/cart/cartStore'
import { WishlistPage } from '../WishlistPage'
import type { HydratedWishlistItem } from '../useWishlistHydration'

const mockedUseEffectiveWishlist = vi.mocked(useEffectiveWishlist)
const mockedUseWishlistHydration = vi.mocked(useWishlistHydration)
const mockedUseToggleEffective = vi.mocked(useToggleEffective)
const mockedUseCustomerAuthStore = vi.mocked(useCustomerAuthStore)

const mockToggle = vi.fn()
const mockClear = vi.fn()
const mockLocalRemove = vi.fn()
const mockAddItem = vi.fn()

function renderPage() {
  return render(
    <MemoryRouter>
      <WishlistPage />
    </MemoryRouter>,
  )
}

/** Factory for a purchasable hydrated item (inStock: true, productActive: true, has price). */
function makePurchasableItem(overrides: Partial<HydratedWishlistItem> = {}): HydratedWishlistItem {
  return {
    variantId: 'v-purchasable',
    variantLabel: '',
    sku: 'SKU-PURCH',
    productId: 'prod-1',
    productName: 'Purchasable Product',
    productSlug: 'purchasable-product',
    imagePath: 'images/p1.png',
    retailPrice: { price: 100 },
    wholesalePrice: { price: 80 },
    retailSalePrice: null,
    wholesaleSalePrice: null,
    inStock: true,
    productActive: true,
    ...overrides,
  }
}

/** Factory for an out-of-stock item (inStock: false, productActive: true). */
function makeOutOfStockItem(overrides: Partial<HydratedWishlistItem> = {}): HydratedWishlistItem {
  return {
    variantId: 'v-oos',
    variantLabel: '',
    sku: 'SKU-OOS',
    productId: 'prod-2',
    productName: 'Out Of Stock Product',
    productSlug: 'out-of-stock-product',
    imagePath: 'images/p2.png',
    retailPrice: { price: 200 },
    wholesalePrice: null,
    retailSalePrice: null,
    wholesaleSalePrice: null,
    inStock: false,
    productActive: true,
    ...overrides,
  }
}

/** Factory for an unavailable item (productActive: false). */
function makeUnavailableItem(overrides: Partial<HydratedWishlistItem> = {}): HydratedWishlistItem {
  return {
    variantId: 'v-unavail',
    variantLabel: '{"Size":"XL"}',
    sku: 'SKU-UNAVAIL',
    productId: 'prod-3',
    productName: 'Unavailable Product',
    productSlug: 'unavailable-product',
    imagePath: null,
    retailPrice: { price: 50 },
    wholesalePrice: null,
    retailSalePrice: null,
    wholesaleSalePrice: null,
    inStock: false,
    productActive: false,
    ...overrides,
  }
}

function setupSignedOut() {
  mockedUseCustomerAuthStore.mockImplementation((selector?: unknown) => {
    const state = { isSignedIn: false, customerType: 'RETAIL' as const }
    return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
  })
}

function setupSignedIn() {
  mockedUseCustomerAuthStore.mockImplementation((selector?: unknown) => {
    const state = { isSignedIn: true, customerType: 'RETAIL' as const }
    return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
  })
}

function setupHydrated(items: HydratedWishlistItem[]) {
  const ids = new Set(items.map((i) => i.variantId))
  mockedUseEffectiveWishlist.mockReturnValue({
    variantIds: ids,
    count: ids.size,
    isLoading: false,
  })
  mockedUseWishlistHydration.mockReturnValue({
    data: items,
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof useWishlistHydration>)
}

describe('WishlistPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()

    mockedUseToggleEffective.mockReturnValue({
      toggle: mockToggle,
      isPending: false,
    })

    setupSignedOut()

    ;(useLocalWishlistStore as unknown as { getState: () => unknown }).getState = vi.fn(() => ({
      variantIds: new Set<string>(),
      remove: mockLocalRemove,
      clear: mockClear,
    }))

    ;(useCartStore as unknown as { getState: () => unknown }).getState = vi.fn(() => ({
      addItem: mockAddItem,
      items: [],
      itemCount: 0,
    }))
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ─── 12. SectionHeading present in ALL states ────────────────────────────

  describe('SectionHeading', () => {
    it('shows "Wishlist" heading in loading state', () => {
      mockedUseEffectiveWishlist.mockReturnValue({ variantIds: new Set(), count: 0, isLoading: true })
      mockedUseWishlistHydration.mockReturnValue({ data: undefined, isLoading: false, isError: false } as unknown as ReturnType<typeof useWishlistHydration>)
      renderPage()
      expect(screen.getByRole('heading', { name: 'Wishlist' })).toBeInTheDocument()
    })

    it('shows "Wishlist" heading in error state', () => {
      mockedUseEffectiveWishlist.mockReturnValue({ variantIds: new Set(), count: 0, isLoading: false })
      mockedUseWishlistHydration.mockReturnValue({ data: undefined, isLoading: false, isError: true } as unknown as ReturnType<typeof useWishlistHydration>)
      renderPage()
      expect(screen.getByRole('heading', { name: 'Wishlist' })).toBeInTheDocument()
    })

    it('shows "Wishlist" heading in empty state', () => {
      setupHydrated([])
      renderPage()
      expect(screen.getByRole('heading', { name: 'Wishlist' })).toBeInTheDocument()
    })

    it('shows "Wishlist" heading in populated state', () => {
      setupHydrated([makePurchasableItem()])
      renderPage()
      expect(screen.getByRole('heading', { name: 'Wishlist' })).toBeInTheDocument()
    })
  })

  // ─── 13. Empty state ─────────────────────────────────────────────────────

  describe('empty state', () => {
    beforeEach(() => setupHydrated([]))

    it('shows heart icon, empty message, and browse link', () => {
      renderPage()
      expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument()
      const browseLink = screen.getByRole('link', { name: /browse products/i })
      expect(browseLink).toHaveAttribute('href', '/products')
    })
  })

  // ─── 14. Error state ─────────────────────────────────────────────────────

  describe('error state', () => {
    it('shows error message', () => {
      mockedUseEffectiveWishlist.mockReturnValue({ variantIds: new Set(), count: 0, isLoading: false })
      mockedUseWishlistHydration.mockReturnValue({ data: undefined, isLoading: false, isError: true } as unknown as ReturnType<typeof useWishlistHydration>)
      renderPage()
      expect(screen.getByText(/couldn.t load your wishlist/i)).toBeInTheDocument()
    })
  })

  // ─── 15. Shell states ────────────────────────────────────────────────────

  describe('shell states', () => {
    it('signed-out wraps in Section (has px-6 rhythm)', () => {
      setupSignedOut()
      setupHydrated([makePurchasableItem()])
      renderPage()
      // Section renders with py-12 px-6 as outermost rhythm
      const heading = screen.getByRole('heading', { name: 'Wishlist' })
      const section = heading.closest('.py-12')
      expect(section).toBeInTheDocument()
      expect(section).toHaveClass('px-6')
    })

    it('signed-in does not wrap in Section (no py-12 rhythm container)', () => {
      setupSignedIn()
      setupHydrated([makePurchasableItem()])
      renderPage()
      const heading = screen.getByRole('heading', { name: 'Wishlist' })
      // The immediate wrapper should be space-y-6 without py-12
      const wrapper = heading.closest('.space-y-6')
      expect(wrapper).toBeInTheDocument()
      expect(wrapper?.closest('.py-12')).toBeNull()
    })
  })

  // ─── 1. Purchasable item renders stepper + add ───────────────────────────

  describe('purchasable item (inStock: true, productActive: true)', () => {
    beforeEach(() => setupHydrated([makePurchasableItem()]))

    it('renders quantity stepper and "Add to cart" button', () => {
      renderPage()
      expect(screen.getByRole('button', { name: /increase quantity/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
    })
  })

  // ─── 2. Out-of-stock item renders "View product" ────────────────────────

  describe('out-of-stock item (inStock: false, productActive: true)', () => {
    beforeEach(() => setupHydrated([makeOutOfStockItem()]))

    it('renders "View product" link (not disabled button)', () => {
      renderPage()
      const viewLink = screen.getByRole('link', { name: /view product/i })
      expect(viewLink).toBeInTheDocument()
      expect(viewLink).toHaveAttribute('href', '/products/out-of-stock-product')
      // No disabled "Out of stock" button. Anchored: the per-item Remove button's
      // accessible name ("Remove Out Of Stock Product from wishlist") contains
      // this phrase, so a loose match would find the wrong element.
      expect(screen.queryByRole('button', { name: /^out of stock$/i })).not.toBeInTheDocument()
      // The wishlist supplies its own per-item Remove (the card's heart is suppressed)
      expect(
        screen.getByRole('button', { name: /remove out of stock product from wishlist/i }),
      ).toBeInTheDocument()
    })

    it('item stays visible (not pruned from display)', () => {
      renderPage()
      expect(screen.getByText('Out Of Stock Product')).toBeInTheDocument()
    })
  })

  // ─── 3. Unavailable item renders notice row ──────────────────────────────

  describe('unavailable item (productActive: false)', () => {
    beforeEach(() => setupHydrated([makeUnavailableItem()]))

    it('renders "This product is no longer available" message', () => {
      renderPage()
      expect(screen.getByText('This product is no longer available')).toBeInTheDocument()
    })

    it('"Remove" asks for confirmation, then calls toggle with (variantId, false)', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.click(
        screen.getByRole('button', { name: /remove unavailable product from wishlist/i }),
      )
      // Dialog first — nothing removed yet
      expect(mockToggle).not.toHaveBeenCalled()
      expect(screen.getByText(/remove from wishlist\?/i)).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /^remove$/i }))
      expect(mockToggle).toHaveBeenCalledWith('v-unavail', false)
    })

    it('has NO /products/ link in the notice row', () => {
      renderPage()
      const message = screen.getByText('This product is no longer available')
      const row = message.closest('.flex.min-h-11')!
      const links = row.querySelectorAll('a[href*="/products/"]')
      expect(links.length).toBe(0)
    })
  })

  // ─── 4. Unknown stock / unknown productActive → purchasable ──────────────

  describe('unknown stock/productActive (null values)', () => {
    it('inStock: null renders as purchasable (stepper + add)', () => {
      setupHydrated([makePurchasableItem({ variantId: 'v-null-stock', inStock: null, productActive: true })])
      renderPage()
      expect(screen.getByRole('button', { name: /increase quantity/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
    })

    it('productActive: null renders as normal card (not notice row)', () => {
      setupHydrated([makePurchasableItem({ variantId: 'v-null-active', productActive: null, inStock: true })])
      renderPage()
      expect(screen.queryByText('This product is no longer available')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
    })
  })

  // ─── 5. Bulk count n excludes unavailable, OOS, and price-less ───────────

  describe('bulk count n', () => {
    it('excludes productActive===false, inStock===false, and price-less items', () => {
      setupHydrated([
        makePurchasableItem({ variantId: 'v1' }),
        makePurchasableItem({ variantId: 'v2' }),
        makeOutOfStockItem({ variantId: 'v-oos' }),
        makeUnavailableItem({ variantId: 'v-unavail' }),
        makePurchasableItem({ variantId: 'v-noprice', retailPrice: null, wholesalePrice: null }),
      ])
      renderPage()
      expect(screen.getByRole('button', { name: /add all to cart \(2\)/i })).toBeInTheDocument()
    })
  })

  // ─── 6. Bulk count k = unavailable set ───────────────────────────────────

  describe('bulk count k (unavailable)', () => {
    it('counts exactly productActive===false items', () => {
      setupHydrated([
        makePurchasableItem({ variantId: 'v1' }),
        makeUnavailableItem({ variantId: 'v-u1' }),
        makeUnavailableItem({ variantId: 'v-u2' }),
      ])
      renderPage()
      expect(screen.getByRole('button', { name: /remove unavailable \(2\)/i })).toBeInTheDocument()
    })

    it('"Remove unavailable" removes exactly those items', async () => {
      const user = userEvent.setup()
      setupHydrated([
        makePurchasableItem({ variantId: 'v1' }),
        makeUnavailableItem({ variantId: 'v-u1' }),
        makeUnavailableItem({ variantId: 'v-u2' }),
      ])
      renderPage()
      const btn = screen.getByRole('button', { name: /remove unavailable \(2\)/i })
      await user.click(btn)
      // Dialog first — nothing removed until confirmed
      expect(mockToggle).not.toHaveBeenCalled()
      await user.click(screen.getByRole('button', { name: /^remove unavailable items$/i }))
      expect(mockToggle).toHaveBeenCalledWith('v-u1', false)
      expect(mockToggle).toHaveBeenCalledWith('v-u2', false)
      expect(mockToggle).toHaveBeenCalledTimes(2)
    })

    it('is not rendered when k=0', () => {
      setupHydrated([makePurchasableItem()])
      renderPage()
      expect(screen.queryByRole('button', { name: /remove unavailable/i })).not.toBeInTheDocument()
    })
  })

  // ─── 7. Bulk add dispatches exactly purchasable set ──────────────────────

  describe('bulk add', () => {
    it('dispatches addItem for exactly the purchasable set with qty 1', async () => {
      const user = userEvent.setup()
      setupHydrated([
        makePurchasableItem({ variantId: 'v1', productName: 'P1', variantLabel: '' }),
        makePurchasableItem({ variantId: 'v2', productName: 'P2', variantLabel: '{"Color":"Blue"}' }),
        makeOutOfStockItem({ variantId: 'v-oos' }),
        makeUnavailableItem({ variantId: 'v-unavail' }),
      ])
      renderPage()

      // Clicking only OPENS the dialog — nothing is written yet
      const addAllBtn = screen.getByRole('button', { name: /add all to cart \(2\)/i })
      await user.click(addAllBtn)
      expect(mockAddItem).not.toHaveBeenCalled()
      expect(mockToggle).not.toHaveBeenCalled()
      expect(screen.getByText(/move all to cart\?/i)).toBeInTheDocument()
      expect(
        screen.getByText(/2 items will be added to your cart and removed from your wishlist/i),
      ).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /^move to cart$/i }))

      expect(mockAddItem).toHaveBeenCalledTimes(2)
      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({ variantId: 'v1', quantity: 1 }),
      )
      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({ variantId: 'v2', quantity: 1 }),
      )
      // …and removes exactly the moved set — never the out-of-stock or
      // unavailable items, which are not purchasable and never reach the cart.
      expect(mockToggle).toHaveBeenCalledTimes(2)
      expect(mockToggle).toHaveBeenCalledWith('v1', false)
      expect(mockToggle).toHaveBeenCalledWith('v2', false)
      expect(mockToggle).not.toHaveBeenCalledWith('v-oos', false)
      expect(mockToggle).not.toHaveBeenCalledWith('v-unavail', false)
    })

    it('never writes a disabled or out-of-stock product to the cart, even via bulk', async () => {
      const user = userEvent.setup()
      setupHydrated([
        makeUnavailableItem({ variantId: 'v-unavail' }),
        makeOutOfStockItem({ variantId: 'v-oos' }),
      ])
      renderPage()

      // n is 0, so the action is disabled and there is nothing to move.
      const addAllBtn = screen.getByRole('button', { name: /add all to cart \(0\)/i })
      expect(addAllBtn).toBeDisabled()
      await user.click(addAllBtn)

      expect(mockAddItem).not.toHaveBeenCalled()
      expect(mockToggle).not.toHaveBeenCalled()
    })

    it('Cancel in the dialog writes nothing', async () => {
      const user = userEvent.setup()
      setupHydrated([makePurchasableItem({ variantId: 'v1' })])
      renderPage()

      await user.click(screen.getByRole('button', { name: /add all to cart \(1\)/i }))
      await user.click(screen.getByRole('button', { name: /^cancel$/i }))

      expect(mockAddItem).not.toHaveBeenCalled()
      expect(mockToggle).not.toHaveBeenCalled()
      expect(screen.queryByText(/move all to cart\?/i)).not.toBeInTheDocument()
    })
  })

  describe('individual add is a move (confirm first)', () => {
    it('asks before moving, then adds to cart and removes from the wishlist', async () => {
      const user = userEvent.setup()
      setupHydrated([makePurchasableItem({ variantId: 'v1', productName: 'P1' })])
      renderPage()

      await user.click(screen.getByRole('button', { name: /^add to cart$/i }))
      expect(mockAddItem).not.toHaveBeenCalled()
      expect(screen.getByText(/move to cart\?/i)).toBeInTheDocument()
      expect(
        screen.getByText(/will be added to your cart and removed from your wishlist/i),
      ).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /^move to cart$/i }))
      expect(mockAddItem).toHaveBeenCalledTimes(1)
      expect(mockAddItem).toHaveBeenCalledWith(expect.objectContaining({ variantId: 'v1' }))
      expect(mockToggle).toHaveBeenCalledWith('v1', false)
    })

    it('Cancel aborts without touching the cart or the wishlist', async () => {
      const user = userEvent.setup()
      setupHydrated([makePurchasableItem({ variantId: 'v1' })])
      renderPage()

      await user.click(screen.getByRole('button', { name: /^add to cart$/i }))
      await user.click(screen.getByRole('button', { name: /^cancel$/i }))

      expect(mockAddItem).not.toHaveBeenCalled()
      expect(mockToggle).not.toHaveBeenCalled()
      expect(screen.getByRole('button', { name: /^add to cart$/i })).toBeInTheDocument()
    })
  })

  // ─── 8. Remove all (signed-out) — two-step, then clear() ────────────────

  describe('Remove all (signed-out)', () => {
    it('requires two clicks then calls clear()', async () => {
      const user = userEvent.setup()
      setupSignedOut()
      setupHydrated([makePurchasableItem(), makeUnavailableItem()])
      renderPage()

      const removeAllBtn = screen.getByRole('button', { name: /^Remove all$/i })
      // Opens the dialog — nothing cleared yet
      await user.click(removeAllBtn)
      expect(mockClear).not.toHaveBeenCalled()
      expect(screen.getByText(/remove all items\?/i)).toBeInTheDocument()

      // Confirm in the dialog executes
      await user.click(screen.getByRole('button', { name: /^remove all items$/i }))
      expect(mockClear).toHaveBeenCalledTimes(1)
    })
  })

  // ─── 9. Remove all (signed-in) — two-step, per-ID toggle ────────────────

  describe('Remove all (signed-in)', () => {
    it('requires two clicks then calls toggle for every item ID (incl. unavailable)', async () => {
      const user = userEvent.setup()
      setupSignedIn()
      setupHydrated([
        makePurchasableItem({ variantId: 'v1' }),
        makeUnavailableItem({ variantId: 'v-u1' }),
      ])
      renderPage()

      const removeAllBtn = screen.getByRole('button', { name: /^Remove all$/i })
      await user.click(removeAllBtn)
      expect(mockToggle).not.toHaveBeenCalled()

      await user.click(screen.getByRole('button', { name: /^remove all items$/i }))
      expect(mockToggle).toHaveBeenCalledWith('v1', false)
      expect(mockToggle).toHaveBeenCalledWith('v-u1', false)
      expect(mockToggle).toHaveBeenCalledTimes(2)
    })
  })

  // ─── 10. Add all disabled when n=0 ──────────────────────────────────────

  describe('Add all disabled when n=0', () => {
    it('button shows "Add all to cart (0)" and is disabled', () => {
      setupHydrated([makeOutOfStockItem(), makeUnavailableItem()])
      renderPage()
      const btn = screen.getByRole('button', { name: /add all to cart \(0\)/i })
      expect(btn).toBeDisabled()
    })
  })

  // ─── 10b. Summary panel ──────────────────────────────────────────────────

  describe('summary panel', () => {
    it('shows the saved count and the ready-to-add count', () => {
      setupHydrated([
        makePurchasableItem({ variantId: 'v1' }),
        makePurchasableItem({ variantId: 'v2' }),
        makeOutOfStockItem({ variantId: 'v-oos' }),
      ])
      renderPage()
      expect(screen.getByText('3 items saved')).toBeInTheDocument()
      expect(screen.getByText('2 of 3')).toBeInTheDocument()
    })

    it('singularises the saved count for one item', () => {
      setupHydrated([makePurchasableItem()])
      renderPage()
      expect(screen.getByText('1 item saved')).toBeInTheDocument()
    })

    it('sums display prices of purchasable items only into the estimated subtotal', () => {
      setupHydrated([
        makePurchasableItem({ variantId: 'v1', retailPrice: { price: 100 } }),
        makePurchasableItem({ variantId: 'v2', retailPrice: { price: 50 } }),
        // Neither of these may contribute: out of stock, and product gone.
        makeOutOfStockItem({ variantId: 'v-oos', retailPrice: { price: 999 } }),
        makeUnavailableItem({ variantId: 'v-unavail', retailPrice: { price: 999 } }),
      ])
      renderPage()
      // Scope to the summary: the excluded items' own cards still show their
      // prices (correct), so the assertion must be about the subtotal alone.
      const summary = screen.getByRole('complementary', { name: /wishlist summary/i })
      expect(within(summary).getByText('R 150.00')).toBeInTheDocument()
      expect(within(summary).queryByText(/999/)).not.toBeInTheDocument()
    })

    it('shows a zero subtotal when nothing is purchasable', () => {
      setupHydrated([makeOutOfStockItem(), makeUnavailableItem()])
      renderPage()
      expect(screen.getByText('R 0.00')).toBeInTheDocument()
    })

    it('labels the subtotal ex. VAT and provisional', () => {
      setupHydrated([makePurchasableItem()])
      renderPage()
      expect(
        screen.getByText(/ex\. vat — final total confirmed at checkout/i),
      ).toBeInTheDocument()
    })

    it('offers a "Continue shopping" link to the catalogue', () => {
      setupHydrated([makePurchasableItem()])
      renderPage()
      const link = screen.getByRole('link', { name: /continue shopping/i })
      expect(link).toHaveAttribute('href', '/products')
    })
  })

  // ─── 11. View toggle ─────────────────────────────────────────────────────

  describe('view toggle', () => {
    it('defaults to grid (data-layout="grid") and switches to row on list click', async () => {
      const user = userEvent.setup()
      setupHydrated([makePurchasableItem()])
      renderPage()

      // Default is grid
      expect(document.querySelector('[data-layout="grid"]')).toBeInTheDocument()
      expect(document.querySelector('[data-layout="row"]')).not.toBeInTheDocument()

      // Click list view
      await user.click(screen.getByRole('button', { name: /list view/i }))
      expect(document.querySelector('[data-layout="row"]')).toBeInTheDocument()
      expect(document.querySelector('[data-layout="grid"]')).not.toBeInTheDocument()
    })

    it('persists preference under wishlist-view-preference localStorage key', async () => {
      const user = userEvent.setup()
      setupHydrated([makePurchasableItem()])
      renderPage()

      await user.click(screen.getByRole('button', { name: /list view/i }))
      expect(localStorage.getItem('wishlist-view-preference')).toBe('list')

      await user.click(screen.getByRole('button', { name: /grid view/i }))
      expect(localStorage.getItem('wishlist-view-preference')).toBe('grid')
    })
  })

  // ─── Prune effect (signed-out only, absence = hard-deleted) ──────────────

  describe('prune effect', () => {
    it('removes local IDs not present in hydrated response when signed out', () => {
      setupSignedOut()
      ;(useLocalWishlistStore as unknown as { getState: () => unknown }).getState = vi.fn(() => ({
        variantIds: new Set(['v1', 'v-missing']),
        remove: mockLocalRemove,
        clear: mockClear,
      }))

      mockedUseEffectiveWishlist.mockReturnValue({
        variantIds: new Set(['v1', 'v-missing']),
        count: 2,
        isLoading: false,
      })
      mockedUseWishlistHydration.mockReturnValue({
        data: [makePurchasableItem({ variantId: 'v1' })],
        isLoading: false,
        isError: false,
      } as unknown as ReturnType<typeof useWishlistHydration>)

      renderPage()

      expect(mockLocalRemove).toHaveBeenCalledWith('v-missing')
      expect(mockLocalRemove).not.toHaveBeenCalledWith('v1')
    })

    it('does not prune when signed in', () => {
      setupSignedIn()
      ;(useLocalWishlistStore as unknown as { getState: () => unknown }).getState = vi.fn(() => ({
        variantIds: new Set(['v1', 'v-missing']),
        remove: mockLocalRemove,
        clear: mockClear,
      }))

      mockedUseEffectiveWishlist.mockReturnValue({
        variantIds: new Set(['v1', 'v-missing']),
        count: 2,
        isLoading: false,
      })
      mockedUseWishlistHydration.mockReturnValue({
        data: [makePurchasableItem({ variantId: 'v1' })],
        isLoading: false,
        isError: false,
      } as unknown as ReturnType<typeof useWishlistHydration>)

      renderPage()

      expect(mockLocalRemove).not.toHaveBeenCalled()
    })
  })
})
