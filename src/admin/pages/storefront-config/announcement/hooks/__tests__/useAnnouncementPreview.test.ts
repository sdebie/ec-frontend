import {describe, it, expect, vi, beforeEach} from 'vitest'
import {renderHook, waitFor} from '@testing-library/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {createElement} from 'react'
import {DEFAULT_ANNOUNCEMENT_VALUES} from '../useAnnouncementForm'

const mockRequest = vi.fn()

vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
    adminGraphqlClient: {
        request: (...args: unknown[]) => mockRequest(...args),
    },
}))

import {useAnnouncementPreview} from '../useAnnouncementPreview'

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {queries: {retry: false}, mutations: {retry: false}},
    })
    return ({children}: {children: React.ReactNode}) =>
        createElement(QueryClientProvider, {client: queryClient}, children)
}

function renderPreview(form = DEFAULT_ANNOUNCEMENT_VALUES, storeSettings: Array<{key: string; value: string; description: null}> = []) {
    mockRequest.mockResolvedValueOnce({storeSettings})
    return renderHook(() => useAnnouncementPreview(form), {wrapper: createWrapper()})
}

describe('useAnnouncementPreview', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('has nothing to preview when there is no text and no reachable contact/social data', async () => {
        const {result} = renderPreview()
        await waitFor(() => expect(result.current.hasAnythingToPreview).toBe(false))
    })

    it('has something to preview once there is announcement text', async () => {
        const {result} = renderPreview({...DEFAULT_ANNOUNCEMENT_VALUES, text: 'Sale!'})
        await waitFor(() => expect(result.current.hasAnythingToPreview).toBe(true))
    })

    it('showContact alone is not enough — the contact setting must have a reachable channel', async () => {
        const {result} = renderPreview(
            {...DEFAULT_ANNOUNCEMENT_VALUES, showContact: true},
            [{key: 'storefront.contact', value: JSON.stringify({physicalAddress: '1 Somewhere Road'}), description: null}],
        )
        await waitFor(() => expect(result.current.previewConfig).toBeDefined())
        expect(result.current.hasAnythingToPreview).toBe(false)
    })

    it('showContact with a reachable phone number makes the preview visible', async () => {
        const {result} = renderPreview(
            {...DEFAULT_ANNOUNCEMENT_VALUES, showContact: true},
            [{key: 'storefront.contact', value: JSON.stringify({phones: ['+27 11 123 4567']}), description: null}],
        )
        await waitFor(() => expect(result.current.hasAnythingToPreview).toBe(true))
        expect(result.current.previewConfig.contact?.phones).toEqual(['+27 11 123 4567'])
    })

    it('showSocial with configured links makes the preview visible', async () => {
        const {result} = renderPreview(
            {...DEFAULT_ANNOUNCEMENT_VALUES, showSocial: true},
            [{
                key: 'storefront.footer',
                value: JSON.stringify({socialLinks: [{id: 's1', label: 'Facebook', icon: 'facebook', path: 'https://facebook.com/uvh', external: true}]}),
                description: null,
            }],
        )
        await waitFor(() => expect(result.current.hasAnythingToPreview).toBe(true))
    })

    it("remaps the raw social link's path field to the `to` field AnnouncementBanner expects", async () => {
        const {result} = renderPreview(
            {...DEFAULT_ANNOUNCEMENT_VALUES, showSocial: true},
            [{
                key: 'storefront.footer',
                value: JSON.stringify({socialLinks: [{id: 's1', label: 'Facebook', icon: 'facebook', path: 'https://facebook.com/uvh', external: true}]}),
                description: null,
            }],
        )
        await waitFor(() => expect(result.current.previewConfig.footer?.socialLinks).toHaveLength(1))
        expect(result.current.previewConfig.footer?.socialLinks?.[0]).toEqual({
            id: 's1',
            label: 'Facebook',
            icon: 'facebook',
            to: 'https://facebook.com/uvh',
        })
    })

    it('forces enabled: true in the preview config regardless of the real toggle', async () => {
        const {result} = renderPreview({...DEFAULT_ANNOUNCEMENT_VALUES, text: 'Sale!', enabled: false})
        await waitFor(() => expect(result.current.hasAnythingToPreview).toBe(true))
        expect(result.current.previewConfig.header?.announcement?.enabled).toBe(true)
    })

    it('tolerates malformed contact/footer JSON by treating the slot as empty', async () => {
        const {result} = renderPreview(
            {...DEFAULT_ANNOUNCEMENT_VALUES, showContact: true, showSocial: true},
            [
                {key: 'storefront.contact', value: 'not json', description: null},
                {key: 'storefront.footer', value: 'not json', description: null},
            ],
        )
        await waitFor(() => expect(result.current.previewConfig).toBeDefined())
        expect(result.current.hasAnythingToPreview).toBe(false)
        expect(result.current.previewConfig.footer?.socialLinks).toEqual([])
    })
})
