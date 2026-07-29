import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { createElement } from 'react'
import { useQuoteStore } from '../quoteStore'
import { QuoteDetailsForm } from '../components/QuoteDetailsForm'

// Mock storefrontHttpClient to control submit behaviour
vi.mock('@/shared/api/http/storefrontHttpClient', () => ({
  storefrontHttpClient: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

vi.mock('@/shared/ui/components/toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, null, children),
    )
}

describe('QuoteDetailsForm', () => {
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useQuoteStore.setState({
      items: [
        { variantId: 'v-1', productName: 'Widget', variantLabel: 'Red', quantity: 2 },
      ],
      itemCount: 2,
    })
  })

  it('shows Name required validation message', async () => {
    render(<QuoteDetailsForm onSuccess={mockOnSuccess} />, { wrapper: createWrapper() })

    const nameInput = screen.getByLabelText('Name')
    fireEvent.blur(nameInput)

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })
  })

  it('shows Email required validation message', async () => {
    render(<QuoteDetailsForm onSuccess={mockOnSuccess} />, { wrapper: createWrapper() })

    const emailInput = screen.getByLabelText('Email')
    fireEvent.blur(emailInput)

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
  })

  it('shows email format validation message for invalid email', async () => {
    render(<QuoteDetailsForm onSuccess={mockOnSuccess} />, { wrapper: createWrapper() })

    const emailInput = screen.getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } })
    fireEvent.blur(emailInput)

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  it('honeypot field is present in the DOM (off-screen but rendered)', () => {
    render(<QuoteDetailsForm onSuccess={mockOnSuccess} />, { wrapper: createWrapper() })

    // The honeypot input should exist in the DOM even though it's positioned off-screen
    const honeypotInput = document.getElementById('quote-website')
    expect(honeypotInput).toBeInTheDocument()
    expect(honeypotInput).toHaveAttribute('tabindex', '-1')
    expect(honeypotInput).toHaveAttribute('autocomplete', 'off')
  })

  it('submit success clears store and calls onSuccess', async () => {
    vi.mocked(storefrontHttpClient.post).mockResolvedValue({ data: {} })

    render(<QuoteDetailsForm onSuccess={mockOnSuccess} />, { wrapper: createWrapper() })

    // Fill in required fields
    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.blur(nameInput)
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.blur(emailInput)

    // Wait for validation to pass and button to become enabled
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /request quote/i })
      expect(submitButton).not.toBeDisabled()
    })

    const submitButton = screen.getByRole('button', { name: /request quote/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(storefrontHttpClient.post).toHaveBeenCalledWith(
        '/storefront/quote-requests',
        expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          items: [{ variantId: 'v-1', quantity: 2 }],
        }),
      )
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    // Verify store is cleared (useSubmitQuoteRequest clears on success)
    const { items } = useQuoteStore.getState()
    expect(items).toHaveLength(0)
  })
})
