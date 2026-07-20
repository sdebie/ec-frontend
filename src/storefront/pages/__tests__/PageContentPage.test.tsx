import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PageContentPage } from '../PageContentPage'

const mockUsePublicPageContent = vi.fn()

vi.mock('@/storefront/hooks/usePublicPageContent', () => ({
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
