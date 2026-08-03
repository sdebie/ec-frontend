import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
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
    it('renders Add to cart and NO quantity control for SIMPLE in-stock product with price', () => {
      renderCardActions({ variantId: 'v1', inStock: true, hasPrice: true })

      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
      // The card has no quantity affordance (owner directive 2026-08-03) —
      // quantity is edited in the cart, the one place it can be reconciled
      // against stock and price.
      expect(screen.queryByRole('button', { name: /increase quantity/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /decrease quantity/i })).not.toBeInTheDocument()
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

    it('gives Select options the same accent fill as Add to cart', () => {
      renderCardActions({ variantId: null, hasPrice: true })
      const select = screen.getByRole('link', { name: /select options/i })

      cleanup()
      renderCardActions({ variantId: 'v1', inStock: true, hasPrice: true })
      const add = screen.getByRole('button', { name: /add to cart/i })

      // Both are the forward step for their product shape, so they read the
      // same; an outlined Select beside a filled Add looked disabled.
      expect(select.className).toContain('bg-(--sf-accent)')
      expect(select.className).toContain('text-(--sf-accent-text)')
      expect(add.className).toContain('bg-(--sf-accent)')
      expect(select.className).not.toContain('border-(--sf-border)')
    })

    it('keeps the unavailable states visually distinct from the primary action', () => {
      renderCardActions({ variantId: 'v1', inStock: false, hasPrice: true })
      expect(screen.getByRole('button', { name: /out of stock/i }).className)
        .not.toContain('bg-(--sf-accent)')

      cleanup()
      renderCardActions({ variantId: 'v1', inStock: false, hasPrice: true, outOfStockAction: 'viewProduct' })
      expect(screen.getByRole('link', { name: /view product/i }).className)
        .not.toContain('bg-(--sf-accent)')
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

    it('always delegates a quantity of exactly 1 — the card has no quantity control', () => {
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
      fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))

      expect(onRequestAdd).toHaveBeenCalledTimes(2)
      expect(onRequestAdd).toHaveBeenNthCalledWith(1, 1)
      expect(onRequestAdd).toHaveBeenNthCalledWith(2, 1)
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

    it('adds one per click — repeated clicks accumulate in the cart, not on the card', () => {
      renderCardActions({
        variantId: 'variant-123',
        productName: 'Classic Tee',
        productSlug: 'classic-tee',
        inStock: true,
        hasPrice: true,
      })

      fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
      fireEvent.click(screen.getByRole('button', { name: /added/i }))

      const { items } = useCartStore.getState()
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(2)
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

  })

  describe('no quantity control anywhere in the card', () => {
    it('renders no stepper in any branch', () => {
      const branches = [
        { variantId: 'v1', inStock: true, hasPrice: true },
        { variantId: 'v1', inStock: false, hasPrice: true },
        { variantId: null, hasPrice: true },
        { variantId: 'v1', hasPrice: false },
        { variantId: 'v1', inStock: null, hasPrice: true },
      ]

      for (const branch of branches) {
        renderCardActions(branch)
        expect(screen.queryByRole('button', { name: /increase quantity/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /decrease quantity/i })).not.toBeInTheDocument()
        cleanup()
      }
    })
  })

  // The stepper's own min-clamp tests moved out with the stepper: quantity is
  // now only editable in the cart, and QuantityStepper/CartPage own those cases.

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

    it('inStock null renders Add to cart when outOfStockAction is "disabled"', () => {
      renderCardActions({ variantId: 'v1', inStock: null, hasPrice: true, outOfStockAction: 'disabled' })

      expect(screen.getByRole('button', { name: 'Add to cart' })).toBeInTheDocument()
      expect(screen.queryByText('Out of stock')).not.toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('inStock null renders Add to cart when outOfStockAction is "viewProduct"', () => {
      renderCardActions({ variantId: 'v1', inStock: null, hasPrice: true, outOfStockAction: 'viewProduct' })

      expect(screen.getByRole('button', { name: 'Add to cart' })).toBeInTheDocument()
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

  describe('layout prop', () => {
    it('defaults to stack: the component paints its own box', () => {
      const { container } = renderCardActions({ variantId: 'v1', inStock: true, hasPrice: true })

      const root = container.firstElementChild as HTMLElement
      // A single control now, so no flex column is needed to space two of them.
      expect(root.className).toBe('mt-3')
    })

    it('bar mode drops the box below sm so the control joins the parent layout', () => {
      const { container } = renderCardActions({
        variantId: 'v1',
        inStock: true,
        hasPrice: true,
        layout: 'bar',
      })

      const root = container.firstElementChild as HTMLElement
      // display:contents below sm; the original box returns from sm.
      expect(root.className).toBe('contents sm:mt-3 sm:block')
      expect(root.querySelector('button')).toHaveTextContent('Add to cart')
    })

    it('every branch renders exactly one control, so mixed decks stay aligned', () => {
      // This is what the removed QuantityStepperPlaceholder used to guarantee:
      // a purchasable card and a variable one must be the same height.
      const branches = [
        { variantId: 'v1', inStock: true, hasPrice: true },
        { variantId: 'v1', inStock: false, hasPrice: true },
        { variantId: null, hasPrice: true },
      ]

      for (const branch of branches) {
        const { container } = renderCardActions(branch)
        const root = container.firstElementChild as HTMLElement
        expect(root.children).toHaveLength(1)
        cleanup()
      }
    })

    it('bar mode also applies to the single-control branches', () => {
      const { container } = renderCardActions({
        variantId: 'v1',
        inStock: false,
        hasPrice: true,
        layout: 'bar',
      })

      const root = container.firstElementChild as HTMLElement
      expect(root.className).toBe('contents sm:mt-3 sm:block')
      expect(screen.getByRole('button', { name: /out of stock/i })).toBeDisabled()
    })
  })
})
