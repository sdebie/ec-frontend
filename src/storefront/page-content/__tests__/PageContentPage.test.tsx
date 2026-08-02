import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PageContentPage } from '../PageContentPage'

const mockUsePublicPageContent = vi.fn()

vi.mock('@/storefront/page-content/hooks/usePublicPageContent', () => ({
  usePublicPageContent: (...args: unknown[]) => mockUsePublicPageContent(...args),
}))

vi.mock('@/storefront/pages/NotFoundPage', () => ({
  NotFoundPage: () => <div data-testid="not-found-page">404 — Page not found</div>,
}))

function renderPage(slug = 'privacy-policy') {
  return render(
    <MemoryRouter>
      <PageContentPage slug={slug} />
    </MemoryRouter>
  )
}

describe('PageContentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title, "Last updated" date, and content for a published page', () => {
    mockUsePublicPageContent.mockReturnValue({
      data: {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        content: '<p>We respect your privacy.</p>',
        publishedAt: '2024-06-15T10:00:00Z',
      },
      isLoading: false,
      error: null,
      isNotFound: false,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Privacy Policy')
    expect(screen.getByText(/Last updated:/)).toHaveTextContent('Last updated: 15 Jun 2024')
    expect(screen.getByText('We respect your privacy.')).toBeInTheDocument()
  })

  it('renders NotFoundPage when API returns 404', () => {
    mockUsePublicPageContent.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Not found'),
      isNotFound: true,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByTestId('not-found-page')).toBeInTheDocument()
  })

  it('renders retry card on network error (non-404)', () => {
    mockUsePublicPageContent.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network Error'),
      isNotFound: false,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByText('Something went wrong loading this page.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('renders skeleton placeholder while loading', () => {
    mockUsePublicPageContent.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isNotFound: false,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByRole('generic', { busy: true })).toBeInTheDocument()
  })

  it('splits content on <h2> into numbered sections, lifting authored numbers into badges', () => {
    mockUsePublicPageContent.mockReturnValue({
      data: {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        content:
          '<p><strong>Intro copy.</strong></p>' +
          '<h2>1. About us</h2><p>Who we are.</p>' +
          '<h2>2. Orders and contract</h2><ul><li><p>Bullet one.</p></li></ul>',
        publishedAt: '2024-06-15T10:00:00Z',
      },
      isLoading: false,
      error: null,
      isNotFound: false,
      refetch: vi.fn(),
    })

    renderPage()

    // Authored numbers move into the badges; headings keep the wording only.
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'About us' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Orders and contract' })
    ).toBeInTheDocument()
    // Section bodies and intro copy are preserved verbatim.
    expect(screen.getByText('Intro copy.')).toBeInTheDocument()
    expect(screen.getByText('Who we are.')).toBeInTheDocument()
    expect(screen.getByText('Bullet one.')).toBeInTheDocument()
  })

  it('numbers unnumbered <h2> headings by position', () => {
    mockUsePublicPageContent.mockReturnValue({
      data: {
        slug: 'delivery-and-returns',
        title: 'Delivery & Returns',
        content: '<h2>Shipping</h2><p>We ship.</p><h2>Returns</h2><p>We accept returns.</p>',
        publishedAt: '2024-06-15T10:00:00Z',
      },
      isLoading: false,
      error: null,
      isNotFound: false,
      refetch: vi.fn(),
    })

    renderPage('delivery-and-returns')

    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Shipping' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Returns' })).toBeInTheDocument()
  })

  it('renders content without <h2> sections as plain prose in the card body', () => {
    mockUsePublicPageContent.mockReturnValue({
      data: {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        content: '<p>Placeholder privacy policy.</p>',
        publishedAt: '2024-06-15T10:00:00Z',
      },
      isLoading: false,
      error: null,
      isNotFound: false,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByText('Placeholder privacy policy.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })

  it('renders the Legal & Privacy eyebrow in the document header', () => {
    mockUsePublicPageContent.mockReturnValue({
      data: {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        content: '<p>We respect your privacy.</p>',
        publishedAt: '2024-06-15T10:00:00Z',
      },
      isLoading: false,
      error: null,
      isNotFound: false,
      refetch: vi.fn(),
    })

    renderPage()

    expect(screen.getByText('Legal & Privacy')).toBeInTheDocument()
  })

  it('does not render <script> tags in content (DOMPurify sanitisation)', () => {
    mockUsePublicPageContent.mockReturnValue({
      data: {
        slug: 'terms-and-conditions',
        title: 'Terms & Conditions',
        content: '<script>alert("xss")</script><p>Safe content</p>',
        publishedAt: '2024-01-10T08:00:00Z',
      },
      isLoading: false,
      error: null,
      isNotFound: false,
      refetch: vi.fn(),
    })

    const { container } = renderPage('terms-and-conditions')

    expect(container.querySelector('script')).toBeNull()
    expect(screen.getByText('Safe content')).toBeInTheDocument()
  })
})
