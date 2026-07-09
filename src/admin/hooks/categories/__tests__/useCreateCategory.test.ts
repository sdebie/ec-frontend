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
import { useCreateCategory } from '../useCreateCategory'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useCreateCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passes parentId correctly as parent object in the mutation payload', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      createCategory: 'new-cat-id',
    })

    const { result } = renderHook(() => useCreateCategory(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        name: 'Laptops',
        slug: 'laptops',
        description: 'Laptop computers',
        parent: { id: 'cat-1' },
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0]

    // Verify it's a GraphQL mutation containing createCategory
    expect(String(document)).toContain('createCategory')

    // Verify the payload includes parent with the correct id
    expect(variables).toEqual({
      categoryDto: {
        name: 'Laptops',
        slug: 'laptops',
        description: 'Laptop computers',
        parent: { id: 'cat-1' },
      },
    })
  })

  it('passes null parent when no parentId is selected', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      createCategory: 'new-top-cat-id',
    })

    const { result } = renderHook(() => useCreateCategory(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({
        name: 'Top Level',
        slug: 'top-level',
        parent: null,
      })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0]

    // Verify parent is null for top-level category
    expect(variables).toEqual({
      categoryDto: {
        name: 'Top Level',
        slug: 'top-level',
        parent: null,
      },
    })
  })
})
