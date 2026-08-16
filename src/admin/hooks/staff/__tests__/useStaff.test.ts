import {beforeEach, describe, expect, it, vi} from 'vitest'
import {renderHook, waitFor} from '@testing-library/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {createElement} from 'react'

vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
    adminGraphqlClient: {request: vi.fn()},
}))

import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import {useStaff} from '../useStaff'

function createWrapper() {
    const queryClient = new QueryClient({defaultOptions: {queries: {retry: false}}})
    return ({children}: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, {client: queryClient}, children)
}

const emptyList = {staffList: []}
const emptyCount = {staffCount: 0}

describe('useStaff sorting', () => {
    beforeEach(() => vi.clearAllMocks())

    it('omits sort and filterGroups from the list filterRequest when neither is given', async () => {
        vi.mocked(adminGraphqlClient.request)
            .mockResolvedValueOnce(emptyList)
            .mockResolvedValueOnce(emptyCount)

        renderHook(() => useStaff({pageIndex: 0, pageSize: 10, search: ''}), {wrapper: createWrapper()})

        await waitFor(() => expect(adminGraphqlClient.request).toHaveBeenCalledTimes(2))

        const [, listVars] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]
        expect(listVars.filterRequest).toEqual({})
    })

    it('includes the given sort in the list filterRequest but not in the count', async () => {
        vi.mocked(adminGraphqlClient.request)
            .mockResolvedValueOnce(emptyList)
            .mockResolvedValueOnce(emptyCount)

        renderHook(
            () => useStaff({pageIndex: 0, pageSize: 10, search: '', sort: [{field: 'fullName', direction: 'ASC'}]}),
            {wrapper: createWrapper()},
        )

        await waitFor(() => expect(adminGraphqlClient.request).toHaveBeenCalledTimes(2))

        const calls = vi.mocked(adminGraphqlClient.request).mock.calls as unknown as [unknown, Record<string, unknown>][]
        const [, listVars] = calls[0]
        const [, countVars] = calls[1]

        expect(listVars.filterRequest).toEqual({sort: [{field: 'fullName', direction: 'ASC'}]})
        expect(countVars.filterRequest).toEqual({})
    })

    it('combines a search filter and a sort in the same list filterRequest', async () => {
        vi.mocked(adminGraphqlClient.request)
            .mockResolvedValueOnce(emptyList)
            .mockResolvedValueOnce(emptyCount)

        renderHook(
            () =>
                useStaff({
                    pageIndex: 0,
                    pageSize: 10,
                    search: 'jane',
                    sort: [{field: 'email', direction: 'DESC'}],
                }),
            {wrapper: createWrapper()},
        )

        await waitFor(() => expect(adminGraphqlClient.request).toHaveBeenCalledTimes(2))

        const [, listVars] = vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>]
        expect(listVars.filterRequest).toMatchObject({
            sort: [{field: 'email', direction: 'DESC'}],
            filterGroups: [
                {
                    operator: 'OR',
                    filters: [
                        {key: 'fullName', operator: 'ILIKE', value: 'jane'},
                        {key: 'email', operator: 'ILIKE', value: 'jane'},
                    ],
                },
            ],
        })
    })
})
