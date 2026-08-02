import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AnnouncementBanner } from './AnnouncementBanner'

const mockUseStorefrontConfig = vi.fn()

vi.mock('@/shared/config/storefrontConfig.context', () => ({
  useStorefrontConfig: () => mockUseStorefrontConfig(),
}))

describe('AnnouncementBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- Default-preserving: both flags off → byte-identical to today ---

  it('renders banner text when enabled and text present (flags off — unchanged)', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: 'Free shipping on orders over R500!',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
        },
      },
    })

    render(<AnnouncementBanner />)

    expect(screen.getByRole('banner')).toHaveTextContent('Free shipping on orders over R500!')
  })

  it('renders nothing when enabled is false (unchanged)', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: false,
          text: 'This should not show',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
        },
      },
    })

    const { container } = render(<AnnouncementBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when text is empty and no slots enabled (unchanged)', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: '',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
        },
      },
    })

    const { container } = render(<AnnouncementBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('applies custom backgroundColor and textColor from config', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: 'Holiday special!',
          backgroundColor: '#ff0000',
          textColor: '#00ff00',
        },
      },
    })

    render(<AnnouncementBanner />)

    const banner = screen.getByRole('banner')
    expect(banner).toHaveStyle({ backgroundColor: '#ff0000' })
    expect(banner).toHaveStyle({ color: '#00ff00' })
  })

  it('falls back to default colours when not provided', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: 'Sale ends today!',
          backgroundColor: '',
          textColor: '',
        },
      },
    })

    render(<AnnouncementBanner />)

    const banner = screen.getByRole('banner')
    expect(banner).toHaveStyle({ backgroundColor: 'var(--sf-panel)' })
    expect(banner).toHaveStyle({ color: 'var(--sf-text)' })
  })

  // --- Message absent + contact only ---

  it('renders with contact only when message absent and showContact true', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: '',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
          showContact: true,
        },
      },
      contact: { phones: ['+27 11 123 4567'], whatsapp: '+27821234567' },
    })

    render(<AnnouncementBanner />)

    const banner = screen.getByRole('banner')
    expect(banner).toBeInTheDocument()
    expect(screen.getByText('+27 11 123 4567')).toBeInTheDocument()
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
  })

  // --- Message absent + social only ---

  it('renders with social only when message absent and showSocial true', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: '',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
          showSocial: true,
        },
      },
      footer: {
        socialLinks: [
          { id: '1', label: 'Facebook', to: 'https://facebook.com/test', icon: 'facebook' },
        ],
      },
    })

    render(<AnnouncementBanner />)

    const banner = screen.getByRole('banner')
    expect(banner).toBeInTheDocument()
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument()
  })

  // --- All three present ---

  it('renders all three zones when message, contact and social present', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: 'Summer sale!',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
          showContact: true,
          showSocial: true,
        },
      },
      contact: { phones: ['+27 11 123 4567'] },
      footer: {
        socialLinks: [
          { id: '1', label: 'Instagram', to: 'https://instagram.com/test', icon: 'instagram' },
        ],
      },
    })

    render(<AnnouncementBanner />)

    expect(screen.getByRole('banner')).toHaveTextContent('Summer sale!')
    expect(screen.getByText('+27 11 123 4567')).toBeInTheDocument()
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument()
  })

  // --- Everything absent → renders nothing (no empty strip) ---

  it('renders nothing when enabled but no message, contact empty, social empty', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: '',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
          showContact: true,
          showSocial: true,
        },
      },
      contact: {},
      footer: { socialLinks: [] },
    })

    const { container } = render(<AnnouncementBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  // --- Unmapped social icon skipped ---

  it('skips unmapped social icons and renders nothing when all are unmapped', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: '',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
          showSocial: true,
        },
      },
      footer: {
        socialLinks: [
          { id: '1', label: 'Mastodon', to: 'https://mastodon.social', icon: 'mastodon' },
          { id: '2', label: 'Threads', to: 'https://threads.net', icon: 'threads' },
        ],
      },
    })

    const { container } = render(<AnnouncementBanner />)
    // All icons unmapped → no social data → no message → renders nothing
    expect(container).toBeEmptyDOMElement()
  })

  it('renders mapped social icons and skips unmapped ones', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: '',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
          showSocial: true,
        },
      },
      footer: {
        socialLinks: [
          { id: '1', label: 'Facebook', to: 'https://facebook.com/test', icon: 'facebook' },
          { id: '2', label: 'Mastodon', to: 'https://mastodon.social', icon: 'mastodon' },
        ],
      },
    })

    render(<AnnouncementBanner />)

    expect(screen.getByLabelText('Facebook')).toBeInTheDocument()
    expect(screen.queryByLabelText('Mastodon')).not.toBeInTheDocument()
  })

  // --- md visibility classes ---

  it('applies hidden md:flex on contact slot', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: 'Promo',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
          showContact: true,
        },
      },
      contact: { phones: ['+27 11 123 4567'] },
    })

    render(<AnnouncementBanner />)

    const phoneLink = screen.getByText('+27 11 123 4567')
    const contactSlot = phoneLink.closest('[class*="hidden md:flex"]')
    expect(contactSlot).toBeInTheDocument()
    expect(contactSlot?.className).toContain('hidden')
    expect(contactSlot?.className).toContain('md:flex')
  })

  it('applies hidden md:flex on social slot', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: 'Promo',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
          showSocial: true,
        },
      },
      footer: {
        socialLinks: [
          { id: '1', label: 'LinkedIn', to: 'https://linkedin.com', icon: 'linkedin' },
        ],
      },
    })

    render(<AnnouncementBanner />)

    const socialLink = screen.getByLabelText('LinkedIn')
    const socialSlot = socialLink.closest('[class*="hidden md:flex"]')
    expect(socialSlot).toBeInTheDocument()
    expect(socialSlot?.className).toContain('hidden')
    expect(socialSlot?.className).toContain('md:flex')
  })

  // --- Focus recipe ---

  it('applies focus recipe classes to contact links', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: 'Promo',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
          showContact: true,
        },
      },
      contact: { phones: ['+27 11 123 4567'], whatsapp: '+27821234567' },
    })

    render(<AnnouncementBanner />)

    const phoneLink = screen.getByText('+27 11 123 4567').closest('a')!
    expect(phoneLink.className).toContain('focus-visible:ring-2')
    expect(phoneLink.className).toContain('focus-visible:ring-(--sf-ring)')
    expect(phoneLink.className).toContain('focus-visible:ring-offset-2')

    const whatsappLink = screen.getByText('WhatsApp').closest('a')!
    expect(whatsappLink.className).toContain('focus-visible:ring-2')
    expect(whatsappLink.className).toContain('focus-visible:ring-(--sf-ring)')
  })

  it('applies focus recipe classes to social links', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: 'Promo',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
          showSocial: true,
        },
      },
      footer: {
        socialLinks: [
          { id: '1', label: 'Facebook', to: 'https://facebook.com/test', icon: 'facebook' },
        ],
      },
    })

    render(<AnnouncementBanner />)

    const socialLink = screen.getByLabelText('Facebook')
    expect(socialLink.className).toContain('focus-visible:ring-2')
    expect(socialLink.className).toContain('focus-visible:ring-(--sf-ring)')
    expect(socialLink.className).toContain('focus-visible:ring-offset-2')
  })

  // --- Contact link hrefs ---

  it('renders tel: href for phone and wa.me href for whatsapp', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: '',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
          showContact: true,
        },
      },
      contact: { phones: ['+27 11 123 4567'], whatsapp: '+27 82 123 4567' },
    })

    render(<AnnouncementBanner />)

    const phoneLink = screen.getByText('+27 11 123 4567').closest('a')!
    expect(phoneLink).toHaveAttribute('href', 'tel:+27 11 123 4567')

    const whatsappLink = screen.getByText('WhatsApp').closest('a')!
    expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/27821234567')
  })

  // --- showContact true but no data → renders nothing ---

  it('renders nothing when showContact true but contact has no phone or whatsapp', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: '',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
          showContact: true,
        },
      },
      contact: { emails: ['info@test.com'] },
    })

    const { container } = render(<AnnouncementBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  // --- Focus recipe on banner links (task 1.6) ---

  it('contact links have the banner focus ring classes', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: '',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
          showContact: true,
        },
      },
      contact: { phones: ['+27 11 123 4567'], whatsapp: '+27 82 123 4567' },
      footer: {},
    })

    render(<AnnouncementBanner />)

    const phoneLink = screen.getByText('+27 11 123 4567').closest('a')!
    expect(phoneLink.className).toContain('focus-visible:ring-2')
    expect(phoneLink.className).toContain('focus-visible:ring-offset-[var(--banner-bg)]')

    const waLink = screen.getByText('WhatsApp').closest('a')!
    expect(waLink.className).toContain('focus-visible:ring-2')
    expect(waLink.className).toContain('focus-visible:ring-offset-[var(--banner-bg)]')
  })

  it('social links have the banner focus ring classes', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: '',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
          showSocial: true,
        },
      },
      contact: {},
      footer: {
        socialLinks: [
          { id: 's1', label: 'Facebook', to: 'https://facebook.com/store', icon: 'facebook' },
        ],
      },
    })

    render(<AnnouncementBanner />)

    const fbLink = screen.getByRole('link', { name: 'Facebook' })
    expect(fbLink.className).toContain('focus-visible:ring-2')
    expect(fbLink.className).toContain('focus-visible:ring-offset-[var(--banner-bg)]')
  })

  // --- Req 4.6: the bar must not consume mobile viewport without a message ---
  //
  // jsdom does no layout, so these assert on the wrapper's classes. Both utility
  // slots are `hidden md:flex`; with no message every child is hidden below `md`,
  // so the wrapper's own `py-2` would paint a bare coloured strip unless the
  // wrapper is hidden too. This is UVH's shipped configuration (cleared `text`,
  // both flags on), which is why it is asserted rather than left to the eye.

  it('hides the whole bar below md when it carries no message (Req 4.6)', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: '',
          backgroundColor: '#7a0019',
          textColor: '#ffffff',
          showContact: true,
          showSocial: true,
        },
      },
      contact: { phones: ['+27 11 555 0000'] },
      footer: {
        socialLinks: [
          { id: 's1', label: 'Facebook', to: 'https://facebook.com/store', icon: 'facebook' },
        ],
      },
    })

    render(<AnnouncementBanner />)

    const bar = screen.getByRole('banner')
    expect(bar.className).toContain('hidden')
    expect(bar.className).toContain('md:block')
  })

  it('keeps the bar visible at every width when a message is present (Req 4.6)', () => {
    mockUseStorefrontConfig.mockReturnValue({
      header: {
        announcement: {
          enabled: true,
          text: 'Nationwide delivery',
          backgroundColor: '#7a0019',
          textColor: '#ffffff',
          showContact: true,
        },
      },
      contact: { phones: ['+27 11 555 0000'] },
    })

    render(<AnnouncementBanner />)

    const bar = screen.getByRole('banner')
    expect(bar.className).not.toContain('hidden')
    expect(bar).toHaveTextContent('Nationwide delivery')
  })
})
