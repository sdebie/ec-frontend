import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import type { StorefrontConfig } from '@/shared/types/StorefrontConfig'
import { StorefrontConfigContext } from '@/shared/config/storefrontConfig.context'
import { SF_FOCUS_RING } from '@/storefront/sections/shared/focusRing'
import { StorefrontHeader } from '../StorefrontHeader'
import { SearchBar } from '../SearchBar'
import { CartIcon } from '@/storefront/cart/components/CartIcon'
import { WishlistIcon } from '@/storefront/customer/account/wishlist/components/WishlistIcon'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

vi.mock('@/storefront/customer/auth/components/CustomerLoginModal', () => ({
  CustomerLoginModal: () => null,
}))

vi.mock('@/storefront/customer/auth/components/ForgotPasswordModal', () => ({
  ForgotPasswordModal: () => null,
}))

const NAV_FOCUS_CLASSES = SF_FOCUS_RING.nav.split(' ')
const PAGE_FOCUS_CLASSES = SF_FOCUS_RING.page.split(' ')

function createConfig(overrides: Partial<StorefrontConfig> = {}): StorefrontConfig {
  return {
    clientId: 'test',
    clientName: 'Test Store',
    currency: 'ZAR',
    locale: 'en-ZA',
    theme: {},
    nav: [
      { id: '1', label: 'Shop', path: '/products', external: false, sortOrder: 0 },
      { id: '2', label: 'About', path: '/about', external: false, sortOrder: 1 },
    ],
    sections: [],
    branding: { name: 'Test Store' },
    stickyHeader: false,
    ...overrides,
  }
}

function renderWithConfig(ui: React.ReactElement, config?: Partial<StorefrontConfig>) {
  const mergedConfig = createConfig(config)
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <StorefrontConfigContext.Provider value={mergedConfig}>
        <MemoryRouter>
          {ui}
        </MemoryRouter>
      </StorefrontConfigContext.Provider>
    </QueryClientProvider>
  )
}

function expectFocusRingClasses(element: HTMLElement, variant: 'nav' | 'page') {
  const classes = variant === 'nav' ? NAV_FOCUS_CLASSES : PAGE_FOCUS_CLASSES
  for (const cls of classes) {
    expect(element.className).toContain(cls)
  }
}

describe('SF_FOCUS_RING — class assertions per control', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCustomerAuthStore.setState({
      isSignedIn: false,
      token: null,
      customerType: 'RETAIL',
      email: null,
      firstName: null,
      lastName: null,
    })
  })

  describe('focusRing utility', () => {
    it('exports page and nav variants with correct token references', () => {
      expect(SF_FOCUS_RING.page).toContain('focus-visible:ring-offset-(--sf-background)')
      expect(SF_FOCUS_RING.nav).toContain('focus-visible:ring-offset-(--sf-nav-background)')
      expect(SF_FOCUS_RING.page).toContain('focus-visible:ring-(--sf-ring)')
      expect(SF_FOCUS_RING.nav).toContain('focus-visible:ring-(--sf-ring)')
    })

    it('both variants include outline-none and ring-2', () => {
      expect(SF_FOCUS_RING.page).toContain('outline-none')
      expect(SF_FOCUS_RING.page).toContain('focus-visible:ring-2')
      expect(SF_FOCUS_RING.nav).toContain('outline-none')
      expect(SF_FOCUS_RING.nav).toContain('focus-visible:ring-2')
    })
  })

  describe('Sign in link (page login style)', () => {
    it('has the nav focus ring classes', () => {
      renderWithConfig(<StorefrontHeader />, { auth: { loginStyle: 'page' } })
      const signIn = screen.getByRole('link', { name: /sign in/i })
      expectFocusRingClasses(signIn, 'nav')
    })
  })

  describe('Sign in button (modal login style)', () => {
    it('has the nav focus ring classes', () => {
      renderWithConfig(<StorefrontHeader />, { auth: { loginStyle: 'modal' } })
      const signIn = screen.getByRole('button', { name: /sign in/i })
      expectFocusRingClasses(signIn, 'nav')
    })
  })

  describe('Burger button', () => {
    it('has the nav focus ring classes', () => {
      renderWithConfig(<StorefrontHeader />)
      const burger = screen.getByRole('button', { name: /open navigation/i })
      expectFocusRingClasses(burger, 'nav')
    })
  })

  describe('SearchBar submit button (nav tone)', () => {
    it('has the nav focus ring classes', () => {
      renderWithConfig(<SearchBar tone="nav" />)
      const button = screen.getByRole('button', { name: /submit search/i })
      expectFocusRingClasses(button, 'nav')
    })
  })

  describe('SearchBar submit button (panel tone)', () => {
    it('has the page focus ring classes', () => {
      renderWithConfig(<SearchBar tone="panel" />)
      const button = screen.getByRole('button', { name: /submit search/i })
      expectFocusRingClasses(button, 'page')
    })
  })

  describe('WishlistIcon', () => {
    it('has the nav focus ring classes', () => {
      renderWithConfig(<WishlistIcon />)
      const link = screen.getByRole('link', { name: /wishlist/i })
      expectFocusRingClasses(link, 'nav')
    })
  })

  describe('CartIcon', () => {
    it('has the nav focus ring classes', () => {
      renderWithConfig(<CartIcon />)
      const link = screen.getByRole('link', { name: /cart/i })
      expectFocusRingClasses(link, 'nav')
    })
  })
})
