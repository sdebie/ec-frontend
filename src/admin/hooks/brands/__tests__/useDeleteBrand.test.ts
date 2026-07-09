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
import { useDeleteBrand } from '../useDeleteBrand'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useDeleteBrand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls deleteBrand mutation with the brand ID', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      deleteBrand: null,
    })

    const { result } = renderHook(() => useDeleteBrand(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({ id: 'brand-123' })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0]

    expect(String(document)).toContain('deleteBrand')
    expect(variables).toEqual({ id: 'brand-123' })
  })

  it('invalidates admin-brand-list cache on success', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      deleteBrand: null,
    })

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useDeleteBrand(), { wrapper })

    await act(async () => {
      result.current.mutate({ id: 'brand-456' })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['admin-brand-list'] }),
    )
  })
})
