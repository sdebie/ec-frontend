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
import { useCreateBrand } from '../useCreateBrand'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useCreateBrand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls createBrand mutation with correct payload', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      createBrand: 'new-brand-id',
    })

    const { result } = renderHook(() => useCreateBrand(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        name: 'Nike',
        slug: 'nike',
        description: 'Athletic footwear and apparel',
        logoUrl: 'https://example.com/nike-logo.png',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]

    expect(String(document)).toContain('createBrand')
    expect(variables).toEqual({
      brandDto: {
        name: 'Nike',
        slug: 'nike',
        description: 'Athletic footwear and apparel',
        logoUrl: 'https://example.com/nike-logo.png',
      },
    })
  })

  it('calls createBrand with minimal payload (only required fields)', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      createBrand: 'new-brand-id',
    })

    const { result } = renderHook(() => useCreateBrand(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        name: 'Adidas',
        slug: 'adidas',
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]

    expect(variables).toEqual({
      brandDto: {
        name: 'Adidas',
        slug: 'adidas',
      },
    })
  })
})
