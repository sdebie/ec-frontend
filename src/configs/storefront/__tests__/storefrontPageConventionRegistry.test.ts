import {describe, expect, it, vi} from 'vitest'

vi.mock('virtual:storefront-page-map', () => ({
    storefrontPageImports: {
        'uvh/contactus': async () => ({default: () => null}),
        'uvh/aboutus': async () => ({default: () => null}),
        'default/home': async () => ({default: () => null}),
    },
}))

describe('resolveStorefrontConventionPage', () => {
    it('resolves canonical keys from lowercase discovered keys', async () => {
        const {resolveStorefrontConventionPage} = await import('@/configs/storefront/storefrontPageConventionRegistry')

        expect(resolveStorefrontConventionPage('uvh', 'contactUs')).toBeDefined()
        expect(resolveStorefrontConventionPage('uvh', 'aboutUs')).toBeDefined()
    })
})
