import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'
import { useUpdateProfile } from '../useUpdateProfile'

vi.mock('@/shared/api/http/storefrontHttpClient', () => ({
  storefrontHttpClient: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}))

vi.mock('@/shared/auth/customerAuthStore', () => {
  const setSession = vi.fn()
  return {
    useCustomerAuthStore: Object.assign(
      () => ({
        setSession,
        token: 'existing-token',
        customerType: 'RETAIL' as const,
      }),
      { getState: () => ({ token: 'existing-token', clearSession: vi.fn() }) },
    ),
  }
})

const mockedPatch = vi.mocked(storefrontHttpClient.patch)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useUpdateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('targets PATCH /customers/profile', async () => {
    mockedPatch.mockResolvedValueOnce({
      data: {
        token: 'updated-token',
        email: 'user@example.com',
        firstName: 'Updated',
        lastName: 'Name',
        shopperType: 'RETAILER',
        status: 'ACTIVE',
      },
    })

    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'user@example.com',
      firstName: 'Updated',
      lastName: 'Name',
      phone: '0811234567',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedPatch).toHaveBeenCalledWith('/customers/profile', {
      email: 'user@example.com',
      firstName: 'Updated',
      lastName: 'Name',
      phone: '0811234567',
    })
  })

  it('uses PATCH method, not POST', async () => {
    mockedPatch.mockResolvedValueOnce({
      data: {
        token: 'token',
        email: 'user@example.com',
        firstName: 'User',
        lastName: 'Test',
        shopperType: 'RETAILER',
        status: 'ACTIVE',
      },
    })

    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'user@example.com',
      firstName: 'User',
      lastName: 'Test',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // storefrontHttpClient.post should NOT have been called
    expect(storefrontHttpClient.post).not.toHaveBeenCalled()
    // PATCH should have been called
    expect(mockedPatch).toHaveBeenCalledTimes(1)
  })

  it('logs error with console.error on failure', async () => {
    const error = new Error('Network error')
    mockedPatch.mockRejectedValueOnce(error)

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'user@example.com',
      firstName: 'User',
      lastName: 'Test',
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Profile] action failed:',
      expect.anything(),
    )

    consoleErrorSpy.mockRestore()
  })
})
