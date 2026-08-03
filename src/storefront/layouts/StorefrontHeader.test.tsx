import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import type { StorefrontConfig, NavItem } from '@/shared/types/StorefrontConfig'
import { StorefrontConfigContext } from '@/shared/config/storefrontConfig.context'
import { StorefrontHeader } from './StorefrontHeader'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/storefront/customer/account/wishlist/components/WishlistIcon', () => ({
  WishlistIcon: () => <div data-testid="wishlist-icon" />,
}))

vi.mock('@/storefront/customer/auth/components/CustomerLoginModal', () => ({
  CustomerLoginModal: ({ isOpen, onClose, onForgotPassword }: {
    isOpen: boolean
    onClose: () => void
    onForgotPassword: () => void
  }) => {
    if (!isOpen) return null
    return (
      <div data-testid="customer-login-modal">
        <button data-testid="modal-close" onClick={onClose}>Close</button>
        <button data-testid="modal-forgot-password" onClick={onForgotPassword}>Forgot password</button>
      </div>
    )
  },
}))

vi.mock('@/storefront/customer/auth/components/ForgotPasswordModal', () => ({
  ForgotPasswordModal: ({ isOpen, onClose, onBackToLogin }: {
    isOpen: boolean
    onClose: () => void
    onBackToLogin: () => void
  }) => {
    if (!isOpen) return null
    return (
      <div data-testid="forgot-password-modal">
        <button data-testid="forgot-close" onClick={onClose}>Close</button>
        <button data-testid="forgot-back-to-login" onClick={onBackToLogin}>Back to login</button>
      </div>
    )
  },
}))

function createConfig(overrides: Partial<StorefrontConfig> = {}): StorefrontConfig {
  return {
    clientId: 'test',
    clientName: 'Test Store',
    currency: 'ZAR',
    locale: 'en-ZA',
    theme: {},
    nav: [],
    sections: [],
    branding: { name: 'Test Store' },
    stickyHeader: false,
    ...overrides,
  }
}

function renderHeader(config?: Partial<StorefrontConfig>) {
  const mergedConfig = createConfig(config)
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <StorefrontConfigContext.Provider value={mergedConfig}>
        <MemoryRouter>
          <StorefrontHeader />
        </MemoryRouter>
      </StorefrontConfigContext.Provider>
    </QueryClientProvider>
  )
}

describe('StorefrontHeader', () => {
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

  describe('signed-out state', () => {
    it('renders "Sign in" link pointing to /account/login', () => {
      renderHeader()

      const signInLink = screen.getByRole('link', { name: /sign in/i })
      expect(signInLink).toBeInTheDocument()
      expect(signInLink).toHaveAttribute('href', '/account/login')
    })

    it('does not render a user dropdown', () => {
      renderHeader()

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  describe('signed-in state', () => {
    beforeEach(() => {
      useCustomerAuthStore.setState({
        isSignedIn: true,
        token: 'test-token',
        customerType: 'RETAIL',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
      })
    })

    it('names the customer on the account control without printing the label', () => {
      renderHeader()

      // Icon-only control (owner directive 2026-08-03): the visible text label
      // is gone, so the name has to survive as the accessible name — otherwise
      // the control announces as an unlabelled button.
      expect(screen.getByRole('button', { name: 'Account menu for Jane' })).toBeInTheDocument()
      expect(screen.queryByText('Jane')).not.toBeInTheDocument()
    })

    it('falls back to a generic accessible name when firstName is null', () => {
      useCustomerAuthStore.setState({ firstName: null })
      renderHeader()

      expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument()
    })

    it('renders dropdown with "My Account" and "Sign out" when button is clicked', async () => {
      const user = userEvent.setup()
      renderHeader()

      await user.click(screen.getByRole('button', { name: /jane/i }))

      expect(screen.getByRole('menu')).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: /my account/i })).toHaveAttribute(
        'href',
        '/account/dashboard'
      )
      expect(screen.getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument()
    })

    it('sets aria-expanded on the dropdown toggle button', async () => {
      const user = userEvent.setup()
      renderHeader()

      const toggleButton = screen.getByRole('button', { name: /jane/i })
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false')

      await user.click(toggleButton)
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('closes the dropdown when the customer clicks outside it', async () => {
      const user = userEvent.setup()
      renderHeader()

      await user.click(screen.getByRole('button', { name: /jane/i }))
      expect(screen.getByRole('menu')).toBeInTheDocument()

      await user.click(document.body)
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('closes the dropdown when Escape is pressed', async () => {
      const user = userEvent.setup()
      renderHeader()

      await user.click(screen.getByRole('button', { name: /jane/i }))
      await user.keyboard('{Escape}')

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('uses storefront panel, border, and shadow tokens for the dropdown', async () => {
      const user = userEvent.setup()
      renderHeader()

      await user.click(screen.getByRole('button', { name: /jane/i }))

      expect(screen.getByRole('menu')).toHaveClass(
        'bg-(--sf-panel)',
        'border-(--sf-border)',
        'shadow-(--sf-shadow-lg)',
      )
    })
  })

  describe('sign-out behaviour', () => {
    it('calls clearSession() and navigates to / when "Sign out" is clicked', async () => {
      const mockClearSession = vi.fn()
      useCustomerAuthStore.setState({
        isSignedIn: true,
        token: 'test-token',
        customerType: 'RETAIL',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        clearSession: mockClearSession,
      })

      const user = userEvent.setup()
      renderHeader()

      await user.click(screen.getByRole('button', { name: /jane/i }))
      await user.click(screen.getByRole('menuitem', { name: /sign out/i }))

      expect(mockClearSession).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  describe('sticky header config', () => {
    it('applies sticky positioning when stickyHeader is true', () => {
      renderHeader({ stickyHeader: true })

      const header = screen.getByRole('banner')
      expect(header.className).toContain('sticky')
      expect(header.className).toContain('top-0')
    })

    it('applies relative positioning when stickyHeader is false', () => {
      renderHeader({ stickyHeader: false })

      const header = screen.getByRole('banner')
      expect(header.className).toContain('relative')
      expect(header.className).not.toContain('sticky')
    })
  })

  describe('branding', () => {
    it('renders the store name when no logo is configured', () => {
      renderHeader({ branding: { name: 'My Shop' } })

      expect(screen.getByText('My Shop')).toBeInTheDocument()
    })

    it('renders the logo image when logo is configured', () => {
      renderHeader({
        branding: {
          name: 'My Shop',
          logo: { src: '/logo.png', alt: 'My Shop Logo' },
        },
      })

      const logo = screen.getByAltText('My Shop Logo')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', '/static/images/logo.png')
    })
  })

  describe('desktop navigation (Requirement 2.1)', () => {
    const navItems: NavItem[] = [
      { id: '1', label: 'Shop', path: '/products', external: false, sortOrder: 0 },
      { id: '2', label: 'About', path: '/about', external: false, sortOrder: 1 },
    ]

    it('renders desktop nav with hidden md:flex classes (hidden on mobile, visible on md+)', () => {
      renderHeader({ nav: navItems })

      const nav = screen.getByRole('navigation', { name: /main navigation/i })
      expect(nav.className).toContain('hidden')
      expect(nav.className).toMatch(/md:flex/)
    })

    it('renders all configured nav items in the desktop nav', () => {
      renderHeader({ nav: navItems })

      const nav = screen.getByRole('navigation', { name: /main navigation/i })
      expect(within(nav).getByText('Shop')).toBeInTheDocument()
      expect(within(nav).getByText('About')).toBeInTheDocument()
    })
  })

  describe('search bar visibility (Requirement 3.1)', () => {
    const navItems: NavItem[] = [
      { id: '1', label: 'Shop', path: '/products', external: false, sortOrder: 0 },
    ]

    it('renders desktop search bar container with hidden md:flex classes (visible on desktop only)', () => {
      renderHeader({ nav: navItems })

      const searchForms = screen.getAllByRole('search')
      const desktopSearch = searchForms.find(
        (form) => form.parentElement?.className.includes('md:flex')
      )
      expect(desktopSearch).toBeDefined()
      expect(desktopSearch!.parentElement!.className).toContain('hidden')
      expect(desktopSearch!.parentElement!.className).toMatch(/md:flex/)
    })
  })

  describe('burger button opens drawer (Requirement 2.2)', () => {
    const navItems: NavItem[] = [
      { id: '1', label: 'Shop', path: '/products', external: false, sortOrder: 0 },
      { id: '2', label: 'About', path: '/about', external: false, sortOrder: 1 },
    ]

    it('renders burger button with md:hidden class (visible on mobile only)', () => {
      renderHeader({ nav: navItems })

      const burgerButton = screen.getByRole('button', { name: /open navigation/i })
      expect(burgerButton.className).toContain('md:hidden')
    })

    it('opens the navigation drawer when burger button is clicked', async () => {
      const user = userEvent.setup()
      renderHeader({ nav: navItems })

      // Drawer should not be visible initially
      expect(screen.queryByRole('dialog', { name: /navigation menu/i })).not.toBeInTheDocument()

      // Click the burger button
      await user.click(screen.getByRole('button', { name: /open navigation/i }))

      // Drawer should now be visible
      expect(screen.getByRole('dialog', { name: /navigation menu/i })).toBeInTheDocument()
    })

    it('sets aria-expanded to true on burger button when drawer is open', async () => {
      const user = userEvent.setup()
      renderHeader({ nav: navItems })

      const burgerButton = screen.getByRole('button', { name: /open navigation/i })
      expect(burgerButton).toHaveAttribute('aria-expanded', 'false')

      await user.click(burgerButton)
      expect(burgerButton).toHaveAttribute('aria-expanded', 'true')
    })
  })

  describe('empty nav items (Requirement 2.9)', () => {
    it('does not render nav element when nav items are empty', () => {
      renderHeader({ nav: [] })

      expect(screen.queryByRole('navigation', { name: /main navigation/i })).not.toBeInTheDocument()
    })

    it('does not render search bar in header when nav items are empty', () => {
      renderHeader({ nav: [] })

      expect(screen.queryByRole('search')).not.toBeInTheDocument()
    })

    it('does not render burger button when nav items are empty', () => {
      renderHeader({ nav: [] })

      expect(screen.queryByRole('button', { name: /open navigation/i })).not.toBeInTheDocument()
    })

    it('does not render nav element when nav is undefined', () => {
      renderHeader({ nav: undefined })

      expect(screen.queryByRole('navigation', { name: /main navigation/i })).not.toBeInTheDocument()
    })
  })

  describe('mobile search row (design C7)', () => {
    const navItems: NavItem[] = [
      { id: '1', label: 'Shop', path: '/products', external: false, sortOrder: 0 },
      { id: '2', label: 'About', path: '/about', external: false, sortOrder: 1 },
    ]

    it('renders a mobile search row when nav items are present', () => {
      renderHeader({ nav: navItems })

      const searchForms = screen.getAllByRole('search')
      // Two search bars: one desktop (hidden md:flex wrapper), one mobile (md:hidden wrapper)
      expect(searchForms.length).toBe(2)
    })

    it('does not render a mobile search row when nav items are empty', () => {
      renderHeader({ nav: [] })

      expect(screen.queryByRole('search')).not.toBeInTheDocument()
    })

    it('applies md:hidden class to the mobile search row wrapper', () => {
      renderHeader({ nav: navItems })

      const searchForms = screen.getAllByRole('search')
      // The mobile search row is the one whose parent wrapper has md:hidden
      const mobileSearch = searchForms.find(
        (form) => form.parentElement?.className.includes('md:hidden')
      )
      expect(mobileSearch).toBeDefined()
      expect(mobileSearch!.parentElement!.className).toContain('md:hidden')
      expect(mobileSearch!.parentElement!.className).toContain('px-4')
      expect(mobileSearch!.parentElement!.className).toContain('pb-3')
    })

    it('desktop search markup remains unchanged (hidden md:flex wrapper with max-w-sm)', () => {
      renderHeader({ nav: navItems })

      const searchForms = screen.getAllByRole('search')
      // The desktop search is the one whose parent has md:flex
      const desktopSearch = searchForms.find(
        (form) => form.parentElement?.className.includes('md:flex')
      )
      expect(desktopSearch).toBeDefined()
      expect(desktopSearch!.parentElement!.className).toContain('hidden')
      expect(desktopSearch!.parentElement!.className).toContain('md:flex')
      expect(desktopSearch!.className).toContain('max-w-sm')
    })
  })

  describe('sign-in icon (design C5)', () => {
    it('renders User icon on the signed-out page-style link', () => {
      renderHeader({ auth: { loginStyle: 'page' } })

      const signInLink = screen.getByRole('link', { name: /sign in/i })
      const icon = signInLink.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('h-5', 'w-5')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('renders User icon on the signed-out modal-style button', () => {
      renderHeader({ auth: { loginStyle: 'modal' } })

      const signInButton = screen.getByRole('button', { name: /sign in/i })
      const icon = signInButton.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('h-5', 'w-5')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })

  describe('config-driven login style (Requirements 1.3, 1.4, 1.5, 3.6, 3.7)', () => {
    describe('loginStyle === "page" (default)', () => {
      it('renders Sign in as a link to /account/login', () => {
        renderHeader({ auth: { loginStyle: 'page' } })

        const signInLink = screen.getByRole('link', { name: /sign in/i })
        expect(signInLink).toBeInTheDocument()
        expect(signInLink).toHaveAttribute('href', '/account/login')
      })

      it('does not render CustomerLoginModal', () => {
        renderHeader({ auth: { loginStyle: 'page' } })

        expect(screen.queryByTestId('customer-login-modal')).not.toBeInTheDocument()
      })

      it('defaults to page style when auth config is absent', () => {
        renderHeader({})

        const signInLink = screen.getByRole('link', { name: /sign in/i })
        expect(signInLink).toBeInTheDocument()
        expect(signInLink).toHaveAttribute('href', '/account/login')
        expect(screen.queryByTestId('customer-login-modal')).not.toBeInTheDocument()
      })
    })

    describe('loginStyle === "modal"', () => {
      it('renders Sign in as a button (not a link)', () => {
        renderHeader({ auth: { loginStyle: 'modal' } })

        const signInButton = screen.getByRole('button', { name: /sign in/i })
        expect(signInButton).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument()
      })

      it('does not show modal initially', () => {
        renderHeader({ auth: { loginStyle: 'modal' } })

        expect(screen.queryByTestId('customer-login-modal')).not.toBeInTheDocument()
      })

      it('opens CustomerLoginModal when Sign in button is clicked', async () => {
        const user = userEvent.setup()
        renderHeader({ auth: { loginStyle: 'modal' } })

        await user.click(screen.getByRole('button', { name: /sign in/i }))

        expect(screen.getByTestId('customer-login-modal')).toBeInTheDocument()
      })
    })

    describe('modal forgot password flow', () => {
      it('closes login modal and opens ForgotPasswordModal when onForgotPassword is triggered', async () => {
        const user = userEvent.setup()
        renderHeader({ auth: { loginStyle: 'modal' } })

        // Open the login modal
        await user.click(screen.getByRole('button', { name: /sign in/i }))
        expect(screen.getByTestId('customer-login-modal')).toBeInTheDocument()

        // Trigger forgot password
        await user.click(screen.getByTestId('modal-forgot-password'))

        // Login modal should be closed, forgot password modal should be open
        expect(screen.queryByTestId('customer-login-modal')).not.toBeInTheDocument()
        expect(screen.getByTestId('forgot-password-modal')).toBeInTheDocument()
      })

      it('closes ForgotPasswordModal and reopens login modal when onBackToLogin is triggered', async () => {
        const user = userEvent.setup()
        renderHeader({ auth: { loginStyle: 'modal' } })

        // Open login modal, then forgot password modal
        await user.click(screen.getByRole('button', { name: /sign in/i }))
        await user.click(screen.getByTestId('modal-forgot-password'))

        // Verify forgot modal is open
        expect(screen.getByTestId('forgot-password-modal')).toBeInTheDocument()

        // Trigger back to login
        await user.click(screen.getByTestId('forgot-back-to-login'))

        // Forgot modal should be closed, login modal should be open again
        expect(screen.queryByTestId('forgot-password-modal')).not.toBeInTheDocument()
        expect(screen.getByTestId('customer-login-modal')).toBeInTheDocument()
      })
    })

    describe('authenticated user', () => {
      beforeEach(() => {
        useCustomerAuthStore.setState({
          isSignedIn: true,
          token: 'test-token',
          customerType: 'RETAIL',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
        })
      })

      it('shows account dropdown when loginStyle is "page"', () => {
        renderHeader({ auth: { loginStyle: 'page' } })

        expect(screen.getByRole('button', { name: 'Account menu for Jane' })).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument()
      })

      it('shows account dropdown when loginStyle is "modal"', () => {
        renderHeader({ auth: { loginStyle: 'modal' } })

        expect(screen.getByRole('button', { name: 'Account menu for Jane' })).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: /sign in/i })).not.toBeInTheDocument()
        expect(screen.queryByTestId('customer-login-modal')).not.toBeInTheDocument()
      })

      it('does not render Sign in button regardless of loginStyle', () => {
        renderHeader({ auth: { loginStyle: 'modal' } })

        // The only button with "Sign in" text should not exist
        const buttons = screen.queryAllByRole('button')
        const signInButton = buttons.find(
          (btn) => btn.textContent?.trim() === 'Sign in'
        )
        expect(signInButton).toBeUndefined()
      })
    })
  })
})
