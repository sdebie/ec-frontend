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

vi.mock('@/shared/auth/customerAuthStore', () => ({
  useCustomerAuthStore: (selector: (state: { customerType: string }) => unknown) =>
    selector({ customerType: 'RETAIL' }),
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
    content: [],
    totalElements: 0,
    totalPages: 0,
    pageSize: 20,
    pageIndex: 0,
  },
}

describe('useProducts — category argument reroute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequest.mockResolvedValue(mockProductListResponse)
  })

  it('passes categoryId in variables when a category is active', async () => {
    renderHook(
      () => useProducts({ categoryId: 'cat-uuid-123' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledTimes(1)
    })

    const [, variables] = mockRequest.mock.calls[0] as [unknown, Record<string, unknown>]

    // categoryId should be passed as a top-level variable
    expect(variables.categoryId).toBe('cat-uuid-123')

    // filterRequest should NOT contain a category.id filter
    const filterRequest = variables.filterRequest as { filters?: Array<{ key: string }> } | undefined
    const categoryFilter = filterRequest?.filters?.find(
      (f) => f.key === 'category.id'
    )
    expect(categoryFilter).toBeUndefined()
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

  it('passes categoryId as null when categoryId is explicitly undefined', async () => {
    renderHook(
      () => useProducts({ categoryId: undefined }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledTimes(1)
    })

    const [, variables] = mockRequest.mock.calls[0] as [unknown, Record<string, unknown>]

    expect(variables.categoryId).toBeNull()
  })

  it('includes brand filter in filterRequest when brandId is provided alongside categoryId', async () => {
    renderHook(
      () => useProducts({ categoryId: 'cat-uuid-123', brandId: 'brand-uuid-456' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledTimes(1)
    })

    const [, variables] = mockRequest.mock.calls[0] as [unknown, Record<string, unknown>]

    // categoryId goes as a variable
    expect(variables.categoryId).toBe('cat-uuid-123')

    // brand stays in filterRequest
    const filterRequest = variables.filterRequest as {
      filters?: Array<{ key: string; value: string; operator: string }>
    }
    expect(filterRequest.filters).toContainEqual({
      key: 'brand.id',
      value: 'brand-uuid-456',
      operator: 'EQUALS',
    })

    // No category.id in filterRequest
    const categoryFilter = filterRequest.filters?.find((f) => f.key === 'category.id')
    expect(categoryFilter).toBeUndefined()
  })

  it('includes search filter groups in filterRequest when search is provided', async () => {
    renderHook(
      () => useProducts({ search: 'shoes', categoryId: 'cat-uuid-123' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledTimes(1)
    })

    const [, variables] = mockRequest.mock.calls[0] as [unknown, Record<string, unknown>]

    // categoryId goes as variable
    expect(variables.categoryId).toBe('cat-uuid-123')

    // search ILIKE filter goes in filterRequest.filterGroups
    const filterRequest = variables.filterRequest as {
      filterGroups?: Array<{
        filters: Array<{ key: string; value: string; operator: string }>
        operator: string
      }>
    }
    expect(filterRequest.filterGroups).toBeDefined()
    expect(filterRequest.filterGroups).toHaveLength(1)
    expect(filterRequest.filterGroups![0].operator).toBe('OR')
    expect(filterRequest.filterGroups![0].filters).toContainEqual({
      key: 'name',
      value: '%shoes%',
      operator: 'ILIKE',
    })
  })

  it('includes sort in filterRequest when sort is name (default)', async () => {
    renderHook(
      () => useProducts({ sort: 'name' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledTimes(1)
    })

    const [, variables] = mockRequest.mock.calls[0] as [unknown, Record<string, unknown>]

    const filterRequest = variables.filterRequest as {
      sort?: Array<{ field: string; direction: string }>
    }
    expect(filterRequest.sort).toContainEqual({
      field: 'name',
      direction: 'ASC',
    })
  })

  it('does not include sort in filterRequest for price-based sorts (client-side)', async () => {
    renderHook(
      () => useProducts({ sort: 'price-asc' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledTimes(1)
    })

    const [, variables] = mockRequest.mock.calls[0] as [unknown, Record<string, unknown>]

    const filterRequest = variables.filterRequest as {
      sort?: Array<{ field: string; direction: string }>
    }
    expect(filterRequest.sort).toBeUndefined()
  })
})
