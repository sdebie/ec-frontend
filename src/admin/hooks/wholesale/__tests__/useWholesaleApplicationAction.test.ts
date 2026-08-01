import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
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

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function wrapperFor(queryClient: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useWholesaleApplicationAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls approveWholesaleApplication with the application id when action=approve', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      approveWholesaleApplication: { id: 'app-1', status: 'APPROVED' },
    })

    const { result } = renderHook(() => useWholesaleApplicationAction(), {
      wrapper: wrapperFor(makeClient()),
    })

    result.current.mutate({ applicationId: 'app-1', action: 'approve' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock
      .calls[0] as unknown as [unknown, Record<string, unknown>]
    expect(String(document)).toContain('approveWholesaleApplication')
    expect(variables).toEqual({ id: 'app-1' })
    expect(toast.success).toHaveBeenCalledWith(
      'Wholesale application approved and customer account created',
    )
  })

  it('calls rejectWholesaleApplication with the application id and reason when action=reject', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      rejectWholesaleApplication: { id: 'app-2', status: 'REJECTED' },
    })

    const { result } = renderHook(() => useWholesaleApplicationAction(), {
      wrapper: wrapperFor(makeClient()),
    })

    result.current.mutate({ applicationId: 'app-2', action: 'reject', reason: 'Incomplete documents' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const [document, variables] = vi.mocked(adminGraphqlClient.request).mock
      .calls[0] as unknown as [unknown, Record<string, unknown>]
    expect(String(document)).toContain('rejectWholesaleApplication')
    expect(variables).toEqual({ id: 'app-2', reason: 'Incomplete documents' })
    expect(toast.success).toHaveBeenCalledWith('Wholesale application rejected')
  })

  // These two tests previously asserted the OLD split-cache behaviour — including
  // that the customer caches were NOT invalidated without a customerId, which was
  // the staleness bug written down as a requirement. Approving an application
  // changes the customer's tier wherever it is displayed, so every customer cache
  // must refresh regardless of which screen invoked it.
  it('invalidates every customer cache with one prefix, with or without a customerId', async () => {
    for (const payload of [
      { applicationId: 'app-1', action: 'approve' as const },
      { applicationId: 'app-1', action: 'approve' as const, customerId: 'cust-9' },
    ]) {
      vi.mocked(adminGraphqlClient.request).mockResolvedValue({
        approveWholesaleApplication: { id: 'app-1', status: 'APPROVED' },
      })
      const queryClient = makeClient()
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useWholesaleApplicationAction(), {
        wrapper: wrapperFor(queryClient),
      })

      result.current.mutate(payload)
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      const keys = invalidateSpy.mock.calls.map((c) => JSON.stringify(c[0]?.queryKey))
      expect(keys).toContain(JSON.stringify(['admin', 'wholesale-applications']))
      expect(keys).toContain(JSON.stringify(['admin', 'wholesale-application', 'app-1']))
      // The bare ['admin','customers'] prefix — this is what reaches the customer
      // list, the count, the customer detail AND the wholesale list/detail.
      expect(keys).toContain(JSON.stringify(['admin', 'customers']))
    }
  })

  it('no longer references the retired wholesale-customers key family', async () => {
    // Regression guard for the consolidation: the wholesale hooks share the
    // ['admin','customers', …] family now, so invalidating a separate
    // 'wholesale-customers' family would silently refresh nothing.
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({
      approveWholesaleApplication: { id: 'app-1', status: 'APPROVED' },
    })
    const queryClient = makeClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useWholesaleApplicationAction(), {
      wrapper: wrapperFor(queryClient),
    })

    result.current.mutate({ applicationId: 'app-1', action: 'approve', customerId: 'cust-9' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const keys = invalidateSpy.mock.calls.map((c) => JSON.stringify(c[0]?.queryKey))
    expect(keys.some((k) => k?.includes('wholesale-customers'))).toBe(false)
  })

  it('surfaces the server error message and logs on failure', async () => {
    const clientError = new ClientError(
      { errors: [{ message: 'Application already processed' }], status: 400, headers: {} } as unknown as ConstructorParameters<typeof ClientError>[0],
      { query: 'mutation' } as unknown as ConstructorParameters<typeof ClientError>[1],
    )
    vi.mocked(adminGraphqlClient.request).mockRejectedValue(clientError)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useWholesaleApplicationAction(), {
      wrapper: wrapperFor(makeClient()),
    })

    result.current.mutate({ applicationId: 'app-1', action: 'reject' })
    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(toast.error).toHaveBeenCalledWith('Application already processed', { duration: 0 })
    expect(consoleSpy).toHaveBeenCalledWith(
      '[WholesaleApplicationAction] action failed:',
      'Application already processed',
    )
    consoleSpy.mockRestore()
  })
})
