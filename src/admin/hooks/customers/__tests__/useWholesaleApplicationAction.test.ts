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
import { useWholesaleApplicationAction } from '../useWholesaleApplicationAction'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useWholesaleApplicationAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls approveWholesaleApplication mutation when action=approve', async () => {
    // The backend approve mutation handles customer provisioning itself —
    // the frontend makes exactly one call.
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      approveWholesaleApplication: { id: 'app-1', status: 'APPROVED' },
    })

    const { result } = renderHook(() => useWholesaleApplicationAction(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ applicationId: 'app-1', action: 'approve' })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const query = String(vi.mocked(adminGraphqlClient.request).mock.calls[0][0])
    expect(query).toContain('approveWholesaleApplication')
  })

  it('calls rejectWholesaleApplication mutation when action=reject', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      rejectWholesaleApplication: { id: 'app-1', status: 'REJECTED' },
    })

    const { result } = renderHook(() => useWholesaleApplicationAction(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ applicationId: 'app-1', action: 'reject' })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const query = String(vi.mocked(adminGraphqlClient.request).mock.calls[0][0])
    expect(query).toContain('rejectWholesaleApplication')
  })

  it('shows approved success toast on approve', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      approveWholesaleApplication: { id: 'app-1', status: 'APPROVED' },
    })

    const { result } = renderHook(() => useWholesaleApplicationAction(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ applicationId: 'app-1', action: 'approve' })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.success).toHaveBeenCalledWith('Wholesale application approved')
  })

  it('shows rejected success toast on reject', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      rejectWholesaleApplication: { id: 'app-1', status: 'REJECTED' },
    })

    const { result } = renderHook(() => useWholesaleApplicationAction(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ applicationId: 'app-1', action: 'reject' })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.success).toHaveBeenCalledWith('Wholesale application rejected')
  })

  it('shows toast.error with duration:0 on ClientError', async () => {
    const clientError = new ClientError(
      { errors: [{ message: 'Application already processed' }], status: 400, headers: new Headers() },
      { query: '' },
    )
    vi.mocked(adminGraphqlClient.request).mockRejectedValue(clientError)

    const { result } = renderHook(() => useWholesaleApplicationAction(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ applicationId: 'app-1', action: 'approve' })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.error).toHaveBeenCalledWith('Application already processed', { duration: 0 })
  })

  it('shows fallback error message on generic error', async () => {
    vi.mocked(adminGraphqlClient.request).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useWholesaleApplicationAction(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ applicationId: 'app-1', action: 'reject' })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.error).toHaveBeenCalledWith('Failed to process wholesale application', { duration: 0 })
  })
})
