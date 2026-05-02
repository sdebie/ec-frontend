import {beforeEach, describe, expect, it, vi} from 'vitest'

const {
    resolveStorefrontClientMock,
    resolveStorefrontClientByHostnameMock,
    resolveStorefrontClientByIdMock,
    getHostnameMock,
    mockEnv,
} = vi.hoisted(() => ({
    resolveStorefrontClientMock: vi.fn(),
    resolveStorefrontClientByHostnameMock: vi.fn(),
    resolveStorefrontClientByIdMock: vi.fn(),
    getHostnameMock: vi.fn(),
    mockEnv: {
        isDev: false,
        storefrontTenant: undefined as string | undefined,
        storefrontDefaultTenant: undefined as string | undefined,
    },
}))

vi.mock('@/configs/storefront/storefrontRegistry', async (importOriginal) => {
    const actual = await importOriginal<
        typeof import('@/configs/storefront/storefrontRegistry')
    >()
    return {
        ...actual,
        resolveStorefrontClient: resolveStorefrontClientMock,
        resolveStorefrontClientByHostname: resolveStorefrontClientByHostnameMock,
        resolveStorefrontClientById: resolveStorefrontClientByIdMock,
    }
})

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
        mockEnv.storefrontDefaultTenant = undefined
        getHostnameMock.mockReturnValue('store.example.com')
        resolveStorefrontClientByHostnameMock.mockReturnValue(undefined)
        resolveStorefrontClientByIdMock.mockImplementation((id: string | undefined) =>
            id === 'uvh' ? {id: 'uvh'} : undefined,
        )
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

        const result = resolveActiveStorefrontConfig({hostname: 'tenant.example.com'})

        expect(resolveStorefrontClientByHostnameMock).toHaveBeenCalledWith(
            'tenant.example.com',
        )
        expect(resolveStorefrontClientByIdMock).toHaveBeenCalledWith('uvh')
        expect(result).toEqual({id: 'uvh'})
    })

    it('falls back to hostname lookup in non-dev environments', () => {
        mockEnv.isDev = false
        mockEnv.storefrontTenant = 'uvh'
        resolveStorefrontClientByIdMock.mockReturnValue(undefined)

        resolveActiveStorefrontConfig({hostname: 'tenant.example.com'})

        expect(resolveStorefrontClientByHostnameMock).toHaveBeenCalledWith(
            'tenant.example.com',
        )
        expect(resolveStorefrontClientMock).toHaveBeenCalledWith('tenant.example.com')
    })

    it('uses HostnameResolver when hostname option is missing', () => {
        resolveActiveStorefrontConfig()

        expect(getHostnameMock).toHaveBeenCalledTimes(1)
        expect(resolveStorefrontClientByHostnameMock).toHaveBeenCalledWith(
            'store.example.com',
        )
        expect(resolveStorefrontClientMock).toHaveBeenCalledWith('store.example.com')
    })
})
