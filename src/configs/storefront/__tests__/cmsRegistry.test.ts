import {describe, expect, it} from 'vitest'

import {resolveCmsPageForPath} from '@/configs/storefront/cmsRegistry'

import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes'


const storefrontConfig: StorefrontClientConfig = {
    id: 'default',
    displayName: 'Default',
    hostnames: ['localhost'],
    branding: {name: 'Default'},
    navigation: {},
    theme: {
        background: '#fff',
        panel: '#fff',
        text: '#111',
        mutedText: '#666',
        accent: '#06f',
        accentText: '#fff',
        border: '#ddd',
    },
    home: {sections: []},
    footer: {},
    pages: {
        cms: [
            {
                path: '/campaign',
                title: 'Campaign',
                blocks: [
                    {
                        id: 'hero',
                        type: 'hero',
                        content: {title: 'Campaign'},
                    },
                ],
            },
        ],
    },
}

describe('resolveCmsPageForPath', () => {
    it('returns cms page when path exists', () => {
        const page = resolveCmsPageForPath(storefrontConfig, '/campaign')
        expect(page?.title).toBe('Campaign')
    })

    it('fails closed for unknown path', () => {
        const page = resolveCmsPageForPath(storefrontConfig, '/unknown')
        expect(page).toBeUndefined()
    })

    it('fails closed for invalid cms page schema', () => {
        const invalidConfig = {
            ...storefrontConfig,
            pages: {
                cms: [
                    ...(storefrontConfig.pages?.cms ?? []),
                    {
                        path: '/bad',
                        title: 'Invalid',
                        blocks: [
                            {
                                id: 'bad-block',
                                type: 'hero',
                                content: {title: 'Oops', rogue: 'field'},
                            },
                        ],
                    },
                ],
            },
        } as unknown as StorefrontClientConfig

        const page = resolveCmsPageForPath(invalidConfig, '/bad')
        expect(page).toBeUndefined()
    })
})
