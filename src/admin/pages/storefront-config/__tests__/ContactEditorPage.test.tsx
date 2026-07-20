import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ContactEditorPage } from '../ContactEditorPage'

// --- Mocks ---

const mockMutate = vi.fn()

vi.mock('@/admin/hooks/settings/useStoreSettings', () => ({
  useStoreSettings: vi.fn(),
}))

vi.mock('@/admin/hooks/settings/useUpdateSetting', () => ({
  useUpdateSetting: vi.fn(() => ({
    mutate: mockMutate,
    isPending: false,
  })),
}))

vi.mock('@/shared/auth/adminAuthStore', () => ({
  useAdminAuthStore: vi.fn(),
}))

vi.mock('@/admin/context/BreadcrumbContext', () => ({
  useBreadcrumb: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { useStoreSettings } from '@/admin/hooks/settings/useStoreSettings'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'

// --- Test Data ---

const contactConfig = {
  enquiryEmail: 'enquiries@store.co.za',
  emails: ['info@store.co.za', 'support@store.co.za'],
  phones: ['+27123456789'],
  landline: '+27219876543',
  physicalAddress: '123 Main Street\nCape Town\n8001',
  businessHours: 'Mon-Fri 08:00-17:00',
  responseSla: 'We respond within 24 hours',
  mapUrl: 'https://www.google.com/maps/place/Cape+Town',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=abc123',
}

const mockSettings = [
  {
    key: 'storefront.contact',
    value: JSON.stringify(contactConfig),
    description: null,
  },
]

// --- Helpers ---

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

function setupMocks({ role = 'SUPER_ADMIN', settings = mockSettings }: { role?: string; settings?: typeof mockSettings } = {}) {
  vi.mocked(useAdminAuthStore).mockImplementation((selector: any) =>
    selector({ role }),
  )
  vi.mocked(useStoreSettings).mockReturnValue({
    data: settings,
    isLoading: false,
  } as any)
}

function renderPage() {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <ContactEditorPage />
    </QueryClientProvider>,
  )
}

// --- Tests ---

describe('ContactEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('editor loads existing values', () => {
    it('renders form fields with parsed values from the storefront.contact setting', async () => {
      setupMocks()
      renderPage()

      await waitFor(() => {
        expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
      })

      expect(screen.getByDisplayValue('support@store.co.za')).toBeInTheDocument()
      expect(screen.getByDisplayValue('+27123456789')).toBeInTheDocument()
      expect(screen.getByDisplayValue('+27219876543')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Mon-Fri 08:00-17:00')).toBeInTheDocument()
      expect(screen.getByDisplayValue('We respond within 24 hours')).toBeInTheDocument()
      expect(screen.getByDisplayValue('https://www.google.com/maps/place/Cape+Town')).toBeInTheDocument()
      expect(screen.getByDisplayValue('https://www.google.com/maps/embed?pb=abc123')).toBeInTheDocument()
    })
  })

  describe('save sends the correct key and stringified value', () => {
    it('calls mutate with key storefront.contact and JSON.stringify of the config', async () => {
      const user = userEvent.setup()
      setupMocks({
        settings: [
          {
            key: 'storefront.contact',
            value: JSON.stringify({ emails: ['test@example.com'], phones: ['+27000000'] }),
            description: null,
          },
        ],
      })
      renderPage()

      // Wait for the form to load with values
      await waitFor(() => {
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
      })

      // Submit the form
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1)
      })

      const callArgs = mockMutate.mock.calls[0]
      expect(callArgs[0]).toEqual({
        key: 'storefront.contact',
        value: JSON.stringify({ emails: ['test@example.com'], phones: ['+27000000'] }),
      })
    })
  })

  describe('invalid email prevents save', () => {
    it('does not call mutate when an email field contains an invalid email', async () => {
      const user = userEvent.setup()
      setupMocks({
        settings: [
          {
            key: 'storefront.contact',
            value: JSON.stringify({ emails: ['not-an-email'], phones: [] }),
            description: null,
          },
        ],
      })
      renderPage()

      await waitFor(() => {
        expect(screen.getByDisplayValue('not-an-email')).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument()
      })

      expect(mockMutate).not.toHaveBeenCalled()
    })
  })

  describe('invalid mapEmbedUrl prevents save', () => {
    it('does not call mutate when mapEmbedUrl is not an approved embed URL', async () => {
      const user = userEvent.setup()
      setupMocks({
        settings: [
          {
            key: 'storefront.contact',
            value: JSON.stringify({ emails: [], phones: [] }),
            description: null,
          },
        ],
      })
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Contact Settings')).toBeInTheDocument()
      })

      // Type an invalid embed URL
      const mapEmbedInput = screen.getByPlaceholderText('https://www.google.com/maps/embed?pb=...')
      await user.type(mapEmbedInput, 'https://evil.com/embed')

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('Must be an approved map embed URL (Google Maps or OpenStreetMap)')).toBeInTheDocument()
      })

      expect(mockMutate).not.toHaveBeenCalled()
    })
  })

  describe('VIEWER sees disabled fields', () => {
    it('renders all inputs as disabled when role is VIEWER', async () => {
      setupMocks({ role: 'VIEWER' })
      renderPage()

      await waitFor(() => {
        expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
      })

      // All inputs should be disabled
      const inputs = screen.getAllByRole('textbox')
      inputs.forEach((input) => {
        expect(input).toBeDisabled()
      })
    })
  })

  describe('VIEWER does not see Save button', () => {
    it('does not render a Save button when role is VIEWER', async () => {
      setupMocks({ role: 'VIEWER' })
      renderPage()

      await waitFor(() => {
        expect(screen.getByDisplayValue('info@store.co.za')).toBeInTheDocument()
      })

      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument()
    })
  })

  // --- Enquiry Email field tests (Req 5.1, 5.2, 5.3) ---

  describe('enquiryEmail field renders with existing value', () => {
    it('shows the enquiryEmail from settings in the Enquiry Form fieldset', async () => {
      setupMocks()
      renderPage()

      await waitFor(() => {
        expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument()
      })

      // The fieldset legend should be visible
      expect(screen.getByText('Enquiry Form')).toBeInTheDocument()
      // The label should be visible
      expect(screen.getByText('Enquiry recipient email')).toBeInTheDocument()
    })
  })

  describe('enquiryEmail is included in the save payload', () => {
    it('persists enquiryEmail in the JSON when saving', async () => {
      const user = userEvent.setup()
      setupMocks({
        settings: [
          {
            key: 'storefront.contact',
            value: JSON.stringify({
              enquiryEmail: 'old@store.co.za',
              emails: ['info@store.co.za'],
              phones: ['+27000000'],
            }),
            description: null,
          },
        ],
      })
      renderPage()

      await waitFor(() => {
        expect(screen.getByDisplayValue('old@store.co.za')).toBeInTheDocument()
      })

      // Clear and type new enquiry email
      const enquiryInput = screen.getByDisplayValue('old@store.co.za')
      await user.clear(enquiryInput)
      await user.type(enquiryInput, 'new@store.co.za')

      // Submit
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1)
      })

      const callArgs = mockMutate.mock.calls[0]
      expect(callArgs[0].key).toBe('storefront.contact')
      const parsed = JSON.parse(callArgs[0].value)
      expect(parsed.enquiryEmail).toBe('new@store.co.za')
    })
  })

  describe('VIEWER: enquiryEmail field is disabled', () => {
    it('renders enquiryEmail input as disabled for VIEWER role', async () => {
      setupMocks({ role: 'VIEWER' })
      renderPage()

      await waitFor(() => {
        expect(screen.getByDisplayValue('enquiries@store.co.za')).toBeInTheDocument()
      })

      const enquiryInput = screen.getByDisplayValue('enquiries@store.co.za')
      expect(enquiryInput).toBeDisabled()
    })
  })

  describe('enquiryEmail validation rejects malformed email', () => {
    it('does not submit when enquiryEmail is a malformed email address', async () => {
      const user = userEvent.setup()
      setupMocks({
        settings: [
          {
            key: 'storefront.contact',
            value: JSON.stringify({ enquiryEmail: '', emails: [], phones: [] }),
            description: null,
          },
        ],
      })
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Contact Settings')).toBeInTheDocument()
      })

      // Type an invalid email in the enquiry field
      const enquiryInput = screen.getByPlaceholderText('e.g. info@store.co.za')
      await user.type(enquiryInput, 'not-a-valid-email')

      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('Must be a valid email address or empty to disable')).toBeInTheDocument()
      })

      expect(mockMutate).not.toHaveBeenCalled()
    })
  })

  describe('enquiryEmail allows empty value', () => {
    it('submits successfully when enquiryEmail is empty (disables the enquiry form)', async () => {
      const user = userEvent.setup()
      setupMocks({
        settings: [
          {
            key: 'storefront.contact',
            value: JSON.stringify({
              enquiryEmail: 'old@store.co.za',
              emails: ['info@store.co.za'],
              phones: ['+27000000'],
            }),
            description: null,
          },
        ],
      })
      renderPage()

      await waitFor(() => {
        expect(screen.getByDisplayValue('old@store.co.za')).toBeInTheDocument()
      })

      // Clear the enquiry email to make it empty
      const enquiryInput = screen.getByDisplayValue('old@store.co.za')
      await user.clear(enquiryInput)

      // Submit
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(1)
      })

      // enquiryEmail should not be in the persisted config (empty is omitted by formToContactConfig)
      const callArgs = mockMutate.mock.calls[0]
      const parsed = JSON.parse(callArgs[0].value)
      expect(parsed.enquiryEmail).toBeUndefined()
    })
  })
})
