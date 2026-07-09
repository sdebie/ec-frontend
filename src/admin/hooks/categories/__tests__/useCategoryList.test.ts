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
import { useCategoryList } from '../useCategoryList'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useCategoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns paginated data with parent info from getCategories', async () => {
    const mockResponse = {
      getCategories: {
        content: [
          {
            id: 'cat-1',
            name: 'Electronics',
            slug: 'electronics',
            description: 'Electronic devices',
            imageUrl: null,
            parent: null,
          },
          {
            id: 'cat-2',
            name: 'Phones',
            slug: 'phones',
            description: 'Mobile phones',
            imageUrl: 'https://example.com/phones.png',
            parent: { id: 'cat-1', name: 'Electronics' },
          },
        ],
        totalElements: 2,
        totalPages: 1,
        pageIndex: 0,
        pageSize: 20,
      },
    }

    vi.mocked(adminGraphqlClient.request).mockResolvedValue(mockResponse)

    const { result } = renderHook(
      () => useCategoryList({ pageIndex: 0, pageSize: 20 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0]

    // Verify it's a GraphQL query containing getCategories
    expect(String(document)).toContain('getCategories')

    // Verify pagination variables
    expect(variables).toMatchObject({
      pageIndex: 0,
      pageSize: 20,
    })

    // Verify returned data includes parent info
    expect(result.current.data).toEqual({
      content: mockResponse.getCategories.content,
      totalElements: 2,
      totalPages: 1,
    })

    // Verify parent info is preserved on child categories
    expect(result.current.data!.content[1].parent).toEqual({
      id: 'cat-1',
      name: 'Electronics',
    })
  })

  it('passes search filter correctly via buildSearchFilterRequest', async () => {
    const mockResponse = {
      getCategories: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        pageIndex: 0,
        pageSize: 20,
      },
    }

    vi.mocked(adminGraphqlClient.request).mockResolvedValue(mockResponse)

    const { result } = renderHook(
      () => useCategoryList({ pageIndex: 0, pageSize: 20, search: 'elec' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as [unknown, Record<string, unknown>]

    expect(variables.pageIndex).toBe(0)
    expect(variables.pageSize).toBe(20)
    // filterRequest should be built from the search term
    expect(variables.filterRequest).toBeDefined()
  })
})
