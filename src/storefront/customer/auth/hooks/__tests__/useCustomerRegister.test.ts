import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'
import { useCustomerRegister } from '../useCustomerRegister'

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
      (selector: (s: unknown) => unknown) =>
        selector({ setSession }),
      { getState: () => ({ token: null, clearSession: vi.fn() }) },
    ),
  }
})

vi.mock('@/storefront/customer/account/wishlist/mergeWishlistOnSignIn', () => ({
  mergeWishlistOnSignIn: vi.fn(),
}))

const mockedPost = vi.mocked(storefrontHttpClient.post)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useCustomerRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('targets POST /customers/register', async () => {
    mockedPost.mockResolvedValueOnce({
      data: {
        token: 'jwt-123',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        shopperType: 'RETAILER',
        status: 'ACTIVE',
      },
    })

    const { result } = renderHook(() => useCustomerRegister(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'new@example.com',
      password: 'Passw0rd!',
      firstName: 'New',
      lastName: 'User',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedPost).toHaveBeenCalledWith('/customers/register', {
      email: 'new@example.com',
      password: 'Passw0rd!',
      firstName: 'New',
      lastName: 'User',
    })
  })

  it('handles 409 conflict with a descriptive error', async () => {
    const axiosError = Object.assign(new Error('Request failed with status code 409'), {
      isAxiosError: true,
      response: { status: 409, data: { message: 'Account already exists' } },
      config: {},
      toJSON: () => ({}),
    })
    mockedPost.mockRejectedValueOnce(axiosError)

    // Mock console.error to verify it is called
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useCustomerRegister(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'taken@example.com',
      password: 'Passw0rd!',
      firstName: 'Taken',
      lastName: 'User',
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    // Verify console.error was called with the error visibility pattern
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[Registration] action failed:',
      expect.anything(),
    )

    consoleErrorSpy.mockRestore()
  })
})
