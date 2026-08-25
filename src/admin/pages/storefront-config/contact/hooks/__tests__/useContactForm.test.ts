import {describe, it, expect, vi, beforeEach} from 'vitest'
import {renderHook, act, waitFor} from '@testing-library/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {createElement} from 'react'

const mockRequest = vi.fn()

vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
    adminGraphqlClient: {
        request: (...args: unknown[]) => mockRequest(...args),
    },
}))

vi.mock('@/shared/auth/adminPermissions', () => ({
    useCan: vi.fn(() => true),
}))

import {useContactForm} from '../useContactForm'

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {queries: {retry: false}, mutations: {retry: false}},
    })
    return ({children}: {children: React.ReactNode}) =>
        createElement(QueryClientProvider, {client: queryClient}, children)
}

describe('useContactForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('starts with empty email/phone field arrays before settings load', () => {
        mockRequest.mockResolvedValueOnce({storeSettings: []})
        const {result} = renderHook(() => useContactForm(), {wrapper: createWrapper()})

        expect(result.current.emailFields).toEqual([])
        expect(result.current.phoneFields).toEqual([])
        expect(result.current.isLoading).toBe(true)
    })

    it('loads the persisted storefront.contact setting, including scalar fields verified via the save payload', async () => {
        mockRequest.mockResolvedValueOnce({
            storeSettings: [
                {
                    key: 'storefront.contact',
                    value: JSON.stringify({
                        enquiryEmail: 'enquiries@store.co.za',
                        emails: ['info@store.co.za'],
                        phones: ['+27123456789'],
                        landline: '+27219876543',
                    }),
                    description: null,
                },
            ],
        })

        const {result} = renderHook(() => useContactForm(), {wrapper: createWrapper()})
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.emailFields).toHaveLength(1)
        expect(result.current.phoneFields).toHaveLength(1)

        // Field values (scalar and array alike) live in react-hook-form's
        // internal state, not on the hook's own return surface — verify they
        // survived the load by round-tripping through the real save path.
        mockRequest.mockResolvedValueOnce({
            updateSetting: {key: 'storefront.contact', value: '{}', description: null},
        })
        await act(async () => {
            await result.current.onSubmit()
        })

        const [, variables] = mockRequest.mock.calls[1] as [unknown, {key: string; value: string}]
        expect(variables.key).toBe('storefront.contact')
        const saved = JSON.parse(variables.value)
        expect(saved.enquiryEmail).toBe('enquiries@store.co.za')
        expect(saved.landline).toBe('+27219876543')
        expect(saved.emails).toEqual(['info@store.co.za'])
        expect(saved.phones).toEqual(['+27123456789'])
    })

    it('falls back to an empty form when the setting is absent', async () => {
        mockRequest.mockResolvedValueOnce({storeSettings: []})
        const {result} = renderHook(() => useContactForm(), {wrapper: createWrapper()})
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.emailFields).toEqual([])
        expect(result.current.phoneFields).toEqual([])
    })

    it('falls back to an empty form when the stored value is malformed JSON', async () => {
        mockRequest.mockResolvedValueOnce({
            storeSettings: [{key: 'storefront.contact', value: 'not json', description: null}],
        })
        const {result} = renderHook(() => useContactForm(), {wrapper: createWrapper()})
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.emailFields).toEqual([])
        expect(result.current.phoneFields).toEqual([])
    })

    it('appendEmail/removeEmail and appendPhone/removePhone mutate the respective field arrays', async () => {
        mockRequest.mockResolvedValueOnce({storeSettings: []})
        const {result} = renderHook(() => useContactForm(), {wrapper: createWrapper()})
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        act(() => {
            result.current.appendEmail({value: 'new@store.co.za'})
        })
        expect(result.current.emailFields).toHaveLength(1)

        act(() => {
            result.current.removeEmail(0)
        })
        expect(result.current.emailFields).toHaveLength(0)

        act(() => {
            result.current.appendPhone({value: '+27000000'})
        })
        expect(result.current.phoneFields).toHaveLength(1)

        act(() => {
            result.current.removePhone(0)
        })
        expect(result.current.phoneFields).toHaveLength(0)
    })

    it('reports isSaving while the mutation is in flight', async () => {
        mockRequest.mockResolvedValueOnce({storeSettings: []})
        const {result} = renderHook(() => useContactForm(), {wrapper: createWrapper()})
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        let resolveMutation!: (value: unknown) => void
        mockRequest.mockReturnValueOnce(new Promise((resolve) => {
            resolveMutation = resolve
        }))

        act(() => {
            result.current.onSubmit()
        })

        await waitFor(() => expect(result.current.isSaving).toBe(true))

        resolveMutation({updateSetting: {key: 'storefront.contact', value: '{}', description: null}})

        await waitFor(() => expect(result.current.isSaving).toBe(false))
    })

    it('exposes canEdit from useCan', async () => {
        mockRequest.mockResolvedValueOnce({storeSettings: []})
        const {result} = renderHook(() => useContactForm(), {wrapper: createWrapper()})
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.canEdit).toBe(true)
    })
})
