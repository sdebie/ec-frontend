import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, useSearchParams } from 'react-router-dom'
import { createElement } from 'react'

vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
  adminGraphqlClient: {
    request: vi.fn(),
  },
}))

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { useCategoryList } from '../useCategoryList'

// Exposes the MemoryRouter's current search string so tests can assert on
// what onSortingChange actually wrote to the URL, not just what it was
// called with — a sibling under the same Router re-renders alongside the
// hook and stays in sync via the router's shared location state.
function createWrapper(initialEntries: string[] = ['/admin/products/categories']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const location = { search: '' }

  function LocationSpy() {
    const [params] = useSearchParams()
    location.search = params.toString()
    return null
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(
        MemoryRouter,
        { initialEntries },
        children,
        createElement(LocationSpy),
      ),
    )

  return { Wrapper, location }
}

// The mount-reconciliation guard defers via setTimeout(0) — this flushes past
// it the same way a real macrotask boundary would, without reaching for fake
// timers (which fight react-query's own async internals).
async function flushMountGuard() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10))
  })
}

describe('useCategoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns paginated data with parent info from getCategories', async () => {
    const mockResponse = {
      getCategories: {
        content: [
          {
            id: 'cat-1',
            name: 'Electronics',
            slug: 'electronics',
            description: 'Electronic devices',
            imageUrl: null,
            parent: null,
          },
          {
            id: 'cat-2',
            name: 'Phones',
            slug: 'phones',
            description: 'Mobile phones',
            imageUrl: 'https://example.com/phones.png',
            parent: { id: 'cat-1', name: 'Electronics' },
          },
        ],
        totalElements: 2,
        totalPages: 1,
        pageIndex: 0,
        pageSize: 20,
      },
    }

    vi.mocked(adminGraphqlClient.request).mockResolvedValue(mockResponse)

    const { Wrapper } = createWrapper()
    const { result } = renderHook(
      () => useCategoryList({ pageIndex: 0, pageSize: 20 }),
      { wrapper: Wrapper },
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]

    // Verify it's a GraphQL query containing getCategories
    expect(String(document)).toContain('getCategories')

    // Verify pagination variables
    expect(variables).toMatchObject({
      pageIndex: 0,
      pageSize: 20,
    })

    // Verify returned data includes parent info
    expect(result.current.data).toEqual({
      content: mockResponse.getCategories.content,
      totalElements: 2,
      totalPages: 1,
    })

    // Verify parent info is preserved on child categories
    expect(result.current.data!.content[1].parent).toEqual({
      id: 'cat-1',
      name: 'Electronics',
    })
  })

  it('passes search filter correctly via buildSearchFilterRequest', async () => {
    const mockResponse = {
      getCategories: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        pageIndex: 0,
        pageSize: 20,
      },
    }

    vi.mocked(adminGraphqlClient.request).mockResolvedValue(mockResponse)

    const { Wrapper } = createWrapper()
    const { result } = renderHook(
      () => useCategoryList({ pageIndex: 0, pageSize: 20, search: 'elec' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]

    expect(variables.pageIndex).toBe(0)
    expect(variables.pageSize).toBe(20)
    // filterRequest should be built from the search term
    expect(variables.filterRequest).toBeDefined()
  })

  describe('sorting', () => {
    const emptyResponse = {
      getCategories: { content: [], totalElements: 0, totalPages: 0, pageIndex: 0, pageSize: 20 },
    }

    it('exposes an empty sorting array and no sort filter when the URL carries no sort', async () => {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue(emptyResponse)

      const { Wrapper } = createWrapper(['/admin/products/categories'])
      const { result } = renderHook(
        () => useCategoryList({ pageIndex: 0, pageSize: 20 }),
        { wrapper: Wrapper },
      )

      await waitFor(() => expect(result.current.data).toBeDefined())

      expect(result.current.sorting).toEqual([])
      const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]
      expect(variables).toMatchObject({ filterRequest: undefined })
    })

    it('derives sorting from sortBy/sortDir in the URL and includes it in the filterRequest', async () => {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue(emptyResponse)

      const { Wrapper } = createWrapper(['/admin/products/categories?sortBy=name&sortDir=desc'])
      const { result } = renderHook(
        () => useCategoryList({ pageIndex: 0, pageSize: 20 }),
        { wrapper: Wrapper },
      )

      await waitFor(() => expect(result.current.data).toBeDefined())

      expect(result.current.sorting).toEqual([{ id: 'name', desc: true }])
      const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]
      expect(variables).toMatchObject({
        filterRequest: { sort: [{ field: 'name', direction: 'DESC' }] },
      })
    })

    it('onSortingChange writes sortBy/sortDir to the URL and resets page to 0', async () => {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue(emptyResponse)

      const { Wrapper, location } = createWrapper(['/admin/products/categories?page=2'])
      const { result } = renderHook(
        () => useCategoryList({ pageIndex: 2, pageSize: 20 }),
        { wrapper: Wrapper },
      )

      await waitFor(() => expect(result.current.data).toBeDefined())
      await flushMountGuard()

      act(() => {
        result.current.onSortingChange([{ id: 'slug', desc: false }])
      })

      expect(location.search).toContain('sortBy=slug')
      expect(location.search).toContain('sortDir=asc')
      expect(location.search).toContain('page=0')
    })

    it('ignores the reconciliation call react-table fires with its own default during mount', async () => {
      // No await before it: the guard flips on the next macrotask, and even
      // waitFor's polling yields enough real time for that to have already
      // happened, so the only way to land inside the guard's window is to
      // call it in the same synchronous tick as render, exactly like
      // react-table's own reconciliation does.
      vi.mocked(adminGraphqlClient.request).mockResolvedValue(emptyResponse)

      const { Wrapper, location } = createWrapper(['/admin/products/categories?sortBy=name&sortDir=desc'])
      const { result } = renderHook(
        () => useCategoryList({ pageIndex: 0, pageSize: 20 }),
        { wrapper: Wrapper },
      )

      act(() => {
        result.current.onSortingChange([])
      })

      expect(location.search).toContain('sortBy=name')
      expect(location.search).toContain('sortDir=desc')

      await waitFor(() => expect(result.current.data).toBeDefined())
    })
  })
})
