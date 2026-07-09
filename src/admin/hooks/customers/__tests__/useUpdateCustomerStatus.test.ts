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
import { useUpdateCustomerStatus } from '../useUpdateCustomerStatus'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useUpdateCustomerStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls adminGraphqlClient (not REST) with id and status', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      updateCustomerStatus: { id: 'c1', status: 'DISABLED' },
    })

    const { result } = renderHook(() => useUpdateCustomerStatus(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ customerId: 'c1', status: 'DISABLED' })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const variables = vi.mocked(adminGraphqlClient.request).mock.calls[0][1]
    expect(variables).toEqual({ id: 'c1', status: 'DISABLED' })
  })

  it('shows success toast on successful mutation', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      updateCustomerStatus: { id: 'c1', status: 'ACTIVE' },
    })

    const { result } = renderHook(() => useUpdateCustomerStatus(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ customerId: 'c1', status: 'ACTIVE' })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.success).toHaveBeenCalledWith('Customer status updated')
  })

  it('shows toast.error with duration:0 on ClientError', async () => {
    const clientError = new ClientError(
      { errors: [{ message: 'Invalid status transition' }], status: 400, headers: new Headers() },
      { query: '' },
    )
    vi.mocked(adminGraphqlClient.request).mockRejectedValue(clientError)

    const { result } = renderHook(() => useUpdateCustomerStatus(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ customerId: 'c1', status: 'ACTIVE' })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.error).toHaveBeenCalledWith('Invalid status transition', { duration: 0 })
  })

  it('shows fallback error message on generic error', async () => {
    vi.mocked(adminGraphqlClient.request).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useUpdateCustomerStatus(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ customerId: 'c1', status: 'ACTIVE' })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.error).toHaveBeenCalledWith('Failed to update customer status', { duration: 0 })
  })
})
