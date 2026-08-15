import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StorefrontConfigContext } from '@/shared/config/storefrontConfig.context'
import type { StorefrontConfig, ContactConfig } from '@/shared/types/StorefrontConfig'

vi.mock('@/shared/api/http/storefrontHttpClient', () => ({
  storefrontHttpClient: {
    post: vi.fn(),
  },
}))

vi.mock('@/shared/ui/components/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'
import { toast } from '@/shared/ui/components/toast'
import { ContactUsPage } from '../ContactUsPage'

const mockedPost = vi.mocked(storefrontHttpClient.post)

// --- Helpers ---

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function buildConfig(contact?: ContactConfig): StorefrontConfig {
  return {
    clientId: 'test-client',
    clientName: 'Test Store',
    currency: 'ZAR',
    locale: 'en-ZA',
    theme: {},
    nav: [],
    sections: [],
    branding: { name: 'Test Store' },
    contact,
  }
}

function renderContactPage(contact?: ContactConfig) {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <StorefrontConfigContext.Provider value={buildConfig(contact)}>
        <ContactUsPage />
      </StorefrontConfigContext.Provider>
    </QueryClientProvider>,
  )
}

describe('ContactUsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('WhatsApp row and phone relabel (C13)', () => {
    it('renders a dedicated WhatsApp row with wa.me href when whatsapp is present', () => {
      renderContactPage({
        phones: ['012 345 6789'],
        whatsapp: '+27 82 123 4567',
      })

      expect(screen.getByText('WhatsApp')).toBeInTheDocument()
      const waLink = screen.getByRole('link', { name: '+27 82 123 4567' })
      expect(waLink).toHaveAttribute('href', 'https://wa.me/27821234567')
      expect(waLink).toHaveAttribute('target', '_blank')
      expect(waLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('strips all non-digit characters from the wa.me href', () => {
      renderContactPage({
        phones: ['012 345 6789'],
        whatsapp: '+27 (82) 123-4567',
      })

      const waLink = screen.getByRole('link', { name: '+27 (82) 123-4567' })
      expect(waLink).toHaveAttribute('href', 'https://wa.me/27821234567')
    })

    it('relabels phones row to "Phone" when whatsapp is present', () => {
      renderContactPage({
        phones: ['012 345 6789'],
        whatsapp: '+27821234567',
      })

      expect(screen.getByText('Phone')).toBeInTheDocument()
      expect(screen.queryByText('Call / WhatsApp')).not.toBeInTheDocument()
    })

    it('keeps phones row labelled "Call / WhatsApp" when whatsapp is absent', () => {
      renderContactPage({
        phones: ['012 345 6789'],
      })

      expect(screen.getByText('Call / WhatsApp')).toBeInTheDocument()
      expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument()
    })

    it('does not render WhatsApp row when whatsapp is absent', () => {
      renderContactPage({
        phones: ['012 345 6789'],
        physicalAddress: '123 Main St',
      })

      expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument()
    })

    it('does not render WhatsApp row when whatsapp is blank', () => {
      renderContactPage({
        phones: ['012 345 6789'],
        whatsapp: '   ',
      })

      expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument()
      // Phone label stays as "Call / WhatsApp" since whatsapp is blank
      expect(screen.getByText('Call / WhatsApp')).toBeInTheDocument()
    })

    it('renders WhatsApp row even when phones are absent', () => {
      renderContactPage({
        whatsapp: '+27821234567',
      })

      expect(screen.getByText('WhatsApp')).toBeInTheDocument()
      const waLink = screen.getByRole('link', { name: '+27821234567' })
      expect(waLink).toHaveAttribute('href', 'https://wa.me/27821234567')
    })
  })

  describe('businessHours and responseSla rows (C13)', () => {
    it('renders Business hours row when businessHours is set', () => {
      renderContactPage({
        phones: ['012 345 6789'],
        businessHours: 'Mon–Fri 8am–5pm',
      })

      expect(screen.getByText('Business hours')).toBeInTheDocument()
      expect(screen.getByText('Mon–Fri 8am–5pm')).toBeInTheDocument()
    })

    it('renders Response time row when responseSla is set', () => {
      renderContactPage({
        phones: ['012 345 6789'],
        responseSla: 'Within 1 business day',
      })

      expect(screen.getByText('Response time')).toBeInTheDocument()
      expect(screen.getByText('Within 1 business day')).toBeInTheDocument()
    })

    it('renders both hours and SLA together', () => {
      renderContactPage({
        phones: ['012 345 6789'],
        businessHours: 'Mon–Fri 8am–5pm',
        responseSla: 'Within 1 business day',
      })

      expect(screen.getByText('Business hours')).toBeInTheDocument()
      expect(screen.getByText('Mon–Fri 8am–5pm')).toBeInTheDocument()
      expect(screen.getByText('Response time')).toBeInTheDocument()
      expect(screen.getByText('Within 1 business day')).toBeInTheDocument()
    })

    it('does not render hours/SLA rows when values are blank', () => {
      renderContactPage({
        phones: ['012 345 6789'],
        businessHours: '   ',
        responseSla: '',
      })

      expect(screen.queryByText('Business hours')).not.toBeInTheDocument()
      expect(screen.queryByText('Response time')).not.toBeInTheDocument()
    })
  })

  describe('isContactEmpty considers whatsapp', () => {
    it('renders page content when only whatsapp is provided', () => {
      renderContactPage({
        whatsapp: '+27821234567',
      })

      // Page renders normally — not the "coming soon" empty state
      expect(screen.getByText('Get in touch')).toBeInTheDocument()
      expect(screen.queryByText('Contact information coming soon')).not.toBeInTheDocument()
    })
  })

  describe('conditional form rendering (Req 4.1)', () => {
    it('renders the enquiry form when enquiryEmail is a valid email', () => {
      renderContactPage({
        enquiryEmail: 'info@store.co.za',
        phones: ['012 345 6789'],
        physicalAddress: '123 Main St',
      })

      expect(screen.getByText('Send us a message')).toBeInTheDocument()
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Phone')).toBeInTheDocument()
      expect(screen.getByLabelText(/Message/)).toBeInTheDocument()
    })

    it('does NOT render the form when enquiryEmail is absent', () => {
      renderContactPage({
        phones: ['012 345 6789'],
        physicalAddress: '123 Main St',
      })

      expect(screen.queryByText('Send us a message')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Name')).not.toBeInTheDocument()
    })

    it('does NOT render the form when enquiryEmail is blank', () => {
      renderContactPage({
        enquiryEmail: '',
        phones: ['012 345 6789'],
        physicalAddress: '123 Main St',
      })

      expect(screen.queryByText('Send us a message')).not.toBeInTheDocument()
    })

    it('does NOT render the form when enquiryEmail is an invalid email', () => {
      renderContactPage({
        enquiryEmail: 'not-an-email',
        phones: ['012 345 6789'],
        physicalAddress: '123 Main St',
      })

      expect(screen.queryByText('Send us a message')).not.toBeInTheDocument()
    })
  })

  describe('details-only layout (Req 4.4)', () => {
    it('renders contact details without form when enquiryEmail is absent', () => {
      renderContactPage({
        phones: ['012 345 6789'],
        physicalAddress: '123 Main St',
        businessHours: 'Mon-Fri 8am-5pm',
      })

      expect(screen.getByText('Get in touch')).toBeInTheDocument()
      expect(screen.getByText('012 345 6789')).toBeInTheDocument()
      expect(screen.getByText('123 Main St')).toBeInTheDocument()
      expect(screen.getByText('Mon-Fri 8am-5pm')).toBeInTheDocument()
      // No form rendered
      expect(screen.queryByRole('button', { name: /send message/i })).not.toBeInTheDocument()
    })
  })

  describe('phone input required attribute (Req 4.5)', () => {
    it('phone input has the required attribute', () => {
      renderContactPage({
        enquiryEmail: 'info@store.co.za',
        phones: ['012 345 6789'],
      })

      const phoneInput = screen.getByLabelText('Phone')
      expect(phoneInput).toHaveAttribute('required')
    })
  })

  describe('form submission (Req 4.2, 4.3)', () => {
    it('posts JSON to the enquiries endpoint on valid submit', async () => {
      const user = userEvent.setup()
      mockedPost.mockResolvedValue({ data: {} })

      renderContactPage({
        enquiryEmail: 'info@store.co.za',
        phones: ['012 345 6789'],
      })

      await user.type(screen.getByLabelText('Name'), 'Jane Doe')
      await user.type(screen.getByLabelText('Email'), 'jane@example.com')
      await user.type(screen.getByLabelText('Phone'), '0821234567')
      await user.type(screen.getByLabelText(/Message/), 'Hello, I have a question.')

      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(mockedPost).toHaveBeenCalledWith(
          '/storefront/enquiries',
          expect.objectContaining({
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '0821234567',
            message: 'Hello, I have a question.',
          }),
        )
      })
    })

    it('shows success state and clears form inputs after successful submit', async () => {
      const user = userEvent.setup()
      mockedPost.mockResolvedValue({ data: {} })

      renderContactPage({
        enquiryEmail: 'info@store.co.za',
        phones: ['012 345 6789'],
      })

      await user.type(screen.getByLabelText('Name'), 'Jane Doe')
      await user.type(screen.getByLabelText('Email'), 'jane@example.com')
      await user.type(screen.getByLabelText('Phone'), '0821234567')
      await user.type(screen.getByLabelText(/Message/), 'Hello!')

      await user.click(screen.getByRole('button', { name: /send message/i }))

      await waitFor(() => {
        expect(screen.getByText('Message sent')).toBeInTheDocument()
      })

      // Form inputs are not visible — success state replaces them
      expect(screen.queryByLabelText('Name')).not.toBeInTheDocument()
    })

    it('tells the user the submission failed instead of showing the success state', async () => {
      const user = userEvent.setup()
      const submitError = new Error('Network failure')
      mockedPost.mockRejectedValue(submitError)

      renderContactPage({
        enquiryEmail: 'info@store.co.za',
        phones: ['012 345 6789'],
      })

      await user.type(screen.getByLabelText('Name'), 'Jane Doe')
      await user.type(screen.getByLabelText('Email'), 'jane@example.com')
      await user.type(screen.getByLabelText('Phone'), '0821234567')
      await user.type(screen.getByLabelText(/Message/), 'Hello!')

      await user.click(screen.getByRole('button', { name: /send message/i }))

      // Logging moved to the global handler; what matters to the shopper is that
      // the form stays put and says so rather than flipping to "message sent".
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Something went wrong. Please try again.')
      })
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
    })
  })

  describe('honeypot field (Req 4.1, 3.2)', () => {
    it('honeypot input is present in the DOM', () => {
      renderContactPage({
        enquiryEmail: 'info@store.co.za',
        phones: ['012 345 6789'],
      })

      const honeypot = document.getElementById('website') as HTMLInputElement
      expect(honeypot).toBeInTheDocument()
    })

    it('honeypot container has sr-only class for visual hiding', () => {
      renderContactPage({
        enquiryEmail: 'info@store.co.za',
        phones: ['012 345 6789'],
      })

      const honeypot = document.getElementById('website') as HTMLInputElement
      const container = honeypot.closest('[aria-hidden="true"]')
      expect(container).toHaveClass('sr-only')
    })

    it('honeypot container has aria-hidden="true"', () => {
      renderContactPage({
        enquiryEmail: 'info@store.co.za',
        phones: ['012 345 6789'],
      })

      const honeypot = document.getElementById('website') as HTMLInputElement
      const container = honeypot.closest('[aria-hidden="true"]')
      expect(container).not.toBeNull()
      expect(container).toHaveAttribute('aria-hidden', 'true')
    })

    it('honeypot input has tabIndex={-1}', () => {
      renderContactPage({
        enquiryEmail: 'info@store.co.za',
        phones: ['012 345 6789'],
      })

      const honeypot = document.getElementById('website') as HTMLInputElement
      expect(honeypot).toHaveAttribute('tabindex', '-1')
    })

    it('honeypot input has autoComplete="off"', () => {
      renderContactPage({
        enquiryEmail: 'info@store.co.za',
        phones: ['012 345 6789'],
      })

      const honeypot = document.getElementById('website') as HTMLInputElement
      expect(honeypot).toHaveAttribute('autocomplete', 'off')
    })
  })
})
