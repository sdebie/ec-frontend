import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ProductListPage } from '../ProductListPage'

// --- Mocks ---

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

function defaultUseProductsReturn() {
  return {
    products: [],
    totalElements: 0,
    totalPages: 0,
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

describe('ProductListPage — availability filter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseProducts.mockReturnValue(defaultUseProductsReturn())
  })

  describe('URL round-trip', () => {
    it('reads ?available=1 and passes inStockOnly: true to useProducts', () => {
      renderWithRouter(['/products?available=1'])

      expect(mockUseProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          inStockOnly: true,
        }),
      )
    })

    it('omitting ?available passes inStockOnly: false to useProducts', () => {
      renderWithRouter(['/products'])

      expect(mockUseProducts).toHaveBeenCalledWith(
        expect.objectContaining({
          inStockOnly: false,
        }),
      )
    })

    it('checking the "In stock only" checkbox adds inStockOnly: true', async () => {
      const user = userEvent.setup()
      renderWithRouter(['/products'])

      // Expand the Availability filter group
      const availabilityToggle = screen.getByRole('button', { name: /availability/i })
      await user.click(availabilityToggle)

      // Check the checkbox
      const checkbox = screen.getByRole('checkbox', { name: /in stock only/i })
      await user.click(checkbox)

      // useProducts should now be called with inStockOnly: true
      const lastCall = mockUseProducts.mock.calls[mockUseProducts.mock.calls.length - 1][0]
      expect(lastCall.inStockOnly).toBe(true)
    })

    it('unchecking the checkbox sets inStockOnly back to false', async () => {
      const user = userEvent.setup()
      renderWithRouter(['/products?available=1'])

      // The Availability group should auto-expand (isActive)
      const checkbox = screen.getByRole('checkbox', { name: /in stock only/i })
      expect(checkbox).toBeChecked()

      await user.click(checkbox)

      // useProducts should be called with inStockOnly: false
      const lastCall = mockUseProducts.mock.calls[mockUseProducts.mock.calls.length - 1][0]
      expect(lastCall.inStockOnly).toBe(false)
    })
  })

  describe('chip clear', () => {
    it('shows "In stock" chip when ?available=1 is active', () => {
      renderWithRouter(['/products?available=1'])

      expect(screen.getByText('In stock')).toBeInTheDocument()
    })

    it('does not show "In stock" chip when available param is absent', () => {
      renderWithRouter(['/products'])

      expect(screen.queryByText('In stock')).not.toBeInTheDocument()
    })

    it('clicking the "In stock" chip X removes the availability filter', async () => {
      const user = userEvent.setup()
      renderWithRouter(['/products?available=1'])

      const removeButton = screen.getByRole('button', { name: /remove in stock filter/i })
      await user.click(removeButton)

      // After clearing, useProducts should be called with inStockOnly: false
      const lastCall = mockUseProducts.mock.calls[mockUseProducts.mock.calls.length - 1][0]
      expect(lastCall.inStockOnly).toBe(false)

      // Chip should be gone
      expect(screen.queryByText('In stock')).not.toBeInTheDocument()
    })
  })

  describe('query-key inclusion', () => {
    it('useProducts is called with inStockOnly so query key includes it (refetch on change)', async () => {
      const user = userEvent.setup()
      renderWithRouter(['/products'])

      // First call: inStockOnly false
      expect(mockUseProducts).toHaveBeenCalledWith(
        expect.objectContaining({ inStockOnly: false }),
      )

      // Expand Availability group and check
      const availabilityToggle = screen.getByRole('button', { name: /availability/i })
      await user.click(availabilityToggle)

      const checkbox = screen.getByRole('checkbox', { name: /in stock only/i })
      await user.click(checkbox)

      // Second call: inStockOnly true — different query key triggers refetch
      const lastCall = mockUseProducts.mock.calls[mockUseProducts.mock.calls.length - 1][0]
      expect(lastCall.inStockOnly).toBe(true)
    })
  })

  describe('active filter count includes availability', () => {
    it('filter count badge shows 1 when only availability is active', () => {
      renderWithRouter(['/products?available=1'])

      // The toolbar button should show count badge
      expect(
        screen.getByRole('button', { name: /filters \(1 active\)/i }),
      ).toBeInTheDocument()
    })

    it('filter count badge includes availability with other filters', () => {
      renderWithRouter(['/products?available=1&q=shoes'])

      // 2 active: search + availability
      expect(
        screen.getByRole('button', { name: /filters \(2 active\)/i }),
      ).toBeInTheDocument()
    })
  })
})
