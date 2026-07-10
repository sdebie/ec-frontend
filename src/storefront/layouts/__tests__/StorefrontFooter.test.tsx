import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { StorefrontConfigContext } from '@/shared/config/storefrontConfig.context'
import { StorefrontFooter } from '../StorefrontFooter'
import type { StorefrontConfig } from '@/shared/types/StorefrontConfig'

const baseConfig: StorefrontConfig = {
  clientId: 'test-client',
  clientName: 'Test Store',
  currency: 'ZAR',
  locale: 'en-ZA',
  theme: {},
  nav: [],
  sections: [],
  branding: {
    name: 'My Store',
    logo: { src: '/logo.png', alt: 'Store Logo', width: 120, height: 40 },
  },
  footer: {
    description: 'Your trusted supplier of quality products.',
    footerCallout: { heading: 'Bulk Orders', body: 'Contact us for volume pricing.' },
    columns: [
      {
        heading: 'Products',
        links: [
          { id: '1', label: 'Category A', to: '/categories/a', external: false },
          { id: '2', label: 'External Link', to: 'https://example.com', external: true },
        ],
      },
      {
        heading: 'Company',
        links: [{ id: '3', label: 'About', to: '/about', external: false }],
      },
    ],
    socialLinks: [
      { id: 's1', label: 'Facebook', to: 'https://facebook.com/store', icon: 'facebook' },
      { id: 's2', label: 'Instagram', to: 'https://instagram.com/store', icon: 'instagram' },
      { id: 's3', label: 'Unknown Platform', to: 'https://unknown.com', icon: 'unknownplatform' },
    ],
    legalLinks: [
      { id: 'l1', label: 'Privacy Policy', to: '/privacy', external: false },
      { id: 'l2', label: 'External Terms', to: 'https://terms.com', external: true },
    ],
  },
}

function renderFooter(config: StorefrontConfig) {
  return render(
    <StorefrontConfigContext.Provider value={config}>
      <MemoryRouter>
        <StorefrontFooter />
      </MemoryRouter>
    </StorefrontConfigContext.Provider>
  )
}

describe('StorefrontFooter', () => {
  it('renders brand name and logo when config provided', () => {
    renderFooter(baseConfig)

    const logo = screen.getByRole('img', { name: 'Store Logo' })
    expect(logo).toHaveAttribute('src', '/logo.png')
    expect(logo).toHaveAttribute('width', '120')
    expect(logo).toHaveAttribute('height', '40')

    expect(screen.getByRole('heading', { name: 'My Store' })).toBeInTheDocument()
  })

  it('renders description and callout when present', () => {
    renderFooter(baseConfig)

    expect(screen.getByText('Your trusted supplier of quality products.')).toBeInTheDocument()
    expect(screen.getByText('Bulk Orders')).toBeInTheDocument()
    expect(screen.getByText('Contact us for volume pricing.')).toBeInTheDocument()
  })

  it('omits description and callout when absent', () => {
    const config: StorefrontConfig = {
      ...baseConfig,
      footer: {
        ...baseConfig.footer!,
        description: undefined,
        footerCallout: undefined,
      },
    }
    renderFooter(config)

    expect(screen.queryByText('Your trusted supplier of quality products.')).not.toBeInTheDocument()
    expect(screen.queryByText('Bulk Orders')).not.toBeInTheDocument()
    expect(screen.queryByText('Contact us for volume pricing.')).not.toBeInTheDocument()
  })

  it('renders correct number of navigation link columns', () => {
    renderFooter(baseConfig)

    expect(screen.getByRole('heading', { name: 'Products' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Company' })).toBeInTheDocument()
  })

  it('external links have target="_blank" and rel="noopener noreferrer"', () => {
    renderFooter(baseConfig)

    const externalLink = screen.getByRole('link', { name: 'External Link' })
    expect(externalLink).toHaveAttribute('target', '_blank')
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('internal links use React Router Link (no target attribute)', () => {
    renderFooter(baseConfig)

    const internalLink = screen.getByRole('link', { name: 'Category A' })
    expect(internalLink).not.toHaveAttribute('target')
    expect(internalLink).toHaveAttribute('href', '/categories/a')
  })

  it('legal links render in bottom bar', () => {
    renderFooter(baseConfig)

    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'External Terms' })).toBeInTheDocument()
  })

  it('copyright contains current year and branding.name', () => {
    renderFooter(baseConfig)

    const currentYear = new Date().getFullYear().toString()
    const copyright = screen.getByText(new RegExp(`© ${currentYear} My Store`))
    expect(copyright).toBeInTheDocument()
  })

  it('copyright falls back to clientName when branding.name is absent', () => {
    const config: StorefrontConfig = {
      ...baseConfig,
      branding: { name: '' },
    }
    renderFooter(config)

    const currentYear = new Date().getFullYear().toString()
    const copyright = screen.getByText(new RegExp(`© ${currentYear} Test Store`))
    expect(copyright).toBeInTheDocument()
  })

  it('renders nothing when config.footer is undefined in the config context', () => {
    const config: StorefrontConfig = {
      ...baseConfig,
      footer: undefined,
    }
    const { container } = renderFooter(config)

    expect(container.querySelector('footer')).not.toBeInTheDocument()
  })

  it('social icons render correct custom SVG components for known platforms', () => {
    renderFooter(baseConfig)

    const facebookLink = screen.getByRole('link', { name: 'Facebook' })
    expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/store')
    expect(facebookLink.querySelector('svg')).toBeInTheDocument()

    const instagramLink = screen.getByRole('link', { name: 'Instagram' })
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/store')
    expect(instagramLink.querySelector('svg')).toBeInTheDocument()
  })

  it('unknown social platform key renders Globe fallback icon', () => {
    renderFooter(baseConfig)

    const unknownLink = screen.getByRole('link', { name: 'Unknown Platform' })
    expect(unknownLink).toHaveAttribute('href', 'https://unknown.com')
    expect(unknownLink.querySelector('svg')).toBeInTheDocument()
  })

  it('social icons render once in DOM (no duplicate mobile/desktop elements)', () => {
    renderFooter(baseConfig)

    const socialLinks = baseConfig.footer!.socialLinks!
    socialLinks.forEach((link) => {
      const elements = screen.getAllByRole('link', { name: link.label })
      expect(elements).toHaveLength(1)
    })
  })
})
