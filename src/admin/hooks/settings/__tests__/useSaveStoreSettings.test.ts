import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClientError } from 'graphql-request'
import { createElement } from 'react'

vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
  adminGraphqlClient: {
    request: vi.fn(),
  },
}))

vi.mock('@/shared/ui/components/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { toast } from '@/shared/ui/components/toast'
import { useSaveStoreSettings } from '../useSaveStoreSettings'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useSaveStoreSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls adminGraphqlClient.request with the full list of settings in one call', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      saveStoreSettings: [
        { key: 'storefront.contact', value: '{}', description: null },
        { key: 'storefront.footer', value: '{}', description: null },
      ],
    })

    const { result } = renderHook(() => useSaveStoreSettings(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate([
        { key: 'storefront.contact', value: '{"a":1}' },
        { key: 'storefront.footer', value: '{"b":2}' },
      ])
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const variables = (vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>])[1]
    expect(variables).toEqual({
      storeSettingsDto: [
        { key: 'storefront.contact', value: '{"a":1}' },
        { key: 'storefront.footer', value: '{"b":2}' },
      ],
    })
  })

  it('invalidates admin-store-settings cache on success', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      saveStoreSettings: [{ key: 'storefront.contact', value: '{}', description: null }],
    })

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    queryClient.setQueryData(['admin-store-settings'], [{ key: 'storefront.contact', value: '{}', description: null }])

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useSaveStoreSettings(), { wrapper })

    act(() => {
      result.current.mutate([{ key: 'storefront.contact', value: '{}' }])
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const state = queryClient.getQueryState(['admin-store-settings'])
    expect(state?.isInvalidated).toBe(true)
  })

  it('shows toast.error with duration:0 on ClientError', async () => {
    const clientError = new ClientError(
      ({ errors: [{ message: 'Invalid value' }], status: 400, headers: new Headers() } as unknown as ConstructorParameters<typeof ClientError>[0]),
      { query: '' },
    )
    vi.mocked(adminGraphqlClient.request).mockRejectedValue(clientError)

    const { result } = renderHook(() => useSaveStoreSettings(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate([{ key: 'storefront.contact', value: '{}' }])
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.error).toHaveBeenCalledWith('Invalid value', { duration: 0 })
  })

  it('shows fallback error message on generic error', async () => {
    vi.mocked(adminGraphqlClient.request).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useSaveStoreSettings(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate([{ key: 'storefront.contact', value: '{}' }])
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.error).toHaveBeenCalledWith('Failed to save settings', { duration: 0 })
  })
})
