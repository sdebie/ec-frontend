import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom'
import { NavDrawer } from './NavDrawer'
import type { NavItem } from '@/shared/types/StorefrontConfig'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const sampleItems: NavItem[] = [
  { id: '1', label: 'Products', path: '/products', external: false, sortOrder: 0 },
  { id: '2', label: 'About', path: '/about', external: false, sortOrder: 1 },
  { id: '3', label: 'Wholesale Portal', path: 'https://wholesale.example.com', external: true, sortOrder: 2 },
]

function renderNavDrawer(
  props: { open?: boolean; onClose?: () => void; items?: NavItem[] } = {},
  initialEntries: string[] = ['/'],
) {
  const { open = true, onClose = vi.fn(), items = sampleItems } = props
  return {
    onClose,
    ...render(
      <MemoryRouter initialEntries={initialEntries}>
        <NavDrawer open={open} onClose={onClose} items={items} />
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

      // The useEffect fires onClose on mount due to location.pathname dependency
      // Clear the mock to isolate the backdrop click behavior
      onClose.mockClear()

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
                  <NavDrawer open={true} onClose={onClose} items={sampleItems} />
                  <Link to="/products" data-testid="nav-trigger">
                    Go to products
                  </Link>
                </>
              }
            />
          </Routes>
        </MemoryRouter>,
      )

      // The useEffect fires onClose on initial mount
      expect(onClose).toHaveBeenCalledTimes(1)
      onClose.mockClear()

      // Click a link to trigger a route change
      await user.click(screen.getByTestId('nav-trigger'))

      // onClose should be called again because location.pathname changed
      expect(onClose).toHaveBeenCalled()
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
    it('returns null when open is false', () => {
      render(
        <MemoryRouter>
          <NavDrawer open={false} onClose={vi.fn()} items={sampleItems} />
        </MemoryRouter>,
      )

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
