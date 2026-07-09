import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
  adminGraphqlClient: {
    request: vi.fn(),
  },
}))

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { useCategories } from '../useCategories'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls GraphQL getCategories via adminGraphqlClient (not REST /admin/categories)', async () => {
    const mockResponse = {
      getCategories: {
        content: [
          { id: '1', name: 'Electronics' },
          { id: '2', name: 'Clothing' },
        ],
      },
    }

    vi.mocked(adminGraphqlClient.request).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0]

    // Verify it's a GraphQL query containing getCategories
    expect(String(document)).toContain('getCategories')
    expect(variables).toEqual({ pageSize: 500 })

    // Verify returned data is the flat content array
    expect(result.current.data).toEqual([
      { id: '1', name: 'Electronics' },
      { id: '2', name: 'Clothing' },
    ])
  })
})
