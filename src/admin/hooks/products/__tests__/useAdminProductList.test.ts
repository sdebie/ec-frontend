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
import { useAdminProductList } from '../useAdminProductList'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useAdminProductList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls GraphQL adminProductList via adminGraphqlClient (not REST)', async () => {
    const mockResponse = {
      adminProductList: {
        content: [
          {
            id: 'p1',
            name: 'Test Product',
            slug: 'test-product',
            sku: 'SKU-001',
            category: { id: 'c1', name: 'Electronics' },
            status: 'ACTIVE',
            thumbnailUrl: null,
            retailPrice: '99.99',
            stockCount: 25,
            stockLevel: 'IN_STOCK',
          },
        ],
        totalElements: 1,
        totalPages: 1,
        pageIndex: 0,
        pageSize: 10,
      },
    }

    vi.mocked(adminGraphqlClient.request).mockResolvedValue(mockResponse)

    const { result } = renderHook(
      () =>
        useAdminProductList({
          pageIndex: 0,
          pageSize: 10,
          status: 'ACTIVE',
          categoryId: 'c1',
        }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0]

    // Verify it's a GraphQL query containing adminProductList
    expect(String(document)).toContain('adminProductList')

    // Verify variables include the non-empty, non-ALL values
    expect(variables).toMatchObject({
      pageIndex: 0,
      pageSize: 10,
      status: 'ACTIVE',
      categoryId: 'c1',
    })

    // Verify returned data shape
    expect(result.current.data).toEqual({
      content: mockResponse.adminProductList.content,
      totalElements: 1,
      totalPages: 1,
    })
  })

  it('excludes ALL status and empty values from GraphQL variables', async () => {
    const mockResponse = {
      adminProductList: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        pageIndex: 0,
        pageSize: 10,
      },
    }

    vi.mocked(adminGraphqlClient.request).mockResolvedValue(mockResponse)

    const { result } = renderHook(
      () =>
        useAdminProductList({
          pageIndex: 0,
          pageSize: 10,
          status: 'ALL',
          categoryId: '',
          brandId: undefined,
          search: '  ',
        }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0]

    // Only pageIndex and pageSize should be present
    expect(variables).toEqual({
      pageIndex: 0,
      pageSize: 10,
    })
  })
})
