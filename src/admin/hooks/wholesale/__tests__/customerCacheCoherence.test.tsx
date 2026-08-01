import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { useCustomers } from '@/admin/hooks/customers/useCustomers'
import { useUpdateCustomerStatus } from '@/admin/hooks/customers/useUpdateCustomerStatus'
import { useWholesaleCustomers } from '../useWholesaleCustomers'

vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
  adminGraphqlClient: { request: vi.fn() },
}))
vi.mock('@/shared/ui/components/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const mockedRequest = vi.mocked(adminGraphqlClient.request)

/**
 * Regression guard for the 2026-07-28 consolidation.
 *
 * The Customers screen and the Wholesale Customers screen show the SAME server
 * rows. They used to cache them under two independent React Query key families
 * (`['admin','customers',…]` and `['admin','wholesale-customers',…]`), and each
 * status mutation invalidated only its own — so changing a wholesale customer's
 * status on one screen left the other screen displaying the old status until its
 * cache expired.
 *
 * These tests assert the structural property that makes that impossible: both
 * lists resolve through one key family, so one invalidation reaches both.
 */
describe('customer / wholesale cache coherence', () => {
  let queryClient: QueryClient

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
  })

  function stubList(status: string) {
    mockedRequest.mockImplementation((doc: unknown) => {
      const q = String(doc)
      if (q.includes('customerCount')) return Promise.resolve({ customerCount: 1 })
      if (q.includes('allCustomers')) {
        return Promise.resolve({
          allCustomers: [
            {
              id: 'cust-1',
              firstName: 'Wanda',
              lastName: 'Wholesale',
              email: 'w@test.com',
              status,
              shopperType: 'WHOLESALER',
              registeredAt: '2026-01-01',
              wholesaleApplicationStatus: 'APPROVED',
            },
          ],
        })
      }
      return Promise.resolve({ updateCustomerStatus: { id: 'cust-1', status: 'DISABLED' } })
    })
  }

  it('caches both list screens under one key family', async () => {
    stubList('ACTIVE')

    const both = renderHook(
      () => ({
        all: useCustomers({ page: 1, pageSize: 20 }),
        wholesale: useWholesaleCustomers({ page: 1, pageSize: 20 }),
      }),
      { wrapper }
    )

    await waitFor(() => {
      expect(both.result.current.all.data).toBeDefined()
      expect(both.result.current.wholesale.data).toBeDefined()
    })

    const families = queryClient
      .getQueryCache()
      .getAll()
      .map((q) => (q.queryKey as unknown[])[1])

    expect(families.length).toBeGreaterThan(0)
    // Every cached customer query belongs to the same family. A stray
    // 'wholesale-customers' entry here is the bug returning.
    expect(new Set(families)).toEqual(new Set(['customers']))
  })

  it('a status change invalidates the wholesale list too, not just the one it was made from', async () => {
    stubList('ACTIVE')

    const { result } = renderHook(
      () => ({
        wholesale: useWholesaleCustomers({ page: 1, pageSize: 20 }),
        updateStatus: useUpdateCustomerStatus(),
      }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.wholesale.data).toBeDefined())
    expect(result.current.wholesale.data?.[0].status).toBe('ACTIVE')

    // Simulate the mutation being fired from the *Customers* screen, while the
    // server now reports DISABLED.
    stubList('DISABLED')
    await act(async () => {
      result.current.updateStatus.mutate({ customerId: 'cust-1', status: 'DISABLED' })
    })

    // The wholesale list must pick the change up. Before the consolidation this
    // stayed 'ACTIVE' because the mutation invalidated a different key family.
    await waitFor(() => {
      expect(result.current.wholesale.data?.[0].status).toBe('DISABLED')
    })
  })
})
