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
import { useSaveShippingMethod } from '../useSaveShippingMethod'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useSaveShippingMethod', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls adminGraphqlClient.request on mutate', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      saveShippingMethod: { id: '1', name: 'Standard', active: true, baseFee: 50, estimatedDays: '3-5 days', requiresAddress: true },
    })

    const { result } = renderHook(() => useSaveShippingMethod(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ id: '1', name: 'Standard', active: true, baseFee: 50, estimatedDays: '3-5 days', requiresAddress: true })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
  })

  it('invalidates admin-shipping-methods cache on success', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      saveShippingMethod: { id: '1', name: 'Standard', active: true, baseFee: 50, estimatedDays: '3-5 days', requiresAddress: true },
    })

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    queryClient.setQueryData(['admin-shipping-methods'], [{ id: '1', name: 'Old', active: true, baseFee: 10, estimatedDays: '1-2 days', requiresAddress: true }])

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(() => useSaveShippingMethod(), { wrapper })

    act(() => {
      result.current.mutate({ id: '1', name: 'Standard', active: true, baseFee: 50, estimatedDays: '3-5 days', requiresAddress: true })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const state = queryClient.getQueryState(['admin-shipping-methods'])
    expect(state?.isInvalidated).toBe(true)
  })

  it('shows toast.error with duration:0 on ClientError', async () => {
    const clientError = new ClientError(
      ({ errors: [{ message: 'Save failed' }], status: 400, headers: new Headers() } as unknown as ConstructorParameters<typeof ClientError>[0]),
      { query: '' },
    )
    vi.mocked(adminGraphqlClient.request).mockRejectedValue(clientError)

    const { result } = renderHook(() => useSaveShippingMethod(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ id: null, name: 'Express', active: true, baseFee: 100, estimatedDays: '1-2 days', requiresAddress: true })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.error).toHaveBeenCalledWith('Save failed', { duration: 0 })
  })

  it('shows fallback error message on generic error', async () => {
    vi.mocked(adminGraphqlClient.request).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useSaveShippingMethod(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ id: null, name: 'Express', active: true, baseFee: 100, estimatedDays: '1-2 days', requiresAddress: true })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.error).toHaveBeenCalledWith('Failed to save shipping method', { duration: 0 })
  })
})
