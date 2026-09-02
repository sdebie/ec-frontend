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

import {useAnnouncementForm, DEFAULT_ANNOUNCEMENT_VALUES} from '../useAnnouncementForm'

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {queries: {retry: false}, mutations: {retry: false}},
    })
    return ({children}: {children: React.ReactNode}) =>
        createElement(QueryClientProvider, {client: queryClient}, children)
}

describe('useAnnouncementForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('starts with the default values before settings load', () => {
        mockRequest.mockResolvedValueOnce({storeSettings: []})
        const {result} = renderHook(() => useAnnouncementForm(), {wrapper: createWrapper()})

        expect(result.current.form).toEqual(DEFAULT_ANNOUNCEMENT_VALUES)
        expect(result.current.isLoading).toBe(true)
    })

    it('parses the persisted storefront.header setting once loaded', async () => {
        mockRequest.mockResolvedValueOnce({
            storeSettings: [
                {
                    key: 'storefront.header',
                    value: JSON.stringify({
                        announcement: {
                            enabled: true,
                            text: 'Sale!',
                            backgroundColor: '#7a0019',
                            textColor: '#ffffff',
                            showContact: true,
                            showSocial: false,
                        },
                    }),
                    description: null,
                },
            ],
        })

        const {result} = renderHook(() => useAnnouncementForm(), {wrapper: createWrapper()})

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.form).toEqual({
            enabled: true,
            text: 'Sale!',
            backgroundColor: '#7a0019',
            textColor: '#ffffff',
            showContact: true,
            showSocial: false,
        })
    })

    it('falls back to defaults when the setting is absent', async () => {
        mockRequest.mockResolvedValueOnce({storeSettings: []})

        const {result} = renderHook(() => useAnnouncementForm(), {wrapper: createWrapper()})

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.form).toEqual(DEFAULT_ANNOUNCEMENT_VALUES)
    })

    it('falls back to defaults when the stored value is malformed JSON', async () => {
        mockRequest.mockResolvedValueOnce({
            storeSettings: [{key: 'storefront.header', value: 'not json', description: null}],
        })

        const {result} = renderHook(() => useAnnouncementForm(), {wrapper: createWrapper()})

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.form).toEqual(DEFAULT_ANNOUNCEMENT_VALUES)
    })

    it('setForm updates the draft, and handleSave sends it as the storefront.header payload', async () => {
        mockRequest.mockResolvedValueOnce({storeSettings: []})

        const {result} = renderHook(() => useAnnouncementForm(), {wrapper: createWrapper()})
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        act(() => {
            result.current.setForm((prev) => ({...prev, text: 'Big sale!', enabled: true}))
        })
        expect(result.current.form.text).toBe('Big sale!')

        mockRequest.mockResolvedValueOnce({
            updateSetting: {key: 'storefront.header', value: '{}', description: null},
        })

        act(() => {
            result.current.handleSave()
        })

        await waitFor(() => expect(mockRequest.mock.calls.length).toBeGreaterThanOrEqual(2))

        const [, variables] = mockRequest.mock.calls[1] as [unknown, {key: string; value: string}]
        expect(variables.key).toBe('storefront.header')
        expect(JSON.parse(variables.value)).toEqual({
            announcement: {
                enabled: true,
                text: 'Big sale!',
                backgroundColor: '#1a1f35',
                textColor: '#ffffff',
                showContact: false,
                showSocial: false,
            },
        })
    })

    it('reports isSaving while the mutation is in flight', async () => {
        mockRequest.mockResolvedValueOnce({storeSettings: []})
        const {result} = renderHook(() => useAnnouncementForm(), {wrapper: createWrapper()})
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        let resolveMutation!: (value: unknown) => void
        mockRequest.mockReturnValueOnce(new Promise((resolve) => {
            resolveMutation = resolve
        }))

        act(() => {
            result.current.handleSave()
        })

        await waitFor(() => expect(result.current.isSaving).toBe(true))

        resolveMutation({updateSetting: {key: 'storefront.header', value: '{}', description: null}})

        await waitFor(() => expect(result.current.isSaving).toBe(false))
    })
})
