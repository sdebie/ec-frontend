import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { createElement } from 'react'
import { useQuoteStore } from '../quoteStore'
import { QuoteRequestPage } from '../QuoteRequestPage'
import { StorefrontConfigContext } from '@/shared/config/storefrontConfig.context'
import type { StorefrontConfig } from '@/shared/types/StorefrontConfig'

const mockConfig: StorefrontConfig = {
  clientId: 'test',
  clientName: 'Test Store',
  currency: 'ZAR',
  locale: 'en-ZA',
  theme: {},
  nav: [],
  sections: [],
  branding: { name: 'Test Store' },
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(
        StorefrontConfigContext.Provider,
        { value: mockConfig },
        createElement(MemoryRouter, null, children),
      ),
    )
}

describe('QuoteRequestPage', () => {
  beforeEach(() => {
    useQuoteStore.setState({ items: [], itemCount: 0 })
  })

  it('shows empty state text when quote list is empty', () => {
    render(<QuoteRequestPage />, { wrapper: createWrapper() })

    expect(
      screen.getByText('No products in your quote list yet.'),
    ).toBeInTheDocument()
  })

  // Regression guard: the page shell must carry w-full — the storefront layout
  // centres children by content width, so without it the whole page shrinks
  // when the quote list is empty (jsdom does no layout; assert the class).
  // The shell is a div: StorefrontLayout owns the single <main> landmark.
  it('page shell always takes full width up to its max-width cap', () => {
    const { container } = render(<QuoteRequestPage />, { wrapper: createWrapper() })

    expect(container.querySelector('main')).not.toBeInTheDocument()
    const shell = container.firstElementChild
    expect(shell?.className).toContain('w-full')
    expect(shell?.className).toContain('max-w-5xl')
  })

  // Regression guard: the REAL QuoteProductSearch must be mounted and always
  // visible — a placeholder once shipped past the suite because nothing
  // asserted this, and the toggle button was later removed as friction.
  it('always shows the real product search above the list', () => {
    render(<QuoteRequestPage />, { wrapper: createWrapper() })

    expect(
      screen.getByPlaceholderText('Search products to add...'),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /add products/i }),
    ).not.toBeInTheDocument()
  })

  it('renders QuoteList items when quoteStore has items', () => {
    useQuoteStore.setState({
      items: [
        {
          variantId: 'v-1',
          productName: 'Widget Pro',
          variantLabel: 'Blue / Medium',
          quantity: 2,
        },
        {
          variantId: 'v-2',
          productName: 'Gadget Lite',
          variantLabel: 'Red / Small',
          quantity: 1,
        },
      ],
      itemCount: 3,
    })

    render(<QuoteRequestPage />, { wrapper: createWrapper() })

    expect(screen.getByText('Widget Pro')).toBeInTheDocument()
    expect(screen.getByText('Gadget Lite')).toBeInTheDocument()
    // Empty state text should NOT appear
    expect(
      screen.queryByText('No products in your quote list yet.'),
    ).not.toBeInTheDocument()
  })

  it('submit button is disabled when quote list is empty', () => {
    render(<QuoteRequestPage />, { wrapper: createWrapper() })

    const submitButton = screen.getByRole('button', { name: /request quote/i })
    expect(submitButton).toBeDisabled()
  })

  it('submit button is disabled when form is invalid (no name/email filled)', () => {
    // Add items so the list isn't empty, but leave form blank
    useQuoteStore.setState({
      items: [
        {
          variantId: 'v-1',
          productName: 'Widget Pro',
          variantLabel: 'Blue / Medium',
          quantity: 1,
        },
      ],
      itemCount: 1,
    })

    render(<QuoteRequestPage />, { wrapper: createWrapper() })

    const submitButton = screen.getByRole('button', { name: /request quote/i })
    expect(submitButton).toBeDisabled()
  })
})
