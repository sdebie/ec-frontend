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
import { useUpdateSetting } from '../useUpdateSetting'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useUpdateSetting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls adminGraphqlClient.request with key and value', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      updateSetting: { key: 'vat_rate_percent', value: '0.15', description: null },
    })

    const { result } = renderHook(() => useUpdateSetting(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ key: 'vat_rate_percent', value: '0.15' })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const variables = vi.mocked(adminGraphqlClient.request).mock.calls[0][1]
    expect(variables).toEqual({ key: 'vat_rate_percent', value: '0.15' })
  })

  it('invalidates admin-store-settings cache on success', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      updateSetting: { key: 'vat_rate_percent', value: '0.15', description: null },
    })

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    queryClient.setQueryData(['admin-store-settings'], [{ key: 'vat_rate_percent', value: '0.10', description: null }])

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useUpdateSetting(), { wrapper })

    act(() => {
      result.current.mutate({ key: 'vat_rate_percent', value: '0.15' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const state = queryClient.getQueryState(['admin-store-settings'])
    expect(state?.isInvalidated).toBe(true)
  })

  it('shows toast.error with duration:0 on ClientError', async () => {
    const clientError = new ClientError(
      { errors: [{ message: 'Invalid value' }], status: 400, headers: new Headers() },
      { query: '' },
    )
    vi.mocked(adminGraphqlClient.request).mockRejectedValue(clientError)

    const { result } = renderHook(() => useUpdateSetting(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ key: 'vat_rate_percent', value: 'abc' })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.error).toHaveBeenCalledWith('Invalid value', { duration: 0 })
  })

  it('shows fallback error message on generic error', async () => {
    vi.mocked(adminGraphqlClient.request).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useUpdateSetting(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ key: 'vat_rate_percent', value: '0.15' })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.error).toHaveBeenCalledWith('Failed to update setting', { duration: 0 })
  })
})
