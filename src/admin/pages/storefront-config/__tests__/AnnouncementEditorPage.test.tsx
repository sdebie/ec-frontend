import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnnouncementEditorPage } from '../AnnouncementEditorPage'

// --- Mocks ---

const mockRequest = vi.fn()

vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
  adminGraphqlClient: {
    request: (...args: unknown[]) => mockRequest(...args),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// --- Helpers ---

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

const defaultSettings = {
  storeSettings: [
    {
      key: 'storefront.header',
      value: JSON.stringify({
        announcement: {
          enabled: false,
          text: '',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
        },
      }),
      description: 'Storefront header config',
    },
  ],
}

function renderPage(settingsResponse = defaultSettings) {
  mockRequest.mockResolvedValueOnce(settingsResponse)
  const queryClient = createQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <AnnouncementEditorPage />
    </QueryClientProvider>,
  )
}

// --- Tests ---

describe('AnnouncementEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('live preview updates with unsaved values (Requirement 7.4)', () => {
    it('updates preview text when typing in the text input', async () => {
      const user = userEvent.setup()
      renderPage()

      // Wait for loading to finish
      await waitFor(() => {
        expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
      })

      const textInput = screen.getByLabelText('Announcement Text')
      await user.type(textInput, 'Free shipping today!')

      // Preview should show the typed text immediately (unsaved)
      expect(screen.getByText('Free shipping today!')).toBeInTheDocument()
    })

    it('updates preview background colour when picker changes', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
      })

      const bgColorInput = document.getElementById('bg-color') as HTMLInputElement
      expect(bgColorInput).not.toBeNull()

      // Simulate color change via fireEvent (color inputs don't work well with userEvent)
      const { fireEvent } = await import('@testing-library/react')
      fireEvent.input(bgColorInput, { target: { value: '#ff0000' } })

      // The preview div should have the new background color
      const previewText = screen.getByText('Preview text will appear here')
      expect(previewText.closest('div')).toHaveStyle({ backgroundColor: '#ff0000' })
    })

    it('updates preview text colour when picker changes', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
      })

      const textColorInput = document.getElementById('text-color') as HTMLInputElement
      expect(textColorInput).not.toBeNull()

      const { fireEvent } = await import('@testing-library/react')
      fireEvent.input(textColorInput, { target: { value: '#00ff00' } })

      const previewText = screen.getByText('Preview text will appear here')
      expect(previewText.closest('div')).toHaveStyle({ color: '#00ff00' })
    })
  })

  describe('save calls updateSetting with correct key and JSON (Requirement 7.1)', () => {
    it('calls updateSetting with storefront.header key and announcement JSON on save', async () => {
      const user = userEvent.setup()
      // Initial query fetch
      mockRequest.mockResolvedValueOnce(defaultSettings)
      // Mutation response
      mockRequest.mockResolvedValueOnce({
        updateSetting: {
          key: 'storefront.header',
          value: '{}',
          description: null,
        },
      })
      // Refetch after invalidation
      mockRequest.mockResolvedValueOnce(defaultSettings)

      const queryClient = createQueryClient()
      render(
        <QueryClientProvider client={queryClient}>
          <AnnouncementEditorPage />
        </QueryClientProvider>,
      )

      await waitFor(() => {
        expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
      })

      // Toggle enabled on
      const toggle = screen.getByRole('switch')
      await user.click(toggle)

      // Type announcement text
      const textInput = screen.getByLabelText('Announcement Text')
      await user.type(textInput, 'Big sale!')

      // Click save
      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      // Wait for the mutation call to happen (at least 2 calls: initial query + mutation)
      await waitFor(() => {
        expect(mockRequest.mock.calls.length).toBeGreaterThanOrEqual(2)
      })

      const mutationCall = mockRequest.mock.calls[1]
      const mutationVariables = mutationCall[1] as { key: string; value: string }

      expect(mutationVariables.key).toBe('storefront.header')

      const parsedValue = JSON.parse(mutationVariables.value)
      expect(parsedValue).toEqual({
        announcement: {
          enabled: true,
          text: 'Big sale!',
          backgroundColor: '#1a1f35',
          textColor: '#ffffff',
        },
      })
    })
  })

  describe('fields remain editable when toggle is off (Requirement 7.5)', () => {
    it('text input is editable when toggle is disabled', async () => {
      const user = userEvent.setup()
      renderPage()

      await waitFor(() => {
        expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
      })

      // Toggle should be off (default state)
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-checked', 'false')

      // Text input should still be editable
      const textInput = screen.getByLabelText('Announcement Text')
      await user.type(textInput, 'Draft message')
      expect(textInput).toHaveValue('Draft message')
    })

    it('colour pickers are editable when toggle is disabled', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
      })

      // Toggle should be off
      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-checked', 'false')

      // Background colour picker should be editable
      const bgColorInput = document.getElementById('bg-color') as HTMLInputElement
      expect(bgColorInput).not.toBeDisabled()

      // Text colour picker should be editable
      const textColorInput = document.getElementById('text-color') as HTMLInputElement
      expect(textColorInput).not.toBeDisabled()

      // Change values
      const { fireEvent } = await import('@testing-library/react')
      fireEvent.input(bgColorInput, { target: { value: '#333333' } })
      fireEvent.input(textColorInput, { target: { value: '#eeeeee' } })

      expect(bgColorInput.value).toBe('#333333')
      expect(textColorInput.value).toBe('#eeeeee')
    })

    it('save button is available when toggle is off', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.queryByText('Loading announcement settings…')).not.toBeInTheDocument()
      })

      const toggle = screen.getByRole('switch')
      expect(toggle).toHaveAttribute('aria-checked', 'false')

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      expect(saveButton).not.toBeDisabled()
    })
  })
})
