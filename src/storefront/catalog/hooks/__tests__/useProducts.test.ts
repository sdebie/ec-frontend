import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

const mockRequest = vi.fn()

vi.mock('@/shared/api/graphql/graphqlClient', () => ({
  graphqlClient: {
    request: (...args: unknown[]) => mockRequest(...args),
  },
}))

let mockCustomerType = 'RETAIL'

vi.mock('@/shared/auth/customerAuthStore', () => ({
  useCustomerAuthStore: (selector: (state: { customerType: string }) => unknown) =>
    selector({ customerType: mockCustomerType }),
}))

import { useProducts } from '../useProducts'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const mockProductListResponse = {
  shoppingProductList: {
    content: [
      { id: 'p1', name: 'Alpha' },
      { id: 'p2', name: 'Beta' },
      { id: 'p3', name: 'Gamma' },
    ],
    totalElements: 3,
    totalPages: 1,
    pageSize: 20,
    pageIndex: 0,
  },
}

describe('useProducts — sortBy and priceBasis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCustomerType = 'RETAIL'
    mockRequest.mockResolvedValue(mockProductListResponse)
  })

  describe('sortBy mapping', () => {
    it('sends sortBy=NAME_ASC when sort is "name"', async () => {
      renderHook(
        () => useProducts({ sort: 'name' }),
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1)
      })

      const [, variables] = mockRequest.mock.calls[0] as [unknown, Record<string, unknown>]
      expect(variables.sortBy).toBe('NAME_ASC')
    })

    it('sends sortBy=NAME_ASC when sort is omitted (default)', async () => {
      renderHook(
        () => useProducts({}),
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1)
      })

      const [, variables] = mockRequest.mock.calls[0] as [unknown, Record<string, unknown>]
      expect(variables.sortBy).toBe('NAME_ASC')
    })

    it('sends sortBy=PRICE_ASC when sort is "price-asc"', async () => {
      renderHook(
        () => useProducts({ sort: 'price-asc' }),
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1)
      })

      const [, variables] = mockRequest.mock.calls[0] as [unknown, Record<string, unknown>]
      expect(variables.sortBy).toBe('PRICE_ASC')
    })

    it('sends sortBy=PRICE_DESC when sort is "price-desc"', async () => {
      renderHook(
        () => useProducts({ sort: 'price-desc' }),
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1)
      })

      const [, variables] = mockRequest.mock.calls[0] as [unknown, Record<string, unknown>]
      expect(variables.sortBy).toBe('PRICE_DESC')
    })
  })

  describe('priceBasis from customerType', () => {
    it('sends priceBasis=RETAIL when customerType is RETAIL', async () => {
      mockCustomerType = 'RETAIL'
      renderHook(
        () => useProducts({}),
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1)
      })

      const [, variables] = mockRequest.mock.calls[0] as [unknown, Record<string, unknown>]
      expect(variables.priceBasis).toBe('RETAIL')
    })

    it('sends priceBasis=WHOLESALE when customerType is WHOLESALE', async () => {
      mockCustomerType = 'WHOLESALE'
      renderHook(
        () => useProducts({}),
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1)
      })

      const [, variables] = mockRequest.mock.calls[0] as [unknown, Record<string, unknown>]
      expect(variables.priceBasis).toBe('WHOLESALE')
    })

    it('sends priceBasis=RETAIL when customerType is GUEST', async () => {
      mockCustomerType = 'GUEST'
      renderHook(
        () => useProducts({}),
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1)
      })

      const [, variables] = mockRequest.mock.calls[0] as [unknown, Record<string, unknown>]
      expect(variables.priceBasis).toBe('RETAIL')
    })
  })

  describe('query key includes sortBy and priceBasis', () => {
    it('includes sortBy in the query key', async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      })
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children)

      renderHook(
        () => useProducts({ sort: 'price-asc' }),
        { wrapper },
      )

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1)
      })

      // Check query cache has the key containing sortBy
      const cache = queryClient.getQueryCache()
      const queries = cache.getAll()
      expect(queries).toHaveLength(1)
      const queryKey = queries[0].queryKey as unknown[]
      expect(queryKey).toContain('PRICE_ASC')
    })

    it('includes priceBasis in the query key', async () => {
      mockCustomerType = 'WHOLESALE'
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      })
      const wrapper = ({ children }: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children)

      renderHook(
        () => useProducts({}),
        { wrapper },
      )

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1)
      })

      const cache = queryClient.getQueryCache()
      const queries = cache.getAll()
      expect(queries).toHaveLength(1)
      const queryKey = queries[0].queryKey as unknown[]
      expect(queryKey).toContain('WHOLESALE')
    })
  })

  describe('server order untouched (regression guard)', () => {
    it('returns products in the exact order the server sent them', async () => {
      const orderedResponse = {
        shoppingProductList: {
          content: [
            { id: 'p3', name: 'Gamma' },
            { id: 'p1', name: 'Alpha' },
            { id: 'p2', name: 'Beta' },
          ],
          totalElements: 3,
          totalPages: 1,
          pageSize: 20,
          pageIndex: 0,
        },
      }
      mockRequest.mockResolvedValue(orderedResponse)

      const { result } = renderHook(
        () => useProducts({ sort: 'price-asc' }),
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(result.current.products).toHaveLength(3)
      })

      // The hook must NOT reorder — products come back in server order
      expect(result.current.products[0].id).toBe('p3')
      expect(result.current.products[1].id).toBe('p1')
      expect(result.current.products[2].id).toBe('p2')
    })

    it('returns empty stable array when no data', async () => {
      mockRequest.mockResolvedValue({
        shoppingProductList: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          pageSize: 20,
          pageIndex: 0,
        },
      })

      const { result } = renderHook(
        () => useProducts({}),
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.products).toEqual([])
    })
  })

  describe('category argument handling', () => {
    it('passes categoryId in variables when a category is active', async () => {
      renderHook(
        () => useProducts({ categoryId: 'cat-uuid-123' }),
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1)
      })

      const [, variables] = mockRequest.mock.calls[0] as [unknown, Record<string, unknown>]
      expect(variables.categoryId).toBe('cat-uuid-123')
    })

    it('passes categoryId as null when no category is provided', async () => {
      renderHook(
        () => useProducts({}),
        { wrapper: createWrapper() },
      )

      await waitFor(() => {
        expect(mockRequest).toHaveBeenCalledTimes(1)
      })

      const [, variables] = mockRequest.mock.calls[0] as [unknown, Record<string, unknown>]
      expect(variables.categoryId).toBeNull()
    })
  })
})
