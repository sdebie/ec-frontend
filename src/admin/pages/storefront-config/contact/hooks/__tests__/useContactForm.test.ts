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
            saveStoreSettings: [
                {key: 'storefront.contact', value: '{}', description: null},
                {key: 'storefront.footer', value: '{}', description: null},
            ],
        })
        await act(async () => {
            await result.current.onSubmit()
        })

        const [, variables] = mockRequest.mock.calls[1] as [unknown, {storeSettingsDto: {key: string; value: string}[]}]
        const contactEntry = variables.storeSettingsDto.find((s) => s.key === 'storefront.contact')!
        const saved = JSON.parse(contactEntry.value)
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

    // --- Social links (storefront.footer.socialLinks) ---
    //
    // storefront.footer is one JSON blob also holding description/footerCallout/
    // columns/legalLinks, none of which this page renders — saving must carry
    // them through untouched or every Contact Settings save silently wipes them.

    describe('social links', () => {
        it('starts with an empty socialLinks array before settings load', () => {
            mockRequest.mockResolvedValueOnce({storeSettings: []})
            const {result} = renderHook(() => useContactForm(), {wrapper: createWrapper()})

            expect(result.current.socialFields).toEqual([])
        })

        it('loads socialLinks from storefront.footer', async () => {
            mockRequest.mockResolvedValueOnce({
                storeSettings: [
                    {
                        key: 'storefront.footer',
                        value: JSON.stringify({
                            // The raw setting keys the URL `path`, not `to` — `to` is only
                            // the public shape the backend remaps this into for the storefront.
                            socialLinks: [{id: 'a1', label: 'Facebook', path: 'https://facebook.com/store', icon: 'facebook'}],
                        }),
                        description: null,
                    },
                ],
            })

            const {result} = renderHook(() => useContactForm(), {wrapper: createWrapper()})
            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.socialFields).toHaveLength(1)
        })

        it('preserves every other storefront.footer field untouched when saving', async () => {
            mockRequest.mockResolvedValueOnce({
                storeSettings: [
                    {key: 'storefront.contact', value: JSON.stringify({emails: [], phones: []}), description: null},
                    {
                        key: 'storefront.footer',
                        value: JSON.stringify({
                            description: 'A great store',
                            footerCallout: {heading: 'Sale', body: '20% off'},
                            columns: [{heading: 'Shop', links: [{id: 'l1', label: 'Products', path: '/products', external: false}]}],
                            legalLinks: [{id: 'll1', label: 'Privacy', path: '/privacy'}],
                            socialLinks: [{id: 's1', label: 'Facebook', path: 'https://facebook.com/store', icon: 'facebook'}],
                        }),
                        description: null,
                    },
                ],
            })

            const {result} = renderHook(() => useContactForm(), {wrapper: createWrapper()})
            await waitFor(() => expect(result.current.isLoading).toBe(false))

            mockRequest.mockResolvedValueOnce({
                saveStoreSettings: [
                    {key: 'storefront.contact', value: '{}', description: null},
                    {key: 'storefront.footer', value: '{}', description: null},
                ],
            })
            await act(async () => {
                await result.current.onSubmit()
            })

            const [, variables] = mockRequest.mock.calls[1] as [unknown, {storeSettingsDto: {key: string; value: string}[]}]
            const footerEntry = variables.storeSettingsDto.find((s) => s.key === 'storefront.footer')!
            const savedFooter = JSON.parse(footerEntry.value)

            expect(savedFooter.description).toBe('A great store')
            expect(savedFooter.footerCallout).toEqual({heading: 'Sale', body: '20% off'})
            expect(savedFooter.columns).toEqual([
                {heading: 'Shop', links: [{id: 'l1', label: 'Products', path: '/products', external: false}]},
            ])
            expect(savedFooter.legalLinks).toEqual([{id: 'll1', label: 'Privacy', path: '/privacy'}])
        })

        it('saves a social link using the real wire shape (path, not to)', async () => {
            mockRequest.mockResolvedValueOnce({storeSettings: []})
            const {result} = renderHook(() => useContactForm(), {wrapper: createWrapper()})
            await waitFor(() => expect(result.current.isLoading).toBe(false))

            act(() => {
                result.current.appendSocial({id: 'new-1', label: 'Instagram', to: 'https://instagram.com/store', icon: 'instagram'})
            })

            mockRequest.mockResolvedValueOnce({saveStoreSettings: []})
            await act(async () => {
                await result.current.onSubmit()
            })

            const [, variables] = mockRequest.mock.calls[1] as [unknown, {storeSettingsDto: {key: string; value: string}[]}]
            const footerEntry = variables.storeSettingsDto.find((s) => s.key === 'storefront.footer')!
            const savedFooter = JSON.parse(footerEntry.value)

            expect(savedFooter.socialLinks).toEqual([
                {id: 'new-1', label: 'Instagram', path: 'https://instagram.com/store', icon: 'instagram', external: true},
            ])
        })

        it('saves both storefront.contact and storefront.footer in one call', async () => {
            mockRequest.mockResolvedValueOnce({storeSettings: []})
            const {result} = renderHook(() => useContactForm(), {wrapper: createWrapper()})
            await waitFor(() => expect(result.current.isLoading).toBe(false))

            mockRequest.mockResolvedValueOnce({saveStoreSettings: []})
            await act(async () => {
                await result.current.onSubmit()
            })

            const [, variables] = mockRequest.mock.calls[1] as [unknown, {storeSettingsDto: {key: string; value: string}[]}]
            const keys = variables.storeSettingsDto.map((s) => s.key)
            expect(keys).toEqual(['storefront.contact', 'storefront.footer'])
        })

        it('appendSocial/removeSocial mutate the socialLinks field array', async () => {
            mockRequest.mockResolvedValueOnce({storeSettings: []})
            const {result} = renderHook(() => useContactForm(), {wrapper: createWrapper()})
            await waitFor(() => expect(result.current.isLoading).toBe(false))

            act(() => {
                result.current.appendSocial({id: 'new-1', label: 'Instagram', to: 'https://instagram.com/store', icon: 'instagram'})
            })
            expect(result.current.socialFields).toHaveLength(1)

            act(() => {
                result.current.removeSocial(0)
            })
            expect(result.current.socialFields).toHaveLength(0)
        })

        it('blocks save while a social link has an invalid URL', async () => {
            mockRequest.mockResolvedValueOnce({storeSettings: []})
            const {result} = renderHook(() => useContactForm(), {wrapper: createWrapper()})
            await waitFor(() => expect(result.current.isLoading).toBe(false))

            act(() => {
                result.current.appendSocial({id: 'bad-1', label: 'Bad', to: 'not-a-url', icon: 'facebook'})
            })

            await act(async () => {
                await result.current.onSubmit()
            })

            // Only the initial load call happened — validation blocked the save call.
            expect(mockRequest).toHaveBeenCalledTimes(1)
        })
    })
})
