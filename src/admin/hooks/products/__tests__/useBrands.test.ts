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
import { useBrands } from '../useBrands'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useBrands', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls GraphQL getBrands via adminGraphqlClient', async () => {
    const mockResponse = {
      getBrands: {
        content: [
          { id: 'b1', name: 'Nike' },
          { id: 'b2', name: 'Adidas' },
        ],
      },
    }

    vi.mocked(adminGraphqlClient.request).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useBrands(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]

    // Verify it's a GraphQL query containing getBrands
    expect(String(document)).toContain('getBrands')
    // useBrands delegates to useBrandList (single GetBrands query), fetching a
    // bounded page with no search filter.
    expect(variables).toEqual({ pageIndex: 0, pageSize: 500, filterRequest: undefined })

    // Verify returned data is the flat {id, name} array
    expect(result.current.data).toEqual([
      { id: 'b1', name: 'Nike' },
      { id: 'b2', name: 'Adidas' },
    ])
  })
})
