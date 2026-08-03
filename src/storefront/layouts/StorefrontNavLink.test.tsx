import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StorefrontNavLink } from './StorefrontNavLink'
import type { NavItem } from '@/shared/types/StorefrontConfig'

function renderNavLink(
  item: NavItem,
  initialEntries: string[] = ['/'],
  variant?: 'nav' | 'drawer',
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <StorefrontNavLink item={item} variant={variant} />
    </MemoryRouter>,
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
    it('applies font-semibold and accent border when the route is active', () => {
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
      expect(link.className).toContain('border-(--sf-accent)')
    })

    it('does not apply font-semibold or accent border when the route is not active', () => {
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
      expect(link.className).not.toContain('border-(--sf-accent)')
    })

    it('applies hover border class for inactive default items', () => {
      const item: NavItem = {
        id: '5b',
        label: 'Products',
        path: '/products',
        external: false,
        sortOrder: 0,
      }

      renderNavLink(item, ['/about'])

      const link = screen.getByRole('link', { name: 'Products' })
      expect(link.className).toContain('hover:border-(--sf-nav-text-hover)')
    })

    it('does not apply hover border class when active', () => {
      const item: NavItem = {
        id: '5c',
        label: 'Products',
        path: '/products',
        external: false,
        sortOrder: 0,
      }

      renderNavLink(item, ['/products'])

      const link = screen.getByRole('link', { name: 'Products' })
      expect(link.className).not.toContain('hover:border-(--sf-nav-text-hover)')
    })
  })

  describe('layout-stable border reserve', () => {
    it('always has border-b-2 border-transparent base for internal default links', () => {
      const item: NavItem = {
        id: '20',
        label: 'About',
        path: '/about',
        external: false,
        sortOrder: 0,
      }

      renderNavLink(item, ['/'])

      const link = screen.getByRole('link', { name: 'About' })
      expect(link.className).toContain('border-b-2')
      expect(link.className).toContain('border-transparent')
    })

    it('always has border-b-2 base even when active (accent overrides transparent)', () => {
      const item: NavItem = {
        id: '21',
        label: 'About',
        path: '/about',
        external: false,
        sortOrder: 0,
      }

      renderNavLink(item, ['/about'])

      const link = screen.getByRole('link', { name: 'About' })
      expect(link.className).toContain('border-b-2')
    })

    it('always has border-b-2 border-transparent base for external default links', () => {
      const item: NavItem = {
        id: '22',
        label: 'External',
        path: 'https://example.com',
        external: true,
        sortOrder: 0,
      }

      renderNavLink(item)

      const link = screen.getByRole('link', { name: 'External' })
      expect(link.className).toContain('border-b-2')
      expect(link.className).toContain('border-transparent')
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

  describe('default emphasis (items unchanged)', () => {
    it('renders identically when emphasis is undefined', () => {
      const item: NavItem = {
        id: '10',
        label: 'About',
        path: '/about',
        external: false,
        sortOrder: 0,
      }

      renderNavLink(item)

      const link = screen.getByRole('link', { name: 'About' })
      expect(link.className).not.toContain('rounded-full')
      expect(link.className).not.toContain('border-(--sf-accent)')
      expect(link.className).toContain('text-sm')
      expect(link.className).toContain('border-b-2')
      expect(link.className).toContain('border-transparent')
    })

    it('renders identically when emphasis is "default"', () => {
      const item: NavItem = {
        id: '11',
        label: 'Contact',
        path: '/contact',
        external: false,
        sortOrder: 0,
        emphasis: 'default',
      }

      renderNavLink(item)

      const link = screen.getByRole('link', { name: 'Contact' })
      expect(link.className).not.toContain('rounded-full')
      expect(link.className).not.toContain('border-(--sf-accent)')
      expect(link.className).toContain('text-sm')
      expect(link.className).toContain('border-b-2')
      expect(link.className).toContain('border-transparent')
    })
  })

  describe('emphasis: "cta" chip variant (desktop nav)', () => {
    it('renders as an accent-outlined rounded chip', () => {
      const item: NavItem = {
        id: '12',
        label: 'Request a Quote',
        path: '/quote-request',
        external: false,
        sortOrder: 0,
        emphasis: 'cta',
      }

      renderNavLink(item)

      const link = screen.getByRole('link', { name: 'Request a Quote' })
      expect(link.className).toContain('rounded-full')
      expect(link.className).toContain('border-(--sf-accent)')
      expect(link.className).toContain('text-(--sf-accent)')
      expect(link.className).toContain('hover:bg-[color-mix(in_srgb,var(--sf-accent)_12%,transparent)]')
    })

    it('applies filled state when active route', () => {
      const item: NavItem = {
        id: '13',
        label: 'Request a Quote',
        path: '/quote-request',
        external: false,
        sortOrder: 0,
        emphasis: 'cta',
      }

      renderNavLink(item, ['/quote-request'])

      const link = screen.getByRole('link', { name: 'Request a Quote' })
      expect(link.className).toContain('bg-(--sf-accent)')
      expect(link.className).toContain('text-(--sf-accent-text)')
    })

    it('does not apply filled state when route is inactive', () => {
      const item: NavItem = {
        id: '14',
        label: 'Request a Quote',
        path: '/quote-request',
        external: false,
        sortOrder: 0,
        emphasis: 'cta',
      }

      renderNavLink(item, ['/about'])

      const link = screen.getByRole('link', { name: 'Request a Quote' })
      expect(link.className).not.toContain('bg-(--sf-accent)')
      expect(link.className).not.toContain('text-(--sf-accent-text)')
    })

    it('renders chip for an external http CTA link', () => {
      const item: NavItem = {
        id: '15',
        label: 'External CTA',
        path: 'https://external.example.com',
        external: true,
        sortOrder: 0,
        emphasis: 'cta',
      }

      renderNavLink(item)

      const link = screen.getByRole('link', { name: 'External CTA' })
      expect(link.className).toContain('rounded-full')
      expect(link.className).toContain('border-(--sf-accent)')
      expect(link).toHaveAttribute('target', '_blank')
    })
  })

  describe('emphasis: "cta" drawer variant', () => {
    it('renders full-width chip in drawer mode', () => {
      const item: NavItem = {
        id: '16',
        label: 'Request a Quote',
        path: '/quote-request',
        external: false,
        sortOrder: 0,
        emphasis: 'cta',
      }

      renderNavLink(item, ['/'], 'drawer')

      const link = screen.getByRole('link', { name: 'Request a Quote' })
      expect(link.className).toContain('rounded-full')
      expect(link.className).toContain('border-(--sf-accent)')
      expect(link.className).toContain('w-full')
      expect(link.className).toContain('text-center')
    })

    it('applies filled active state in drawer mode', () => {
      const item: NavItem = {
        id: '17',
        label: 'Request a Quote',
        path: '/quote-request',
        external: false,
        sortOrder: 0,
        emphasis: 'cta',
      }

      renderNavLink(item, ['/quote-request'], 'drawer')

      const link = screen.getByRole('link', { name: 'Request a Quote' })
      expect(link.className).toContain('bg-(--sf-accent)')
      expect(link.className).toContain('text-(--sf-accent-text)')
    })

    it('renders default items unchanged in drawer mode', () => {
      const item: NavItem = {
        id: '18',
        label: 'About',
        path: '/about',
        external: false,
        sortOrder: 0,
      }

      renderNavLink(item, ['/'], 'drawer')

      const link = screen.getByRole('link', { name: 'About' })
      expect(link.className).not.toContain('rounded-full')
      expect(link.className).not.toContain('border-(--sf-accent)')
      expect(link.className).not.toContain('w-full')
    })
  })
})
