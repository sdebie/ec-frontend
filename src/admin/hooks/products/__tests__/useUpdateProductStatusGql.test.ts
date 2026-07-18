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
import { useUpdateProductStatusGql } from '../useUpdateProductStatusGql'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useUpdateProductStatusGql', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls GraphQL updateProductStatus mutation via adminGraphqlClient (not REST PATCH)', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      updateProductStatus: null,
    })

    const { result } = renderHook(() => useUpdateProductStatusGql(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({ id: 'product-123', status: 'DISABLED' })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]

    // Verify it's a GraphQL mutation containing updateProductStatus
    expect(String(document)).toContain('updateProductStatus')

    // Verify the correct variables are passed
    expect(variables).toEqual({ id: 'product-123', status: 'DISABLED' })
  })
})
