import {beforeEach, describe, expect, it, vi} from 'vitest'
import {renderHook, waitFor} from '@testing-library/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {createElement} from 'react'
import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import {useQuoteRequests} from '../useQuoteRequests'

vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
    adminGraphqlClient: {request: vi.fn()},
}))

function createWrapper() {
    const queryClient = new QueryClient({defaultOptions: {queries: {retry: false}}})
    return ({children}: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, {client: queryClient}, children)
}

const emptyList = {allQuoteRequests: []}
const emptyCount = {quoteRequestCount: 0}

describe('useQuoteRequests sorting', () => {
    beforeEach(() => vi.clearAllMocks())

    it('omits sort from the list filterRequest when none is given', async () => {
        vi.mocked(adminGraphqlClient.request)
            .mockResolvedValueOnce(emptyList)
            .mockResolvedValueOnce(emptyCount)

        renderHook(() => useQuoteRequests({page: 1, pageSize: 10}), {wrapper: createWrapper()})

        await waitFor(() => expect(adminGraphqlClient.request).toHaveBeenCalledTimes(2))

        const [, listVars] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]
        expect(listVars.filterRequest).toEqual({filters: []})
    })

    it('includes the given sort in the list filterRequest but not in the count', async () => {
        vi.mocked(adminGraphqlClient.request)
            .mockResolvedValueOnce(emptyList)
            .mockResolvedValueOnce(emptyCount)

        renderHook(
            () => useQuoteRequests({page: 1, pageSize: 10, sort: [{field: 'name', direction: 'DESC'}]}),
            {wrapper: createWrapper()},
        )

        await waitFor(() => expect(adminGraphqlClient.request).toHaveBeenCalledTimes(2))

        const calls = vi.mocked(adminGraphqlClient.request).mock.calls as unknown as [unknown, Record<string, unknown>][]
        const [, listVars] = calls[0]
        const [, countVars] = calls[1]

        expect(listVars.filterRequest).toEqual({filters: [], sort: [{field: 'name', direction: 'DESC'}]})
        // The count answers "how many rows match", which sorting never changes — sending
        // it anyway would only fragment the query-cache key with no benefit.
        expect(countVars.filterRequest).toEqual({filters: []})
    })
})
