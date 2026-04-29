import {describe, expect, it} from 'vitest'
import {listSlotContributions} from '@/storefront/registry/slotRegistry'
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
    slots: [
        {
            id: 'b',
            slot: 'layout.header',
            order: 20,
            content: {title: 'B'},
        },
        {
            id: 'a',
            slot: 'layout.header',
            order: 10,
            content: {title: 'A'},
        },
    ],
}

describe('listSlotContributions', () => {
    it('returns sorted slot contributions for the requested slot', () => {
        const entries = listSlotContributions(storefrontConfig, 'layout.header')
        expect(entries.map((entry) => entry.id)).toEqual(['a', 'b'])
    })

    it('returns empty list for unknown slot', () => {
        expect(listSlotContributions(storefrontConfig, 'home.hero')).toEqual([])
    })

    it('fails closed for invalid slot contribution shape', () => {
        const invalidConfig = {
            ...storefrontConfig,
            slots: [
                ...(storefrontConfig.slots ?? []),
                {
                    id: 'invalid',
                    slot: 'layout.header',
                    order: 30,
                    content: {title: 'Bad'},
                    rogue: true,
                },
            ],
        } as unknown as StorefrontClientConfig

        const entries = listSlotContributions(invalidConfig, 'layout.header')
        expect(entries.map((entry) => entry.id)).toEqual(['a', 'b'])
    })
})
