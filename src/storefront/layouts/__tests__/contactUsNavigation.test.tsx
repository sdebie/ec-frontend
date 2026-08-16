/**
 * Verifies that existing config-driven /contact-us links (in nav and footer)
 * navigate via React Router <Link>/<NavLink> rather than a full-page reload <a>.
 */
import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StorefrontNavLink } from '../StorefrontNavLink'
import { StorefrontFooter } from '../StorefrontFooter'
import { StorefrontConfigContext } from '@/shared/config/storefrontConfig.context'
import { storefrontConfigFixture } from '@/mocks/fixtures/storefrontConfig.fixture'
import type { StorefrontConfig } from '@/shared/types/StorefrontConfig'

describe('config-driven /contact-us links use React Router (Requirement 5.1)', () => {
  describe('nav: /contact-us item renders as React Router NavLink', () => {
    const contactNavItem = storefrontConfigFixture.nav.find(
      (item) => item.path === '/contact-us',
    )!

    it('fixture contains a /contact-us nav item', () => {
      expect(contactNavItem).toBeDefined()
      expect(contactNavItem.label).toBe('Contact Us')
      expect(contactNavItem.external).toBe(false)
    })

    it('renders as an internal React Router link (no target, no rel)', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <StorefrontNavLink item={contactNavItem} />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link', { name: 'Contact Us' })
      expect(link).toHaveAttribute('href', '/contact-us')
      expect(link).not.toHaveAttribute('target')
      expect(link).not.toHaveAttribute('rel')
    })

    it('applies active styling when route is /contact-us', () => {
      render(
        <MemoryRouter initialEntries={['/contact-us']}>
          <StorefrontNavLink item={contactNavItem} />
        </MemoryRouter>,
      )

      const link = screen.getByRole('link', { name: 'Contact Us' })
      expect(link.className).toContain('font-semibold')
    })
  })

  describe('footer: /contact-us link renders as React Router Link', () => {
    const footerConfigWithContactLink: StorefrontConfig = {
      ...storefrontConfigFixture,
      footer: {
        description: 'Test store description',
        columns: [
          {
            heading: 'Quick Links',
            links: [
              { id: 'fl-contact', label: 'Contact Us', to: '/contact-us', external: false },
              { id: 'fl-about', label: 'About Us', to: '/about-us', external: false },
            ],
          },
        ],
      },
    }

    it('renders the /contact-us footer link as an internal React Router Link', () => {
      render(
        <StorefrontConfigContext.Provider value={footerConfigWithContactLink}>
          <MemoryRouter>
            <StorefrontFooter />
          </MemoryRouter>
        </StorefrontConfigContext.Provider>,
      )

      const footerEl = screen.getByRole('contentinfo')
      const contactLink = within(footerEl).getByRole('link', { name: 'Contact Us' })
      expect(contactLink).toHaveAttribute('href', '/contact-us')
      expect(contactLink).not.toHaveAttribute('target')
      expect(contactLink).not.toHaveAttribute('rel')
    })

    it('does NOT render /contact-us as an external link with target="_blank"', () => {
      render(
        <StorefrontConfigContext.Provider value={footerConfigWithContactLink}>
          <MemoryRouter>
            <StorefrontFooter />
          </MemoryRouter>
        </StorefrontConfigContext.Provider>,
      )

      const footerEl = screen.getByRole('contentinfo')
      const contactLink = within(footerEl).getByRole('link', { name: 'Contact Us' })
      // A full-page reload <a> would have target="_blank" — React Router Link does not
      expect(contactLink).not.toHaveAttribute('target', '_blank')
    })
  })
})
