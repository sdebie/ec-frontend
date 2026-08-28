import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
  adminGraphqlClient: {
    request: vi.fn(),
  },
}))

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { useDeleteProductGql } from '../useDeleteProductGql'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useDeleteProductGql', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls GraphQL deleteProduct mutation via adminGraphqlClient (not REST DELETE)', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      deleteProduct: 'DELETED',
    })

    const { result } = renderHook(() => useDeleteProductGql(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({ id: 'product-456' })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]

    // Verify it's a GraphQL mutation containing deleteProduct
    expect(String(document)).toContain('deleteProduct')

    // Verify the correct variables are passed
    expect(variables).toEqual({ id: 'product-456' })
  })

  /**
   * A caller reading nothing back cannot tell a hard delete from an archive.
   * This pins that the hook actually surfaces whichever outcome the server
   * reports, not just whether the call succeeded.
   */
  it('resolves with whichever outcome the server reports — ARCHIVED as well as DELETED', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      deleteProduct: 'ARCHIVED',
    })

    const { result } = renderHook(() => useDeleteProductGql(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({ id: 'product-789' })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual({ deleteProduct: 'ARCHIVED' })
  })
})
