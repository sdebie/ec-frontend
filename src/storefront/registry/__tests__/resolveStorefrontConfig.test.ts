import {beforeEach, describe, expect, it, vi} from 'vitest'

const {
    resolveStorefrontClientMock,
    getHostnameMock,
    mockEnv,
} = vi.hoisted(() => ({
    resolveStorefrontClientMock: vi.fn(),
    getHostnameMock: vi.fn(),
    mockEnv: {
        isDev: false,
        storefrontTenant: undefined as string | undefined,
    },
}))

vi.mock('@/configs/storefront/storefrontRegistry', () => ({
    resolveStorefrontClient: resolveStorefrontClientMock,
}))

vi.mock('@/utils/HostnameResolver', () => ({
    getHostname: getHostnameMock,
}))

vi.mock('@/lib/env', () => ({
    env: mockEnv,
}))

import {resolveActiveStorefrontConfig} from '@/storefront/registry/resolveStorefrontConfig'

describe('resolveActiveStorefrontConfig', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockEnv.isDev = false
        mockEnv.storefrontTenant = undefined
        getHostnameMock.mockReturnValue('store.example.com')
        resolveStorefrontClientMock.mockReturnValue({id: 'default'})
    })

    it('prioritizes explicit forcedClientId over dev env override', () => {
        mockEnv.isDev = true
        mockEnv.storefrontTenant = 'uvh'

        resolveActiveStorefrontConfig({
            hostname: 'tenant.example.com',
            forcedClientId: 'forced-tenant',
        })

        expect(resolveStorefrontClientMock).toHaveBeenCalledWith(
            'tenant.example.com',
            'forced-tenant',
        )
    })

    it('uses dev env tenant override when no explicit override is provided', () => {
        mockEnv.isDev = true
        mockEnv.storefrontTenant = 'uvh'

        resolveActiveStorefrontConfig({hostname: 'tenant.example.com'})

        expect(resolveStorefrontClientMock).toHaveBeenCalledWith(
            'tenant.example.com',
            'uvh',
        )
    })

    it('falls back to hostname lookup in non-dev environments', () => {
        mockEnv.isDev = false
        mockEnv.storefrontTenant = 'uvh'

        resolveActiveStorefrontConfig({hostname: 'tenant.example.com'})

        expect(resolveStorefrontClientMock).toHaveBeenCalledWith(
            'tenant.example.com',
            undefined,
        )
    })

    it('uses HostnameResolver when hostname option is missing', () => {
        resolveActiveStorefrontConfig()

        expect(getHostnameMock).toHaveBeenCalledTimes(1)
        expect(resolveStorefrontClientMock).toHaveBeenCalledWith(
            'store.example.com',
            undefined,
        )
    })
})
