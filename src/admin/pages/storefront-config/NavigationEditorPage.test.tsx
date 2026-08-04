import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NavigationEditorPage } from './NavigationEditorPage'

vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
  adminGraphqlClient: {
    request: vi.fn(),
  },
}))

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'

const mockRequest = vi.mocked(adminGraphqlClient.request)

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

function renderPage() {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <NavigationEditorPage />
    </QueryClientProvider>,
  )
}

describe('NavigationEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequest.mockResolvedValue({
      storeSettings: [
        {
          key: 'storefront.navigation',
          value: JSON.stringify({ items: [] }),
          description: 'Nav items',
        },
      ],
    })
  })

  it('adds a new row when "Add item" is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Navigation Editor')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /add item/i }))

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. Shop')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. /products')).toBeInTheDocument()
  })

  it('removes a row when the remove button is clicked', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Navigation Editor')).toBeInTheDocument()
    })

    // Add two items
    await user.click(screen.getByRole('button', { name: /add item/i }))
    await user.click(screen.getByRole('button', { name: /add item/i }))

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /remove item 1/i }))

    expect(screen.queryByText('Item 2')).not.toBeInTheDocument()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
  })

  it('calls saveStoreSettings with correct shape on save', async () => {
    const user = userEvent.setup()
    mockRequest
      .mockResolvedValueOnce({
        storeSettings: [
          {
            key: 'storefront.navigation',
            value: JSON.stringify({ items: [] }),
            description: 'Nav items',
          },
        ],
      })
      .mockResolvedValueOnce({ saveStoreSettings: [] })

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Navigation Editor')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /add item/i }))
    await user.type(screen.getByPlaceholderText('e.g. Shop'), 'Products')
    await user.type(screen.getByPlaceholderText('e.g. /products'), '/shop')

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      // The second call is the mutation (first was the initial query)
      const mutationCall = (mockRequest.mock.calls as unknown as [unknown, Record<string, unknown>][]).find(
        (call) => call[1] && (call[1] as Record<string, unknown>).storeSettingsDto,
      )
      expect(mutationCall).toBeDefined()

      const variables = mutationCall![1] as { storeSettingsDto: Array<{ key: string; value: string }> }
      expect(variables.storeSettingsDto).toHaveLength(1)
      expect(variables.storeSettingsDto[0].key).toBe('storefront.navigation')

      const parsed = JSON.parse(variables.storeSettingsDto[0].value)
      expect(parsed.items).toHaveLength(1)
      expect(parsed.items[0]).toMatchObject({
        label: 'Products',
        path: '/shop',
        external: false,
        sortOrder: 0,
      })
    })
  })

  it('shows validation errors and prevents save when label is empty', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Navigation Editor')).toBeInTheDocument()
    })

    // Add an item and only fill in path (leave label empty)
    await user.click(screen.getByRole('button', { name: /add item/i }))
    await user.type(screen.getByPlaceholderText('e.g. /products'), '/shop')

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText('Label is required')).toBeInTheDocument()
    })

    // Only the initial query should have been called — no mutation
    const mutationCalls = (mockRequest.mock.calls as unknown as [unknown, Record<string, unknown>][]).filter(
      (call) => call[1] && (call[1] as Record<string, unknown>).storeSettingsDto,
    )
    expect(mutationCalls).toHaveLength(0)
  })

  it('shows validation errors and prevents save when path is empty', async () => {
    const user = userEvent.setup()
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Navigation Editor')).toBeInTheDocument()
    })

    // Add an item and only fill in label (leave path empty)
    await user.click(screen.getByRole('button', { name: /add item/i }))
    await user.type(screen.getByPlaceholderText('e.g. Shop'), 'Products')

    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText('Path is required')).toBeInTheDocument()
    })

    // Only the initial query should have been called — no mutation
    const mutationCalls = (mockRequest.mock.calls as unknown as [unknown, Record<string, unknown>][]).filter(
      (call) => call[1] && (call[1] as Record<string, unknown>).storeSettingsDto,
    )
    expect(mutationCalls).toHaveLength(0)
  })
})
