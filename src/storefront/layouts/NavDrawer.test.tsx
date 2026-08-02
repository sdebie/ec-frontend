import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom'
import { NavDrawer } from './NavDrawer'
import type { NavItem } from '@/shared/types/StorefrontConfig'

// Mock useCategoryTree so CategoryDrawerSection doesn't need a real GraphQL client
vi.mock('@/storefront/catalog/hooks/useCategoryTree', () => ({
  useCategoryTree: () => ({ tree: [], isLoading: false, isError: false }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const sampleItems: NavItem[] = [
  { id: '1', label: 'Products', path: '/products', external: false, sortOrder: 0 },
  { id: '2', label: 'About', path: '/about', external: false, sortOrder: 1 },
  { id: '3', label: 'Wholesale Portal', path: 'https://wholesale.example.com', external: true, sortOrder: 2 },
  { id: '4', label: 'Request a Quote', path: '/quote-request', external: false, sortOrder: 3, emphasis: 'cta' as const },
]

function renderNavDrawer(
  props: {
    open?: boolean
    onClose?: () => void
    items?: NavItem[]
    isSignedIn?: boolean
    accountName?: string | null
    onSignIn?: () => void
    onSignOut?: () => void
  } = {},
  initialEntries: string[] = ['/'],
) {
  const {
    open = true,
    onClose = vi.fn(),
    items = sampleItems,
    isSignedIn = false,
    accountName = null,
    onSignIn = vi.fn(),
    onSignOut = vi.fn(),
  } = props
  return {
    onClose,
    onSignIn,
    onSignOut,
    ...render(
      <MemoryRouter initialEntries={initialEntries}>
        <NavDrawer
          open={open}
          onClose={onClose}
          items={items}
          isSignedIn={isSignedIn}
          accountName={accountName}
          onSignIn={onSignIn}
          onSignOut={onSignOut}
        />
      </MemoryRouter>,
    ),
  }
}

describe('NavDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('closes on backdrop click', () => {
    it('calls onClose when backdrop is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      renderNavDrawer({ onClose })

      const backdrop = document.querySelector('[aria-hidden="true"]')!
      await user.click(backdrop)

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('closes on route change', () => {
    it('calls onClose when location.pathname changes', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      // Render with a Link that triggers a real route change within the same MemoryRouter
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="*"
              element={
                <>
                  <NavDrawer open={true} onClose={onClose} items={sampleItems} isSignedIn={false} accountName={null} onSignIn={vi.fn()} onSignOut={vi.fn()} />
                  <Link to="/products" data-testid="nav-trigger">
                    Go to products
                  </Link>
                </>
              }
            />
          </Routes>
        </MemoryRouter>,
      )

      // Opening the drawer must not close it; only a later route change does.
      expect(onClose).not.toHaveBeenCalled()

      // Click a link to trigger a route change
      await user.click(screen.getByTestId('nav-trigger'))

      // onClose should be called again because location.pathname changed
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    })
  })

  describe('search bar renders at top of drawer', () => {
    it('renders a search form inside the drawer', () => {
      renderNavDrawer()

      const searchForm = screen.getByRole('search')
      expect(searchForm).toBeInTheDocument()
    })

    it('renders the search bar before the navigation items', () => {
      renderNavDrawer()

      const dialog = screen.getByRole('dialog')
      const searchForm = dialog.querySelector('[role="search"]')
      const nav = dialog.querySelector('nav')

      expect(searchForm).toBeTruthy()
      expect(nav).toBeTruthy()

      // Search bar should come before nav in DOM order
      const allChildren = Array.from(dialog.children)
      const searchParentIndex = allChildren.findIndex((el) =>
        el.contains(searchForm),
      )
      const navIndex = allChildren.findIndex((el) => el.contains(nav))

      expect(searchParentIndex).toBeLessThan(navIndex)
    })
  })

  describe('nav items are rendered', () => {
    it('renders all nav items', () => {
      renderNavDrawer()

      expect(screen.getByText('Products')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
      expect(screen.getByText('Wholesale Portal')).toBeInTheDocument()
    })

    it('renders nav items inside a nav element with proper aria-label', () => {
      renderNavDrawer()

      const nav = screen.getByRole('navigation', { name: /main navigation/i })
      expect(nav).toBeInTheDocument()
    })
  })

  describe('external item has target="_blank"', () => {
    it('renders external http(s) item with target="_blank"', () => {
      renderNavDrawer()

      const externalLink = screen.getByRole('link', { name: 'Wholesale Portal' })
      expect(externalLink).toHaveAttribute('target', '_blank')
      expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer')
      expect(externalLink).toHaveAttribute('href', 'https://wholesale.example.com')
    })
  })

  describe('does not render when closed', () => {
    it('offers sign in when signed out, and reports the intent to the header', async () => {
        const user = userEvent.setup()
        const {onSignIn} = renderNavDrawer({isSignedIn: false})

        const signIn = screen.getByRole('button', {name: /sign in/i})

        // Inside the dialog, not merely somewhere in the portal: an earlier
        // refactor closed the dialog element early and the account block
        // rendered as a static sibling — invisible, while every other
        // assertion here still passed.
        expect(screen.getByRole('dialog').contains(signIn)).toBe(true)

        await user.click(signIn)

        // The drawer never decides between the login page and the modal — the
        // header owns that, because it is the one that knows `loginStyle`.
        expect(onSignIn).toHaveBeenCalledTimes(1)
    })

    it('offers the account and sign out when signed in', async () => {
        const user = userEvent.setup()
        const {onSignOut} = renderNavDrawer({isSignedIn: true, accountName: 'Vanessa'})

        const accountLink = screen.getByRole('link', {name: /vanessa/i})
        expect(accountLink).toHaveAttribute('href', '/account/dashboard')
        expect(screen.getByRole('dialog').contains(accountLink)).toBe(true)
        expect(screen.queryByRole('button', {name: /sign in/i})).not.toBeInTheDocument()

        await user.click(screen.getByRole('button', {name: /sign out/i}))
        expect(onSignOut).toHaveBeenCalledTimes(1)
    })

    it('falls back to a generic label when no first name is known', () => {
        renderNavDrawer({isSignedIn: true, accountName: null})
        expect(screen.getByRole('link', {name: /my account/i})).toBeInTheDocument()
    })

    it('does not render the category tree (owner directive 2026-08-02)', () => {
        renderNavDrawer()
        // Removed until a better mobile treatment exists — ~20 root categories
        // turned the drawer into a wall of links and buried the account action.
        expect(screen.queryByText(/^categories$/i)).not.toBeInTheDocument()
    })

    it('returns null when open is false', () => {
      render(
        <MemoryRouter>
          <NavDrawer open={false} onClose={vi.fn()} items={sampleItems} isSignedIn={false} accountName={null} onSignIn={vi.fn()} onSignOut={vi.fn()} />
        </MemoryRouter>,
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('emphasis: "cta" drawer variant', () => {
    it('renders CTA item with full-width chip classes', () => {
      renderNavDrawer()

      const ctaLink = screen.getByRole('link', { name: 'Request a Quote' })
      expect(ctaLink.className).toContain('rounded-full')
      expect(ctaLink.className).toContain('border-(--sf-accent)')
      expect(ctaLink.className).toContain('w-full')
      expect(ctaLink.className).toContain('text-center')
    })

    it('renders default items without chip classes in drawer', () => {
      renderNavDrawer()

      const defaultLink = screen.getByRole('link', { name: 'Products' })
      expect(defaultLink.className).not.toContain('rounded-full')
      expect(defaultLink.className).not.toContain('border-(--sf-accent)')
      expect(defaultLink.className).not.toContain('w-full')
    })
  })
})
