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
import { useBrandList } from '../useBrandList'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useBrandList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns paginated brand data from getBrands query', async () => {
    const mockResponse = {
      getBrands: {
        content: [
          {
            id: 'b1',
            name: 'Nike',
            slug: 'nike',
            description: 'Athletic wear',
            logoUrl: 'https://example.com/nike.png',
          },
          {
            id: 'b2',
            name: 'Adidas',
            slug: 'adidas',
            description: null,
            logoUrl: null,
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
      () => useBrandList({ pageIndex: 0, pageSize: 20 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0]

    expect(String(document)).toContain('getBrands')
    expect(variables).toMatchObject({
      pageIndex: 0,
      pageSize: 20,
    })

    expect(result.current.data).toEqual({
      content: mockResponse.getBrands.content,
      totalElements: 2,
      totalPages: 1,
    })
  })

  it('passes search filter correctly when search term is provided', async () => {
    const mockResponse = {
      getBrands: {
        content: [
          {
            id: 'b1',
            name: 'Nike',
            slug: 'nike',
            description: 'Athletic wear',
            logoUrl: null,
          },
        ],
        totalElements: 1,
        totalPages: 1,
        pageIndex: 0,
        pageSize: 20,
      },
    }

    vi.mocked(adminGraphqlClient.request).mockResolvedValue(mockResponse)

    const { result } = renderHook(
      () => useBrandList({ pageIndex: 0, pageSize: 20, search: 'Nike' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0]

    expect(variables).toMatchObject({
      pageIndex: 0,
      pageSize: 20,
      filterRequest: {
        filters: [{ key: 'name', operator: 'ILIKE', value: '%Nike%' }],
      },
    })
  })

  it('does not pass filterRequest when search is empty', async () => {
    const mockResponse = {
      getBrands: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        pageIndex: 0,
        pageSize: 20,
      },
    }

    vi.mocked(adminGraphqlClient.request).mockResolvedValue(mockResponse)

    const { result } = renderHook(
      () => useBrandList({ pageIndex: 0, pageSize: 20, search: '' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0]

    expect(variables).toMatchObject({
      pageIndex: 0,
      pageSize: 20,
      filterRequest: undefined,
    })
  })
})
