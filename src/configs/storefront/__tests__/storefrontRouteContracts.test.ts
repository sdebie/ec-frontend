import {describe, expect, it} from 'vitest'

import {storefrontPageRegistry} from '@/configs/storefront/storefrontPageRegistry'
import {
    listStorefrontMenuRoutes,
    listStorefrontPageRoutes,
    listStorefrontRouteContracts,
} from '@/configs/storefront/storefrontRouteContracts'

const toSorted = (values: Iterable<string>): string[] => [...values].sort()

describe('storefrontRouteContracts parity', () => {
    it('keeps menu routes aligned with canonical menu contracts', () => {
        const canonicalMenuKeys = toSorted(
            listStorefrontRouteContracts()
                .filter((route) => route.menu)
                .map((route) => route.key),
        )
        const derivedMenuKeys = toSorted(listStorefrontMenuRoutes().map((route) => route.key))

        expect(derivedMenuKeys).toEqual(canonicalMenuKeys)
    })

    it('keeps page routes aligned with canonical contracts', () => {
        const canonicalPageKeys = toSorted(listStorefrontRouteContracts().map((route) => route.key))
        const derivedPageKeys = toSorted(listStorefrontPageRoutes().map((route) => route.key))

        expect(derivedPageKeys).toEqual(canonicalPageKeys)
    })

    it('keeps default storefront registry aligned with canonical contracts', () => {
        const canonicalPageKeys = toSorted(listStorefrontRouteContracts().map((route) => route.key))
        const registryPageKeys = toSorted(Object.keys(storefrontPageRegistry))

        expect(registryPageKeys).toEqual(canonicalPageKeys)
    })
})
