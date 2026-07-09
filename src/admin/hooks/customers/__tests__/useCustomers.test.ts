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
import { useCustomers } from '../useCustomers'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const mockCustomer = {
  id: 'c1',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  status: 'ACTIVE',
  shopperType: 'RETAILER',
  registeredAt: '2025-01-15T10:30:00Z',
  wholesaleApplicationStatus: null,
}

describe('useCustomers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls adminGraphqlClient (not REST) for allCustomers and customerCount', async () => {
    vi.mocked(adminGraphqlClient.request)
      .mockResolvedValueOnce({ allCustomers: [mockCustomer] })
      .mockResolvedValueOnce({ customerCount: 1 })

    const { result } = renderHook(
      () => useCustomers({ page: 1, pageSize: 20 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(2)
    expect(result.current.data).toEqual({ data: [mockCustomer], total: 1 })
  })

  it('builds filterRequest with status filter', async () => {
    vi.mocked(adminGraphqlClient.request)
      .mockResolvedValueOnce({ allCustomers: [] })
      .mockResolvedValueOnce({ customerCount: 0 })

    const { result } = renderHook(
      () => useCustomers({ page: 1, pageSize: 20, status: 'ACTIVE' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const listCall = vi.mocked(adminGraphqlClient.request).mock.calls[0]
    const variables = listCall[1] as { filterRequest: { filters: Array<{ key: string; operator: string; value: string }> } }
    expect(variables.filterRequest.filters).toContainEqual({
      key: 'status',
      operator: 'EQUALS',
      value: 'ACTIVE',
    })
  })

  it('builds filterRequest with search filter', async () => {
    vi.mocked(adminGraphqlClient.request)
      .mockResolvedValueOnce({ allCustomers: [] })
      .mockResolvedValueOnce({ customerCount: 0 })

    const { result } = renderHook(
      () => useCustomers({ page: 1, pageSize: 20, search: 'jane' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const listCall = vi.mocked(adminGraphqlClient.request).mock.calls[0]
    const variables = listCall[1] as { filterRequest: { filters: Array<{ key: string; operator: string; value: string }> } }
    expect(variables.filterRequest.filters).toContainEqual({
      key: 'search',
      operator: 'LIKE',
      value: 'jane',
    })
  })

  it('passes correct pageRequest (0-indexed) to allCustomers', async () => {
    vi.mocked(adminGraphqlClient.request)
      .mockResolvedValueOnce({ allCustomers: [] })
      .mockResolvedValueOnce({ customerCount: 0 })

    const { result } = renderHook(
      () => useCustomers({ page: 2, pageSize: 20 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const listCall = vi.mocked(adminGraphqlClient.request).mock.calls[0]
    const variables = listCall[1] as { pageRequest: { pageIndex: number; pageSize: number } }
    expect(variables.pageRequest).toEqual({ pageIndex: 1, pageSize: 20 })
  })

  it('returns isError=true when allCustomers query fails', async () => {
    vi.mocked(adminGraphqlClient.request)
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({ customerCount: 0 })

    const { result } = renderHook(
      () => useCustomers({ page: 1, pageSize: 20 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isError).toBe(true)
    expect(result.current.data).toBeUndefined()
  })
})
