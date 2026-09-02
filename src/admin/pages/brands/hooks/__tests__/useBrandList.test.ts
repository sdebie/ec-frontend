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
import { useBrandList } from '../useBrandList'

// Exposes the MemoryRouter's current search string so tests can assert on
// what onSortingChange actually wrote to the URL, not just what it was
// called with — a sibling under the same Router re-renders alongside the
// hook and stays in sync via the router's shared location state.
function createWrapper(initialEntries: string[] = ['/admin/products/brands']) {
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

describe('useBrandList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns paginated brand data from getBrands query', async () => {
    const mockResponse = {
      getBrands: {
        content: [
          {
            id: 'b1',
            name: 'Nike',
            slug: 'nike',
            description: 'Athletic wear',
            logoUrl: 'https://example.com/nike.png',
          },
          {
            id: 'b2',
            name: 'Adidas',
            slug: 'adidas',
            description: null,
            logoUrl: null,
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
      () => useBrandList({ pageIndex: 0, pageSize: 20 }),
      { wrapper: Wrapper },
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]

    expect(String(document)).toContain('getBrands')
    expect(variables).toMatchObject({
      pageIndex: 0,
      pageSize: 20,
    })

    expect(result.current.data).toEqual({
      content: mockResponse.getBrands.content,
      totalElements: 2,
      totalPages: 1,
    })
  })

  it('passes search filter correctly when search term is provided', async () => {
    const mockResponse = {
      getBrands: {
        content: [
          {
            id: 'b1',
            name: 'Nike',
            slug: 'nike',
            description: 'Athletic wear',
            logoUrl: null,
          },
        ],
        totalElements: 1,
        totalPages: 1,
        pageIndex: 0,
        pageSize: 20,
      },
    }

    vi.mocked(adminGraphqlClient.request).mockResolvedValue(mockResponse)

    const { Wrapper } = createWrapper()
    const { result } = renderHook(
      () => useBrandList({ pageIndex: 0, pageSize: 20, search: 'Nike' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]

    expect(variables).toMatchObject({
      pageIndex: 0,
      pageSize: 20,
      filterRequest: {
        filters: [{ key: 'name', operator: 'ILIKE', value: '%Nike%' }],
      },
    })
  })

  it('does not pass filterRequest when search is empty', async () => {
    const mockResponse = {
      getBrands: {
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
      () => useBrandList({ pageIndex: 0, pageSize: 20, search: '' }),
      { wrapper: Wrapper },
    )

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]

    expect(variables).toMatchObject({
      pageIndex: 0,
      pageSize: 20,
      filterRequest: undefined,
    })
  })

  describe('sorting', () => {
    const emptyResponse = {
      getBrands: { content: [], totalElements: 0, totalPages: 0, pageIndex: 0, pageSize: 20 },
    }

    it('exposes an empty sorting array and no sort filter when the URL carries no sort', async () => {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue(emptyResponse)

      const { Wrapper } = createWrapper(['/admin/products/brands'])
      const { result } = renderHook(
        () => useBrandList({ pageIndex: 0, pageSize: 20 }),
        { wrapper: Wrapper },
      )

      await waitFor(() => expect(result.current.data).toBeDefined())

      expect(result.current.sorting).toEqual([])
      const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]
      expect(variables).toMatchObject({ filterRequest: undefined })
    })

    it('derives sorting from sortBy/sortDir in the URL and includes it in the filterRequest', async () => {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue(emptyResponse)

      const { Wrapper } = createWrapper(['/admin/products/brands?sortBy=name&sortDir=desc'])
      const { result } = renderHook(
        () => useBrandList({ pageIndex: 0, pageSize: 20 }),
        { wrapper: Wrapper },
      )

      await waitFor(() => expect(result.current.data).toBeDefined())

      expect(result.current.sorting).toEqual([{ id: 'name', desc: true }])
      const [, variables] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]
      expect(variables).toMatchObject({
        filterRequest: { sort: [{ field: 'name', direction: 'DESC' }] },
      })
    })

    it('defaults to ascending when sortDir is absent from the URL', async () => {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue(emptyResponse)

      const { Wrapper } = createWrapper(['/admin/products/brands?sortBy=slug'])
      const { result } = renderHook(
        () => useBrandList({ pageIndex: 0, pageSize: 20 }),
        { wrapper: Wrapper },
      )

      await waitFor(() => expect(result.current.data).toBeDefined())

      expect(result.current.sorting).toEqual([{ id: 'slug', desc: false }])
    })

    it('onSortingChange writes sortBy/sortDir to the URL and resets page to 0', async () => {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue(emptyResponse)

      const { Wrapper, location } = createWrapper(['/admin/products/brands?page=2'])
      const { result } = renderHook(
        () => useBrandList({ pageIndex: 2, pageSize: 20 }),
        { wrapper: Wrapper },
      )

      await waitFor(() => expect(result.current.data).toBeDefined())

      act(() => {
        result.current.onSortingChange([{ id: 'name', desc: true }])
      })

      expect(location.search).toContain('sortBy=name')
      expect(location.search).toContain('sortDir=desc')
      expect(location.search).toContain('page=0')
    })

    it('onSortingChange with an empty array clears sortBy/sortDir from the URL', async () => {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue(emptyResponse)

      const { Wrapper, location } = createWrapper(['/admin/products/brands?sortBy=name&sortDir=asc'])
      const { result } = renderHook(
        () => useBrandList({ pageIndex: 0, pageSize: 20 }),
        { wrapper: Wrapper },
      )

      await waitFor(() => expect(result.current.data).toBeDefined())

      act(() => {
        result.current.onSortingChange([])
      })

      expect(location.search).not.toContain('sortBy')
      expect(location.search).not.toContain('sortDir')
    })
  })
})
