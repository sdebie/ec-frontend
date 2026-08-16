import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QuickViewModal, type QuickViewModalProps } from '../QuickViewModal'

vi.mock('@/shared/config/storefrontConfig.context', () => ({
  useStorefrontConfig: () => ({ currency: 'ZAR', locale: 'en-ZA' }),
}))

vi.mock('@/shared/auth/customerAuthStore', () => ({
  useCustomerAuthStore: (selector: (state: { customerType: string }) => string) =>
    selector({ customerType: 'RETAIL' }),
}))

function createProduct(overrides: Partial<QuickViewModalProps['product']> = {}) {
  return {
    id: 'prod-1',
    name: 'Safety Goggles',
    slug: 'safety-goggles',
    shortDescription: 'High-impact safety goggles for industrial use',
    images: [{ imageUrl: '/images/goggles.jpg', featured: true, sortOrder: 1 }],
    retailPrice: { price: 199.99 },
    wholesalePrice: { price: 149.99 },
    retailSalePrice: null,
    wholesaleSalePrice: null,
    variantId: 'variant-1',
    sku: 'GOG-001',
    inStock: true,
    ...overrides,
  }
}

function renderModal(props: Partial<QuickViewModalProps> = {}) {
  const triggerEl = document.createElement('button')
  triggerEl.textContent = 'Quick view trigger'
  document.body.appendChild(triggerEl)

  const triggerRef = { current: triggerEl }
  const onClose = props.onClose ?? vi.fn()

  const defaultProps: QuickViewModalProps = {
    product: createProduct(props.product as Partial<QuickViewModalProps['product']>),
    variantId: props.variantId !== undefined ? props.variantId : 'variant-1',
    triggerRef,
    onClose,
  }

  const result = render(
    <MemoryRouter>
      <QuickViewModal {...defaultProps} />
    </MemoryRouter>,
  )

  return { ...result, onClose, triggerRef, triggerEl }
}

describe('QuickViewModal', () => {
  beforeEach(() => {
    // Set data attributes on document root for portal copying
    document.documentElement.setAttribute('data-surface', 'storefront')
    document.documentElement.setAttribute('data-theme', 'uvh')
    document.documentElement.setAttribute('data-density', 'comfortable')
  })

  afterEach(() => {
    document.documentElement.removeAttribute('data-surface')
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.removeAttribute('data-density')
    // Clean up any trigger elements appended to body
    document.body.querySelectorAll('button').forEach((btn) => {
      if (btn.textContent === 'Quick view trigger') {
        btn.remove()
      }
    })
  })

  describe('a11y contract', () => {
    it('has aria-modal="true" on the dialog', () => {
      renderModal()
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('has an accessible name via aria-labelledby pointing to the product name heading', () => {
      renderModal()
      const dialog = screen.getByRole('dialog')
      const labelledById = dialog.getAttribute('aria-labelledby')
      expect(labelledById).toBeTruthy()

      const heading = screen.getByRole('heading', { name: /safety goggles/i })
      expect(heading).toHaveAttribute('id', labelledById)
    })

    it('pressing Escape calls onClose', () => {
      const { onClose } = renderModal()
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('focus trap', () => {
    it('Tab wraps from last focusable element to first', () => {
      renderModal()
      const dialog = screen.getByRole('dialog')
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      )
      expect(focusable.length).toBeGreaterThan(0)

      const last = focusable[focusable.length - 1]
      const first = focusable[0]

      last.focus()
      expect(document.activeElement).toBe(last)

      // Tab forward from the last element should wrap to first
      fireEvent.keyDown(document, { key: 'Tab' })
      expect(document.activeElement).toBe(first)
    })

    it('Shift+Tab wraps from first focusable element to last', () => {
      renderModal()
      const dialog = screen.getByRole('dialog')
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      )
      expect(focusable.length).toBeGreaterThan(0)

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      first.focus()
      expect(document.activeElement).toBe(first)

      // Shift+Tab from first should wrap to last
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
      expect(document.activeElement).toBe(last)
    })
  })

  describe('focus restore', () => {
    it('returns focus to the trigger element on unmount (close)', () => {
      const { unmount, triggerEl } = renderModal()

      // Unmount simulates closing
      unmount()

      expect(document.activeElement).toBe(triggerEl)
    })
  })

  describe('portal attributes', () => {
    it('carries data-surface on the portal container', () => {
      renderModal()
      const portal = screen.getByTestId('quick-view-portal')
      expect(portal).toHaveAttribute('data-surface', 'storefront')
    })

    it('carries data-theme on the portal container', () => {
      renderModal()
      const portal = screen.getByTestId('quick-view-portal')
      expect(portal).toHaveAttribute('data-theme', 'uvh')
    })

    it('carries data-density on the portal container', () => {
      renderModal()
      const portal = screen.getByTestId('quick-view-portal')
      expect(portal).toHaveAttribute('data-density', 'comfortable')
    })
  })

  describe('content branches', () => {
    it('renders CardActions (Add to cart) for SIMPLE in-stock product with price', () => {
      renderModal({
        product: createProduct({ variantId: 'v1', inStock: true }),
        variantId: 'v1',
      })

      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /view full details/i })).not.toBeInTheDocument()
    })

    it('renders "View full details" link for VARIABLE product (no variantId)', () => {
      renderModal({
        product: createProduct({ variantId: null, sku: null, inStock: true }),
        variantId: null,
      })

      const link = screen.getByRole('link', { name: /view full details/i })
      expect(link).toHaveAttribute('href', '/products/safety-goggles')
      expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument()
    })

    it('renders "View full details" link for out-of-stock SIMPLE product', () => {
      renderModal({
        product: createProduct({ inStock: false }),
        variantId: 'variant-1',
      })

      const link = screen.getByRole('link', { name: /view full details/i })
      expect(link).toHaveAttribute('href', '/products/safety-goggles')
      expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument()
    })

    it('displays SKU for SIMPLE product', () => {
      renderModal({ product: createProduct({ sku: 'SKU-123' }) })
      expect(screen.getByText('SKU: SKU-123')).toBeInTheDocument()
    })

    it('does not display SKU when sku is null', () => {
      renderModal({ product: createProduct({ sku: null }) })
      expect(screen.queryByText(/SKU:/)).not.toBeInTheDocument()
    })

    it('displays "In stock" for inStock=true', () => {
      renderModal({ product: createProduct({ inStock: true }) })
      expect(screen.getByText('In stock')).toBeInTheDocument()
    })

    it('displays "Out of stock" for inStock=false', () => {
      renderModal({
        product: createProduct({ inStock: false }),
        variantId: 'variant-1',
      })
      expect(screen.getByText('Out of stock')).toBeInTheDocument()
    })

    it('displays no stock indicator when inStock is null', () => {
      renderModal({ product: createProduct({ inStock: null }) })
      expect(screen.queryByText('In stock')).not.toBeInTheDocument()
      expect(screen.queryByText('Out of stock')).not.toBeInTheDocument()
    })

    it('displays short description', () => {
      renderModal()
      expect(screen.getByText('High-impact safety goggles for industrial use')).toBeInTheDocument()
    })

    it('displays product name as heading', () => {
      renderModal()
      expect(screen.getByRole('heading', { name: /safety goggles/i })).toBeInTheDocument()
    })
  })

  describe('backdrop close', () => {
    it('clicking the backdrop calls onClose', () => {
      const { onClose } = renderModal()
      const backdrop = screen.getByTestId('quick-view-backdrop')
      fireEvent.click(backdrop)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
