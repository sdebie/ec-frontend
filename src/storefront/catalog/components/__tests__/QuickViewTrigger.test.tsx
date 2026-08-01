import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { ProductCard } from '../ProductCard'

vi.mock('@/shared/config/storefrontConfig.context', () => ({
  useStorefrontConfig: () => ({ currency: 'ZAR', locale: 'en-ZA' }),
}))

vi.mock('@/shared/auth/customerAuthStore', () => ({
  useCustomerAuthStore: (selector?: (state: { customerType: string; isSignedIn: boolean }) => unknown) => {
    const state = { customerType: 'RETAIL', isSignedIn: false }
    return selector ? selector(state) : state
  },
}))

const baseProduct = {
  id: '1',
  name: 'Test Product',
  slug: 'test-product',
  images: [{ imageUrl: 'https://example.com/img.jpg', featured: true, sortOrder: 1 }],
  retailPrice: { price: 199.99 },
  wholesalePrice: { price: 149.99 },
  retailSalePrice: null,
  wholesaleSalePrice: null,
  sku: 'SKU-001',
  inStock: true,
  shortDescription: 'A test product',
}

function renderCard(props: Partial<Parameters<typeof ProductCard>[0]> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProductCard product={baseProduct} variantId="v1" {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('Quick view trigger', () => {
  describe('trigger visibility semantics', () => {
    it('renders the Quick view button when onQuickView is provided', () => {
      renderCard({ onQuickView: vi.fn() })
      expect(screen.getByRole('button', { name: 'Quick view' })).toBeInTheDocument()
    })

    it('does NOT render the Quick view button when onQuickView is not provided', () => {
      renderCard({})
      expect(screen.queryByRole('button', { name: 'Quick view' })).not.toBeInTheDocument()
    })

    it('has md+ visibility classes (hidden below md, inline-flex on md+)', () => {
      renderCard({ onQuickView: vi.fn() })
      const btn = screen.getByRole('button', { name: 'Quick view' })
      expect(btn).toHaveClass('hidden')
      expect(btn).toHaveClass('md:inline-flex')
    })

    it('has opacity-0 by default and group-hover:opacity-100 + focus-visible:opacity-100 for reveal', () => {
      renderCard({ onQuickView: vi.fn() })
      const btn = screen.getByRole('button', { name: 'Quick view' })
      expect(btn).toHaveClass('opacity-0')
      expect(btn).toHaveClass('group-hover:opacity-100')
      expect(btn).toHaveClass('focus-visible:opacity-100')
    })
  })

  describe('keyboard reachability', () => {
    it('is a real <button> element (in the tab order)', () => {
      renderCard({ onQuickView: vi.fn() })
      const btn = screen.getByRole('button', { name: 'Quick view' })
      expect(btn.tagName).toBe('BUTTON')
      expect(btn).not.toHaveAttribute('tabindex', '-1')
    })
  })

  describe('open/close flow', () => {
    it('calls onQuickView when the Quick view button is clicked', async () => {
      const user = userEvent.setup()
      const onQuickView = vi.fn()
      renderCard({ onQuickView })

      await user.click(screen.getByRole('button', { name: 'Quick view' }))
      expect(onQuickView).toHaveBeenCalledTimes(1)
    })
  })

  describe('ref forwarding', () => {
    it('accepts a quickViewRef prop and attaches it to the button', () => {
      const ref = { current: null } as React.MutableRefObject<HTMLButtonElement | null>
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      })
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ProductCard
              product={baseProduct}
              variantId="v1"
              onQuickView={vi.fn()}
              quickViewRef={ref}
            />
          </MemoryRouter>
        </QueryClientProvider>,
      )

      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current?.textContent).toBe('Quick view')
    })
  })
})
