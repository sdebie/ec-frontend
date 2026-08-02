import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CardActions } from '../CardActions'
import { useCartStore } from '@/storefront/cart/store/cartStore'

describe('CardActions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useCartStore.setState({ items: [], itemCount: 0 })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function renderCardActions(props: Partial<Parameters<typeof CardActions>[0]> = {}) {
    const defaultProps = {
      variantId: 'variant-1',
      productName: 'Test Product',
      productSlug: 'test-product',
      inStock: true,
      hasPrice: true,
      ...props,
    }
    return render(
      <MemoryRouter>
        <CardActions {...defaultProps} />
      </MemoryRouter>,
    )
  }

  describe('branch matrix', () => {
    it('renders stepper + Add to cart for SIMPLE in-stock product with price', () => {
      renderCardActions({ variantId: 'v1', inStock: true, hasPrice: true })

      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /increase quantity/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeInTheDocument()
    })

    it('renders disabled Out of stock button for SIMPLE out-of-stock product', () => {
      renderCardActions({ variantId: 'v1', inStock: false, hasPrice: true })

      const button = screen.getByRole('button', { name: /out of stock/i })
      expect(button).toBeDisabled()
      expect(screen.queryByRole('button', { name: /increase quantity/i })).not.toBeInTheDocument()
    })

    it('renders Select options link for VARIABLE product (variantId null)', () => {
      renderCardActions({ variantId: null, hasPrice: true })

      const link = screen.getByRole('link', { name: /select options/i })
      expect(link).toHaveAttribute('href', '/products/test-product')
      expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument()
    })

    it('renders View product link when hasPrice is false', () => {
      renderCardActions({ variantId: 'v1', hasPrice: false })

      const link = screen.getByRole('link', { name: /view product/i })
      expect(link).toHaveAttribute('href', '/products/test-product')
      expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument()
    })
  })

  describe('onRequestAdd (delegated add)', () => {
    it('writes to the cart directly when the prop is absent — catalogue behaviour', () => {
      renderCardActions({
        variantId: 'variant-123',
        productName: 'Classic Tee',
        productSlug: 'classic-tee',
        inStock: true,
        hasPrice: true,
      })

      fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))

      expect(useCartStore.getState().items).toHaveLength(1)
    })

    it('delegates and writes NOTHING when onRequestAdd is provided', () => {
      const onRequestAdd = vi.fn()
      renderCardActions({
        variantId: 'variant-123',
        productName: 'Classic Tee',
        productSlug: 'classic-tee',
        inStock: true,
        hasPrice: true,
        onRequestAdd,
      })

      fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))

      // The consumer owns the flow — the cart must be untouched here.
      expect(useCartStore.getState().items).toHaveLength(0)
      expect(onRequestAdd).toHaveBeenCalledTimes(1)
      expect(onRequestAdd).toHaveBeenCalledWith(1)
    })

    it('passes the chosen stepper quantity to onRequestAdd', () => {
      const onRequestAdd = vi.fn()
      renderCardActions({
        variantId: 'variant-123',
        productName: 'Classic Tee',
        productSlug: 'classic-tee',
        inStock: true,
        hasPrice: true,
        onRequestAdd,
      })

      fireEvent.click(screen.getByRole('button', { name: /increase quantity/i }))
      fireEvent.click(screen.getByRole('button', { name: /increase quantity/i }))
      fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))

      expect(onRequestAdd).toHaveBeenCalledWith(3)
      expect(useCartStore.getState().items).toHaveLength(0)
    })
  })

  describe('addItem payload', () => {
    it('calls addItem with correct payload shape on add to cart', () => {
      renderCardActions({
        variantId: 'variant-123',
        productName: 'Classic Tee',
        productSlug: 'classic-tee',
        inStock: true,
        hasPrice: true,
      })

      fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0]).toEqual({
        variantId: 'variant-123',
        productName: 'Classic Tee',
        variantLabel: '',
        quantity: 1,
      })
    })

    it('uses the current stepper quantity in the addItem payload', () => {
      renderCardActions({
        variantId: 'variant-123',
        productName: 'Classic Tee',
        productSlug: 'classic-tee',
        inStock: true,
        hasPrice: true,
      })

      // Increment quantity to 3
      fireEvent.click(screen.getByRole('button', { name: /increase quantity/i }))
      fireEvent.click(screen.getByRole('button', { name: /increase quantity/i }))
      fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))

      const { items } = useCartStore.getState()
      expect(items[0].quantity).toBe(3)
    })
  })

  describe('transient confirmation state (fake timers)', () => {
    it('shows "Added ✓" after adding and reverts after 4 seconds', () => {
      renderCardActions({ variantId: 'v1', inStock: true, hasPrice: true })

      const button = screen.getByRole('button', { name: /add to cart/i })
      fireEvent.click(button)

      // Immediately after click, shows confirmation
      expect(screen.getByRole('button', { name: /added/i })).toBeInTheDocument()

      // After 3999ms, still showing confirmation
      act(() => {
        vi.advanceTimersByTime(3999)
      })
      expect(screen.getByRole('button', { name: /added/i })).toBeInTheDocument()

      // After 4000ms, reverts to "Add to cart"
      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
    })

    it('resets stepper to 1 after adding', () => {
      renderCardActions({ variantId: 'v1', inStock: true, hasPrice: true })

      // Increment to 3
      fireEvent.click(screen.getByRole('button', { name: /increase quantity/i }))
      fireEvent.click(screen.getByRole('button', { name: /increase quantity/i }))
      expect(screen.getByText('3')).toBeInTheDocument()

      // Add to cart
      fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))

      // Stepper resets to 1
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('stepper min clamp', () => {
    it('cannot decrement below 1', () => {
      renderCardActions({ variantId: 'v1', inStock: true, hasPrice: true })

      const decrementButton = screen.getByRole('button', { name: /decrease quantity/i })
      expect(decrementButton).toBeDisabled()

      // Quantity should stay at 1
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('decrement is disabled at quantity 1 and enabled at quantity 2', () => {
      renderCardActions({ variantId: 'v1', inStock: true, hasPrice: true })

      const decrementButton = screen.getByRole('button', { name: /decrease quantity/i })
      expect(decrementButton).toBeDisabled()

      // Increment to 2
      fireEvent.click(screen.getByRole('button', { name: /increase quantity/i }))
      expect(decrementButton).not.toBeDisabled()

      // Decrement back to 1
      fireEvent.click(decrementButton)
      expect(decrementButton).toBeDisabled()
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('unknown stock (inStock null — consumer did not select the field)', () => {
    it('renders the purchasable branch, never the Out of stock button', () => {
      // Strict inStock === false gate: null means unknown, and unknown must not
      // block purchase (stock is import-derived; checkout does not enforce it).
      render(
        <MemoryRouter>
          <CardActions
            variantId="v-1"
            productName="Unknown Stock Product"
            productSlug="unknown-stock-product"
            inStock={null}
            hasPrice={true}
          />
        </MemoryRouter>,
      )

      expect(screen.getByRole('button', { name: 'Add to cart' })).toBeInTheDocument()
      expect(screen.queryByText('Out of stock')).not.toBeInTheDocument()
    })
  })

  describe('outOfStockAction prop', () => {
    it('renders disabled "Out of stock" button when outOfStockAction is omitted (default disabled)', () => {
      renderCardActions({ variantId: 'v1', inStock: false, hasPrice: true })

      const button = screen.getByRole('button', { name: /out of stock/i })
      expect(button).toBeDisabled()
      expect(button).toHaveClass('cursor-not-allowed')
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('renders disabled "Out of stock" button when outOfStockAction is explicitly "disabled"', () => {
      renderCardActions({ variantId: 'v1', inStock: false, hasPrice: true, outOfStockAction: 'disabled' })

      const button = screen.getByRole('button', { name: /out of stock/i })
      expect(button).toBeDisabled()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('renders bordered "View product" link to PDP when outOfStockAction is "viewProduct" and inStock is false', () => {
      renderCardActions({
        variantId: 'v1',
        inStock: false,
        hasPrice: true,
        productSlug: 'test-product',
        outOfStockAction: 'viewProduct',
      })

      const link = screen.getByRole('link', { name: /view product/i })
      expect(link).toHaveAttribute('href', '/products/test-product')
      // Same bordered style as the "Select options" branch
      expect(link).toHaveClass('border', 'w-full')
      expect(screen.queryByRole('button', { name: /out of stock/i })).not.toBeInTheDocument()
    })

    it('inStock null renders stepper+add when outOfStockAction is "disabled"', () => {
      renderCardActions({ variantId: 'v1', inStock: null, hasPrice: true, outOfStockAction: 'disabled' })

      expect(screen.getByRole('button', { name: 'Add to cart' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /increase quantity/i })).toBeInTheDocument()
      expect(screen.queryByText('Out of stock')).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('inStock null renders stepper+add when outOfStockAction is "viewProduct"', () => {
      renderCardActions({ variantId: 'v1', inStock: null, hasPrice: true, outOfStockAction: 'viewProduct' })

      expect(screen.getByRole('button', { name: 'Add to cart' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /increase quantity/i })).toBeInTheDocument()
      expect(screen.queryByText('Out of stock')).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })
  })

  describe('variantLabel prop forwarding', () => {
    it('forwards provided variantLabel to the cart store addItem call', () => {
      renderCardActions({
        variantId: 'variant-abc',
        productName: 'Labeled Product',
        productSlug: 'labeled-product',
        inStock: true,
        hasPrice: true,
        variantLabel: 'Size: XL, Colour: Red',
      })

      fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].variantLabel).toBe('Size: XL, Colour: Red')
    })

    it('defaults variantLabel to empty string when omitted (existing behaviour)', () => {
      renderCardActions({
        variantId: 'variant-def',
        productName: 'No Label Product',
        productSlug: 'no-label-product',
        inStock: true,
        hasPrice: true,
      })

      fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].variantLabel).toBe('')
    })
  })
})
