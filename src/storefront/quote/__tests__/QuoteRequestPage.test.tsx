import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { createElement } from 'react'
import { useQuoteStore } from '../quoteStore'
import { QuoteRequestPage } from '../QuoteRequestPage'
import { StorefrontConfigContext } from '@/shared/config/storefrontConfig.context'
import type { StorefrontConfig } from '@/shared/types/StorefrontConfig'

vi.mock('../hooks/useSubmitQuoteRequest', () => ({
  useSubmitQuoteRequest: () => ({
    mutate: (_payload: unknown, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.()
    },
    isPending: false,
  }),
}))

const baseConfig: StorefrontConfig = {
  clientId: 'test',
  clientName: 'Test Store',
  currency: 'ZAR',
  locale: 'en-ZA',
  theme: {},
  nav: [],
  sections: [],
  branding: { name: 'Test Store' },
}

function createWrapper(config: StorefrontConfig = baseConfig) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(
        StorefrontConfigContext.Provider,
        { value: config },
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

  // Regression guard: this page must render the SHARED `Section` frame, not a
  // container of its own. It kept `max-w-5xl px-4` until 2026-08-04 and was the
  // worst-aligned surface on the site — content at x=144 against every section's
  // 64. The shell is a div: StorefrontLayout owns the single <main> landmark.
  //
  // The old guard here asserted `w-full`, against the page collapsing to its
  // content width when the quote list is empty. `Section`'s outer element is a
  // plain block div inside `<main class="flex flex-1 flex-col">`, whose default
  // align-items:stretch already makes it fill the width — which is why every
  // other page shell works without `w-full`. jsdom does no layout, so that part
  // is verified in a browser, not here.
  it('renders the shared storefront page frame at the default width', () => {
    const { container } = render(<QuoteRequestPage />, { wrapper: createWrapper() })

    expect(container.querySelector('main')).not.toBeInTheDocument()
    const shell = container.firstElementChild
    expect(shell).toHaveClass('py-12', 'px-6', 'sm:px-8')
    expect(shell?.firstElementChild).toHaveClass('mx-auto', 'max-w-6xl')
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

  // --- Reassurance panel tests (design C12) ---

  describe('reassurance panel (absent quote config)', () => {
    it('does NOT render the reassurance panel when config.quote is absent', () => {
      render(<QuoteRequestPage />, { wrapper: createWrapper() })

      expect(screen.queryByText('How it works')).not.toBeInTheDocument()
      expect(screen.queryByText('Turnaround:')).not.toBeInTheDocument()
      expect(screen.queryByText('Validity:')).not.toBeInTheDocument()
      expect(screen.queryByText('Deadline tighter?')).not.toBeInTheDocument()
    })

    it('page renders identically — headings and form intact, no panel', () => {
      render(<QuoteRequestPage />, { wrapper: createWrapper() })

      expect(screen.getByText('Request a Quote')).toBeInTheDocument()
      expect(screen.getByText('Your details')).toBeInTheDocument()
      expect(screen.getByText('Products to quote')).toBeInTheDocument()
    })
  })

  describe('reassurance panel (full config)', () => {
    const fullQuoteConfig: StorefrontConfig = {
      ...baseConfig,
      quote: {
        slaText: 'Quotes returned within 1 business day.',
        validityText: 'Every quote is held for 7 days.',
        steps: [
          'Send your product list',
          'We price it at live supplier rates',
          'Your quote arrives within 1 business day, valid for 7 days',
        ],
      },
      contact: {
        phones: ['+27 11 123 4567'],
        whatsapp: '+27821234567',
      },
    }

    it('renders the reassurance panel heading', () => {
      render(<QuoteRequestPage />, { wrapper: createWrapper(fullQuoteConfig) })

      expect(screen.getByText('How it works')).toBeInTheDocument()
    })

    it('renders numbered steps', () => {
      render(<QuoteRequestPage />, { wrapper: createWrapper(fullQuoteConfig) })

      expect(screen.getByText('Send your product list')).toBeInTheDocument()
      expect(screen.getByText('We price it at live supplier rates')).toBeInTheDocument()
      expect(
        screen.getByText('Your quote arrives within 1 business day, valid for 7 days'),
      ).toBeInTheDocument()
      // Step numbers
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('renders SLA and validity lines', () => {
      render(<QuoteRequestPage />, { wrapper: createWrapper(fullQuoteConfig) })

      expect(screen.getByText('Quotes returned within 1 business day.')).toBeInTheDocument()
      expect(screen.getByText('Every quote is held for 7 days.')).toBeInTheDocument()
    })

    it('renders escape hatch with Call and WhatsApp links', () => {
      render(<QuoteRequestPage />, { wrapper: createWrapper(fullQuoteConfig) })

      expect(screen.getByText('Deadline tighter?')).toBeInTheDocument()

      const callLink = screen.getByRole('link', { name: /call us/i })
      expect(callLink).toHaveAttribute('href', 'tel:+27 11 123 4567')

      const whatsappLink = screen.getByRole('link', { name: /whatsapp/i })
      expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/27821234567')
    })

    it('escape hatch links carry the focus recipe class', () => {
      render(<QuoteRequestPage />, { wrapper: createWrapper(fullQuoteConfig) })

      const callLink = screen.getByRole('link', { name: /call us/i })
      expect(callLink.className).toContain('focus-visible:ring-2')
      expect(callLink.className).toContain('focus-visible:ring-(--sf-ring)')

      const whatsappLink = screen.getByRole('link', { name: /whatsapp/i })
      expect(whatsappLink.className).toContain('focus-visible:ring-2')
      expect(whatsappLink.className).toContain('focus-visible:ring-(--sf-ring)')
    })
  })

  describe('reassurance panel (partial config)', () => {
    it('renders only SLA when steps and validity are absent', () => {
      const partialConfig: StorefrontConfig = {
        ...baseConfig,
        quote: {
          slaText: 'We respond within 2 hours.',
        },
      }

      render(<QuoteRequestPage />, { wrapper: createWrapper(partialConfig) })

      expect(screen.getByText('How it works')).toBeInTheDocument()
      expect(screen.getByText('We respond within 2 hours.')).toBeInTheDocument()
      expect(screen.queryByText('Validity:')).not.toBeInTheDocument()
    })

    it('renders steps without SLA/validity', () => {
      const partialConfig: StorefrontConfig = {
        ...baseConfig,
        quote: {
          steps: ['Step one', 'Step two'],
        },
      }

      render(<QuoteRequestPage />, { wrapper: createWrapper(partialConfig) })

      expect(screen.getByText('Step one')).toBeInTheDocument()
      expect(screen.getByText('Step two')).toBeInTheDocument()
      expect(screen.queryByText('Turnaround:')).not.toBeInTheDocument()
      expect(screen.queryByText('Validity:')).not.toBeInTheDocument()
    })

    it('does NOT render escape hatch when contact has no phone or whatsapp', () => {
      const noContactConfig: StorefrontConfig = {
        ...baseConfig,
        quote: {
          slaText: 'Fast turnaround.',
          steps: ['Step A'],
        },
        contact: {
          emails: ['info@example.com'],
        },
      }

      render(<QuoteRequestPage />, { wrapper: createWrapper(noContactConfig) })

      expect(screen.getByText('How it works')).toBeInTheDocument()
      expect(screen.queryByText('Deadline tighter?')).not.toBeInTheDocument()
    })

    it('renders only phone when whatsapp is absent', () => {
      const phoneOnlyConfig: StorefrontConfig = {
        ...baseConfig,
        quote: { slaText: 'Quick.' },
        contact: { phones: ['+27111234567'] },
      }

      render(<QuoteRequestPage />, { wrapper: createWrapper(phoneOnlyConfig) })

      expect(screen.getByText('Deadline tighter?')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /call us/i })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /whatsapp/i })).not.toBeInTheDocument()
    })

    it('renders only WhatsApp when phone is absent', () => {
      const waOnlyConfig: StorefrontConfig = {
        ...baseConfig,
        quote: { slaText: 'Quick.' },
        contact: { whatsapp: '+27821234567' },
      }

      render(<QuoteRequestPage />, { wrapper: createWrapper(waOnlyConfig) })

      expect(screen.getByText('Deadline tighter?')).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /call us/i })).not.toBeInTheDocument()
      expect(screen.getByRole('link', { name: /whatsapp/i })).toBeInTheDocument()
    })
  })

  describe('confirmation copy swap', () => {
    async function submitQuote(config: StorefrontConfig) {
      useQuoteStore.setState({
        items: [
          { variantId: 'v-1', productName: 'Widget', variantLabel: 'Default', quantity: 1 },
        ],
        itemCount: 1,
      })

      const user = userEvent.setup()
      render(<QuoteRequestPage />, { wrapper: createWrapper(config) })

      // Fill the required fields
      await user.type(screen.getByLabelText('Name'), 'Test User')
      await user.type(screen.getByLabelText('Email'), 'test@example.com')

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /request quote/i })
      await waitFor(() => expect(submitButton).not.toBeDisabled())
      await user.click(submitButton)
    }

    it('shows generic copy when config.quote is absent', async () => {
      await submitQuote(baseConfig)

      await waitFor(() => {
        expect(screen.getByText('Quote request submitted')).toBeInTheDocument()
      })
      expect(
        screen.getByText(
          "Thank you! We've received your quote request and will be in touch soon.",
        ),
      ).toBeInTheDocument()
    })

    it('replaces generic copy with slaText when configured', async () => {
      const slaConfig: StorefrontConfig = {
        ...baseConfig,
        quote: {
          slaText: 'Quotes returned within 1 business day.',
        },
      }

      await submitQuote(slaConfig)

      await waitFor(() => {
        expect(screen.getByText('Quote request submitted')).toBeInTheDocument()
      })
      expect(
        screen.getByText(
          "Thank you! We've received your quote request. Quotes returned within 1 business day.",
        ),
      ).toBeInTheDocument()
      // Generic "will be in touch soon" must NOT appear
      expect(
        screen.queryByText(/will be in touch soon/),
      ).not.toBeInTheDocument()
    })
  })
})
