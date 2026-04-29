import {describe, expect, it} from 'vitest'
import {normalizeDiscoveredStorefrontPageKey} from '@/configs/storefront/storefrontPageKeyNormalization'

describe('normalizeDiscoveredStorefrontPageKey', () => {
    it('maps lowercase legacy keys to canonical storefront keys', () => {
        expect(normalizeDiscoveredStorefrontPageKey('contactus')).toBe('contactUs')
        expect(normalizeDiscoveredStorefrontPageKey('aboutus')).toBe('aboutUs')
    })

    it('passes through canonical keys unchanged', () => {
        expect(normalizeDiscoveredStorefrontPageKey('contactUs')).toBe('contactUs')
        expect(normalizeDiscoveredStorefrontPageKey('aboutUs')).toBe('aboutUs')
    })

    it('fails closed for unknown keys', () => {
        expect(normalizeDiscoveredStorefrontPageKey('unknown-page')).toBeUndefined()
    })
})
