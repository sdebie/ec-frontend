import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AccountLayout } from './AccountLayout'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, Outlet: () => <div data-testid="outlet">Page Content</div> }
})

function renderLayout(initialPath = '/account/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/account/*" element={<AccountLayout />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AccountLayout', () => {
  const navLabels = ['Dashboard', 'Orders', 'Profile', 'Wishlist']

  describe('sidebar renders all nav items (Req 2.2)', () => {
    it('renders all 4 navigation labels in the desktop sidebar', () => {
      renderLayout()

      const desktopNav = screen.getAllByRole('navigation', { name: 'Account navigation' })[0]

      for (const label of navLabels) {
        expect(desktopNav).toHaveTextContent(label)
      }
    })

    it('renders all 4 navigation labels in the mobile tab strip', () => {
      renderLayout()

      const mobileNav = screen.getAllByRole('navigation', { name: 'Account navigation' })[1]

      for (const label of navLabels) {
        expect(mobileNav).toHaveTextContent(label)
      }
    })
  })

  describe('active route is visually distinguished (Req 2.3)', () => {
    it('applies font-semibold to the active NavLink for /account/dashboard', () => {
      renderLayout('/account/dashboard')

      const dashboardLinks = screen.getAllByRole('link', { name: 'Dashboard' })
      // Both desktop and mobile links should have the active class
      for (const link of dashboardLinks) {
        expect(link).toHaveClass('font-semibold')
      }
    })

    it('applies font-semibold to the active NavLink for /account/orders', () => {
      renderLayout('/account/orders')

      const ordersLinks = screen.getAllByRole('link', { name: 'Orders' })
      for (const link of ordersLinks) {
        expect(link).toHaveClass('font-semibold')
      }
    })

    it('does not apply font-semibold to inactive NavLinks', () => {
      renderLayout('/account/dashboard')

      const ordersLinks = screen.getAllByRole('link', { name: 'Orders' })
      for (const link of ordersLinks) {
        expect(link).not.toHaveClass('font-semibold')
      }
    })
  })

  describe('mobile layout renders horizontal tabs (Req 2.5)', () => {
    it('renders a mobile nav with md:hidden and flex classes', () => {
      renderLayout()

      const navElements = screen.getAllByRole('navigation', { name: 'Account navigation' })
      // The second nav is the mobile one
      const mobileNav = navElements[1]

      expect(mobileNav).toHaveClass('md:hidden')
      expect(mobileNav).toHaveClass('flex')
      expect(mobileNav).toHaveClass('overflow-x-auto')
    })

    it('renders a desktop nav with hidden md:block classes', () => {
      renderLayout()

      const navElements = screen.getAllByRole('navigation', { name: 'Account navigation' })
      // The first nav is the desktop sidebar
      const desktopNav = navElements[0]

      expect(desktopNav).toHaveClass('hidden')
      expect(desktopNav).toHaveClass('md:block')
    })

    it('renders the Outlet for child route content', () => {
      renderLayout()

      expect(screen.getByTestId('outlet')).toBeInTheDocument()
    })
  })
})
