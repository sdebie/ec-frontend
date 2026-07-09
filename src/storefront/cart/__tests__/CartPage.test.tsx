import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CartPage } from '../CartPage'
import { useCartStore } from '../cartStore'
import type { CartVariant } from '../hooks/useCartVariants'

vi.mock('../hooks/useCartVariants', () => ({
  useCartVariants: vi.fn(),
}))

vi.mock('../hooks/useCheckout', () => ({
  useCheckout: vi.fn(),
}))

vi.mock('@/shared/config/storefrontConfig.context', () => ({
  useStorefrontConfig: () => ({ currency: 'ZAR', locale: 'en-ZA' }),
}))

import { useCartVariants } from '../hooks/useCartVariants'
import { useCheckout } from '../hooks/useCheckout'

const mockedUseCartVariants = vi.mocked(useCartVariants)
const mockedUseCheckout = vi.mocked(useCheckout)

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function renderCartPage() {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CartPage />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('CartPage', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], itemCount: 0 })
    mockedUseCartVariants.mockReturnValue({
      variants: new Map(),
      unavailableIds: [],
      isLoading: false,
      isError: false,
    })
    mockedUseCheckout.mockReturnValue({
      checkout: vi.fn(),
      isLoading: false,
      unavailableVariantIds: [],
      error: null,
    })
  })

  describe('empty state', () => {
    it('renders "Your cart is empty" message and "Continue shopping" link to /products', () => {
      renderCartPage()

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
      const link = screen.getByRole('link', { name: /continue shopping/i })
      expect(link).toHaveAttribute('href', '/products')
    })

    it('does not render line item rows or checkout button when cart is empty', () => {
      renderCartPage()

      expect(screen.queryByText('Proceed to checkout')).not.toBeInTheDocument()
      expect(screen.queryByText('Estimated subtotal')).not.toBeInTheDocument()
    })
  })

  describe('line item display', () => {
    beforeEach(() => {
      useCartStore.setState({
        items: [
          { variantId: 'v1', productName: 'Classic Tee', variantLabel: 'Red / M', quantity: 2 },
          { variantId: 'v2', productName: 'Denim Jeans', variantLabel: 'Blue / 32', quantity: 1 },
        ],
        itemCount: 3,
      })

      const variants = new Map<string, CartVariant>([
        ['v1', { id: 'v1', stockQuantity: 10, status: 'ACTIVE', displayPrice: 199.99, product: { name: 'Classic Tee' } }],
        ['v2', { id: 'v2', stockQuantity: 5, status: 'ACTIVE', displayPrice: 499.00, product: { name: 'Denim Jeans' } }],
      ])

      mockedUseCartVariants.mockReturnValue({
        variants,
        unavailableIds: [],
        isLoading: false,
        isError: false,
      })
    })

    it('renders product names and variant labels', () => {
      renderCartPage()

      expect(screen.getByText('Classic Tee')).toBeInTheDocument()
      expect(screen.getByText('Red / M')).toBeInTheDocument()
      expect(screen.getByText('Denim Jeans')).toBeInTheDocument()
      expect(screen.getByText('Blue / 32')).toBeInTheDocument()
    })

    it('renders quantity values for each item', () => {
      renderCartPage()

      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('renders the cart heading', () => {
      renderCartPage()

      expect(screen.getByText('Your Cart')).toBeInTheDocument()
    })
  })

  describe('quantity stepper interaction', () => {
    beforeEach(() => {
      useCartStore.setState({
        items: [
          { variantId: 'v1', productName: 'Classic Tee', variantLabel: 'Red / M', quantity: 2 },
        ],
        itemCount: 2,
      })

      const variants = new Map<string, CartVariant>([
        ['v1', { id: 'v1', stockQuantity: 10, status: 'ACTIVE', displayPrice: 199.99, product: { name: 'Classic Tee' } }],
      ])

      mockedUseCartVariants.mockReturnValue({
        variants,
        unavailableIds: [],
        isLoading: false,
        isError: false,
      })
    })

    it('calls updateQty with incremented quantity when increment is clicked', () => {
      renderCartPage()

      const incrementButton = screen.getByRole('button', { name: /increase quantity/i })
      fireEvent.click(incrementButton)

      const { items } = useCartStore.getState()
      expect(items[0].quantity).toBe(3)
    })

    it('calls updateQty with decremented quantity when decrement is clicked', () => {
      renderCartPage()

      const decrementButton = screen.getByRole('button', { name: /decrease quantity/i })
      fireEvent.click(decrementButton)

      const { items } = useCartStore.getState()
      expect(items[0].quantity).toBe(1)
    })
  })

  describe('remove button', () => {
    beforeEach(() => {
      useCartStore.setState({
        items: [
          { variantId: 'v1', productName: 'Classic Tee', variantLabel: 'Red / M', quantity: 2 },
        ],
        itemCount: 2,
      })

      const variants = new Map<string, CartVariant>([
        ['v1', { id: 'v1', stockQuantity: 10, status: 'ACTIVE', displayPrice: 199.99, product: { name: 'Classic Tee' } }],
      ])

      mockedUseCartVariants.mockReturnValue({
        variants,
        unavailableIds: [],
        isLoading: false,
        isError: false,
      })
    })

    it('removes item from store when remove button is clicked', () => {
      renderCartPage()

      const removeButton = screen.getByRole('button', { name: /remove classic tee from cart/i })
      fireEvent.click(removeButton)

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(0)
    })
  })

  describe('loading skeleton for price columns', () => {
    beforeEach(() => {
      useCartStore.setState({
        items: [
          { variantId: 'v1', productName: 'Classic Tee', variantLabel: 'Red / M', quantity: 2 },
        ],
        itemCount: 2,
      })

      mockedUseCartVariants.mockReturnValue({
        variants: new Map(),
        unavailableIds: [],
        isLoading: true,
        isError: false,
      })
    })

    it('renders skeleton placeholders when prices are loading', () => {
      const { container } = renderCartPage()

      // Skeleton elements have animate-pulse class
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('still shows product name and variant label during loading', () => {
      renderCartPage()

      expect(screen.getByText('Classic Tee')).toBeInTheDocument()
      expect(screen.getByText('Red / M')).toBeInTheDocument()
    })
  })

  describe('unavailable variant warning', () => {
    beforeEach(() => {
      useCartStore.setState({
        items: [
          { variantId: 'v1', productName: 'Classic Tee', variantLabel: 'Red / M', quantity: 2 },
          { variantId: 'v2', productName: 'Vintage Jacket', variantLabel: 'Black / L', quantity: 1 },
        ],
        itemCount: 3,
      })

      const variants = new Map<string, CartVariant>([
        ['v2', { id: 'v2', stockQuantity: 5, status: 'ACTIVE', displayPrice: 899.00, product: { name: 'Vintage Jacket' } }],
      ])

      mockedUseCartVariants.mockReturnValue({
        variants,
        unavailableIds: ['v1'],
        isLoading: false,
        isError: false,
      })
    })

    it('shows "No longer available" warning for unavailable variant', () => {
      renderCartPage()

      expect(screen.getByText('No longer available')).toBeInTheDocument()
    })

    it('disables the "Proceed to checkout" button when unavailable items exist', () => {
      renderCartPage()

      const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i })
      expect(checkoutButton).toBeDisabled()
    })
  })
})
