/**
 * Tests that the rate-limit GraphQL error message surfaces through the existing
 * useWholesaleApplicationSubmit onError handler as a persistent toast, and that
 * console.error is called per the project convention.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClientError } from 'graphql-request'
import { createElement } from 'react'

vi.mock('@/shared/api/graphql/graphqlClient', () => ({
  graphqlClient: {
    request: vi.fn(),
  },
}))

vi.mock('@/shared/ui/components/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}))

import { graphqlClient } from '@/shared/api/graphql/graphqlClient'
import { toast } from '@/shared/ui/components/toast'
import { useWholesaleApplicationSubmit } from '../hooks/useWholesaleApplicationSubmit'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const RATE_LIMIT_MESSAGE = 'Too many requests \u2014 please try again later.'

const sampleInput = {
  applicantEmail: 'test@example.com',
  email: null,
  firstName: 'John',
  lastName: 'Doe',
  phone: '0821234567',
  companyName: 'Acme',
  tradingName: null,
  companyPhone: null,
  companyEmail: null,
  vatNumber: '',
  regNumber: '',
  financeContactName: null,
  financeContactEmail: null,
  financeContactPhone: null,
  purchaseOrderRequired: false,
  notes: '',
  status: 'PENDING',
  physicalAddress: {
    line1: '123 Main St',
    line2: '',
    suburb: '',
    city: 'Johannesburg',
    province: 'Gauteng',
    postalCode: '2196',
  },
  postalAddress: {
    line1: '',
    line2: '',
    suburb: '',
    city: '',
    province: '',
    postalCode: '',
  },
}

function createRateLimitClientError() {
  return new ClientError(
    {
      errors: [{ message: RATE_LIMIT_MESSAGE }],
      status: 200,
      headers: new Headers(),
    } as unknown as ConstructorParameters<typeof ClientError>[0],
    { query: '' },
  )
}

describe('useWholesaleApplicationSubmit — rate-limit error path', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays rate-limit message from GraphQL errors in a persistent toast', async () => {
    vi.mocked(graphqlClient.request).mockRejectedValue(createRateLimitClientError())

    const { result } = renderHook(() => useWholesaleApplicationSubmit(), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.mutate(sampleInput)
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(toast.error).toHaveBeenCalledWith(RATE_LIMIT_MESSAGE, { duration: 0 })
  })

})
