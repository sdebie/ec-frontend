import {describe, expect, it, vi} from 'vitest'

vi.mock('virtual:storefront-config-map', () => ({
    storefrontConfigImports: {
        tenantx: {
            id: 'tenantx',
            displayName: 'Tenant X',
            hostnames: ['tenantx.example.com'],
            branding: {name: 'Tenant X'},
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
        },
    },
}))

import {resolveStorefrontClient} from '@/configs/storefront/storefrontRegistry'

describe('resolveStorefrontClient', () => {
    it('prefers a valid forced client id over hostname resolution', () => {
        const resolved = resolveStorefrontClient('localhost', 'tenantx')
        expect(resolved.id).toBe('tenantx')
    })

    it('falls back to hostname resolution when forced client id is unknown', () => {
        const resolved = resolveStorefrontClient('localhost', 'unknown-tenant')
        expect(resolved.id).toBe('default')
    })

    it('falls back to default client when hostname is unknown', () => {
        const resolved = resolveStorefrontClient('does-not-exist.example.com')
        expect(resolved.id).toBe('default')
    })
})
