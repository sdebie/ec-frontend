import {describe, expect, it, vi} from 'vitest'

import {createStorefrontDataRoutes} from '@/app/router/createStorefrontDataRoutes'

vi.mock('@/configs/storefront/storefrontRouteContracts', async (importOriginal) => {
    const actual = await importOriginal<
        typeof import('@/configs/storefront/storefrontRouteContracts')
    >()
    return {
        ...actual,
        listStorefrontRouteContracts: () => [
            {
                key: 'home',
                path: '/',
                component: vi.fn(),
                menu: true,
                meta: {layout: 'default'},
            },
            {
                key: 'products',
                path: '/products',
                component: vi.fn(),
                menu: true,
                meta: {layout: 'shop'},
            },
        ],
    }
})

describe('createStorefrontDataRoutes', () => {
    it('returns no storefront routes on admin domain', () => {
        const routes = createStorefrontDataRoutes({
            isAdminDomain: true,
            hostname: 'localhost',
        })

        expect(routes).toEqual([])
    })

    it('does not generate wildcard storefront routes', () => {
        const routes = createStorefrontDataRoutes({
            isAdminDomain: false,
            hostname: 'localhost',
        })

        const layoutGroups = routes[0]?.children ?? []
        const hasWildcardRoute = layoutGroups.some((group: {children?: Array<{path?: string}>}) =>
            (group.children ?? []).some((child) => child.path === '*'),
        )

        expect(hasWildcardRoute).toBe(false)
    })
})
