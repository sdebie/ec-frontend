import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('@/shared/api/graphql/adminGraphqlClient', () => ({
  adminGraphqlClient: {
    request: vi.fn(),
  },
}))

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { useCustomerDetail } from '../useCustomerDetail'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const mockCustomerDetail = {
  id: 'c1',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john@example.com',
  phone: '+27821234567',
  status: 'ACTIVE',
  shopperType: 'RETAILER',
  registeredAt: '2025-06-15T10:32:00Z',
  wholesaleApplication: {
    id: 'app-1',
    status: 'PENDING',
    companyName: 'Smith Trading Co',
    vatNumber: 'VAT123',
    regNumber: 'REG456',
    email: 'biz@smith.com',
    firstName: 'John',
    lastName: 'Smith',
    createdAt: '2025-05-01T00:00:00Z',
  },
  recentOrders: [
    { id: 'ord-1', reference: 'ORD-0001', placedAt: '2025-06-10T08:00:00Z', total: 15000, status: 'PAID' },
  ],
}

describe('useCustomerDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls adminGraphqlClient (not REST) with customer id', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({ adminCustomer: mockCustomerDetail })

    const { result } = renderHook(
      () => useCustomerDetail('c1'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(adminGraphqlClient.request).toHaveBeenCalledTimes(1)
    const variables = (vi.mocked(adminGraphqlClient.request).mock.calls[0] as unknown as [unknown, Record<string, unknown>])[1]
    expect(variables).toEqual({ id: 'c1' })
  })

  it('returns the customer data from adminCustomer field', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({ adminCustomer: mockCustomerDetail })

    const { result } = renderHook(
      () => useCustomerDetail('c1'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data).toEqual(mockCustomerDetail)
  })

  it('returns undefined when adminCustomer is null (not-found)', async () => {
    vi.mocked(adminGraphqlClient.request).mockResolvedValue({ adminCustomer: null })

    const { result } = renderHook(
      () => useCustomerDetail('missing-id'),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data).toBeUndefined()
  })

  it('does not call GraphQL when customerId is empty', async () => {
    const { result } = renderHook(
      () => useCustomerDetail(''),
      { wrapper: createWrapper() },
    )

    // Give it a tick to see if it would fire
    await new Promise((r) => setTimeout(r, 10))

    expect(adminGraphqlClient.request).not.toHaveBeenCalled()
    expect(result.current.isLoading).toBe(false)
  })
})
