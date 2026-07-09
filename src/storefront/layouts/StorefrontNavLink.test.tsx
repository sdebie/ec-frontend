import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StorefrontNavLink } from './StorefrontNavLink'
import type { NavItem } from '@/shared/types/StorefrontConfig'

function renderNavLink(item: NavItem, initialEntries: string[] = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <StorefrontNavLink item={item} />
    </MemoryRouter>
  )
}

describe('StorefrontNavLink', () => {
  describe('external http(s) link', () => {
    it('renders an <a> with target="_blank" and rel="noopener noreferrer" for http external link', () => {
      const item: NavItem = {
        id: '1',
        label: 'Google',
        path: 'https://www.google.com',
        external: true,
        sortOrder: 0,
      }

      renderNavLink(item)

      const link = screen.getByRole('link', { name: 'Google' })
      expect(link).toHaveAttribute('href', 'https://www.google.com')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('renders an <a> with target="_blank" for http:// external link', () => {
      const item: NavItem = {
        id: '2',
        label: 'Insecure Site',
        path: 'http://example.com',
        external: true,
        sortOrder: 1,
      }

      renderNavLink(item)

      const link = screen.getByRole('link', { name: 'Insecure Site' })
      expect(link).toHaveAttribute('href', 'http://example.com')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('internal link', () => {
    it('renders a React Router NavLink for internal items', () => {
      const item: NavItem = {
        id: '3',
        label: 'Products',
        path: '/products',
        external: false,
        sortOrder: 0,
      }

      renderNavLink(item)

      const link = screen.getByRole('link', { name: 'Products' })
      expect(link).toHaveAttribute('href', '/products')
      expect(link).not.toHaveAttribute('target')
      expect(link).not.toHaveAttribute('rel')
    })
  })

  describe('active route visual distinction', () => {
    it('applies font-semibold class when the route is active', () => {
      const item: NavItem = {
        id: '4',
        label: 'Products',
        path: '/products',
        external: false,
        sortOrder: 0,
      }

      renderNavLink(item, ['/products'])

      const link = screen.getByRole('link', { name: 'Products' })
      expect(link.className).toContain('font-semibold')
    })

    it('does not apply font-semibold class when the route is not active', () => {
      const item: NavItem = {
        id: '5',
        label: 'Products',
        path: '/products',
        external: false,
        sortOrder: 0,
      }

      renderNavLink(item, ['/about'])

      const link = screen.getByRole('link', { name: 'Products' })
      expect(link.className).not.toContain('font-semibold')
    })
  })

  describe('non-http(s) external link', () => {
    it('does not render target="_blank" for a mailto: external link', () => {
      const item: NavItem = {
        id: '6',
        label: 'Email Us',
        path: 'mailto:info@shop.com',
        external: true,
        sortOrder: 0,
      }

      renderNavLink(item)

      const link = screen.getByRole('link', { name: 'Email Us' })
      expect(link).not.toHaveAttribute('target', '_blank')
    })

    it('does not render target="_blank" for a tel: external link', () => {
      const item: NavItem = {
        id: '7',
        label: 'Call Us',
        path: 'tel:+27123456789',
        external: true,
        sortOrder: 0,
      }

      renderNavLink(item)

      const link = screen.getByRole('link', { name: 'Call Us' })
      expect(link).not.toHaveAttribute('target', '_blank')
    })

    it('renders non-http(s) external paths as internal NavLinks', () => {
      const item: NavItem = {
        id: '8',
        label: 'Internal Path',
        path: '/wholesale-application',
        external: true,
        sortOrder: 0,
      }

      renderNavLink(item)

      const link = screen.getByRole('link', { name: 'Internal Path' })
      expect(link).toHaveAttribute('href', '/wholesale-application')
      expect(link).not.toHaveAttribute('target')
    })
  })
})
