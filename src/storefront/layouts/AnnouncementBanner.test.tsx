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

  it('renders banner text when enabled is true and text is non-empty', () => {
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

  it('renders nothing when enabled is false', () => {
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

  it('renders nothing when text is empty string', () => {
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
})
