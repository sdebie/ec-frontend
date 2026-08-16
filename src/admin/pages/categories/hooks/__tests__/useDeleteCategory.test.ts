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
import { useDeleteCategory } from '../useDeleteCategory'

describe('useDeleteCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls deleteCategory mutation and invalidates admin-category-list cache on success', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      deleteCategory: null,
    })

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    // Pre-populate the category list cache to verify invalidation
    queryClient.setQueryData(['admin-category-list', 0, 20, ''], {
      getCategories: {
        content: [{ id: 'cat-to-delete', name: 'Old Category' }],
        totalElements: 1,
        totalPages: 1,
        pageIndex: 0,
        pageSize: 20,
      },
    })

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useDeleteCategory(), { wrapper })

    await act(async () => {
      result.current.mutate({ id: 'cat-to-delete' })
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]

    // Verify it's a GraphQL mutation containing deleteCategory
    expect(String(document)).toContain('deleteCategory')

    // Verify the correct variables are passed
    expect(variables).toEqual({ id: 'cat-to-delete' })

    // Verify cache invalidation was called for admin-category-list
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['admin-category-list'] }),
    )

    invalidateSpy.mockRestore()
  })
})
