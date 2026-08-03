import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { CUSTOMER_PROFILE_QUERY_KEY } from '@/storefront/customer/account/hooks/useCustomerProfile'
import { StorefrontLayout } from '@/storefront/layouts/StorefrontLayout'
import { useRestoreCustomerSession } from '../useRestoreCustomerSession'

vi.mock('@/shared/api/http/storefrontHttpClient', () => ({
  storefrontHttpClient: {
    get: vi.fn(),
  },
}))

// StorefrontLayout's chrome is irrelevant here; only the outlet gate matters.
vi.mock('@/storefront/layouts/AnnouncementBanner', () => ({
  AnnouncementBanner: () => null,
}))
vi.mock('@/storefront/layouts/StorefrontHeader', () => ({
  StorefrontHeader: () => null,
}))
vi.mock('@/storefront/layouts/StorefrontFooter', () => ({
  StorefrontFooter: () => null,
}))
vi.mock('react-router-dom', () => ({
  Outlet: () => <div>Page Content</div>,
  // StorefrontLayout mounts ScrollToTop, which reads the current location.
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'test' }),
}))

import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'

const mockedGet = vi.mocked(storefrontHttpClient.get)

let queryClient: QueryClient

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

const renderRestoreHook = () => renderHook(() => useRestoreCustomerSession(), { wrapper })

describe('useRestoreCustomerSession', () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.clearAllMocks()
    useCustomerAuthStore.setState({
      isSignedIn: false,
      token: null,
      customerType: 'RETAIL',
      email: null,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('makes no request and does not restore when there is no token', () => {
    const { result } = renderRestoreHook()

    expect(result.current.isRestoring).toBe(false)
    expect(mockedGet).not.toHaveBeenCalled()
  })

  it('makes no request when the session is already established', () => {
    useCustomerAuthStore.setState({ token: 'valid-token', isSignedIn: true })

    const { result } = renderRestoreHook()

    expect(result.current.isRestoring).toBe(false)
    expect(mockedGet).not.toHaveBeenCalled()
  })

  it('reports isRestoring while the token is being exchanged', () => {
    useCustomerAuthStore.setState({ token: 'valid-token', isSignedIn: false })
    mockedGet.mockReturnValue(new Promise(() => {})) // never resolves

    const { result } = renderRestoreHook()

    expect(result.current.isRestoring).toBe(true)
    expect(mockedGet).toHaveBeenCalledWith('/storefront/customer-portal', {
      signal: expect.any(AbortSignal),
    })
  })

  it("restores a wholesale customer's tier, not the RETAIL default", async () => {
    // The regression this hook exists for: customerAuthStore persists only the
    // token, so before restore a reloaded wholesale customer reads as RETAIL
    // and every price surface would select retail figures.
    useCustomerAuthStore.setState({ token: 'valid-token', isSignedIn: false })
    expect(useCustomerAuthStore.getState().customerType).toBe('RETAIL')

    let resolveRequest!: (value: unknown) => void
    mockedGet.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      })
    )

    const { result } = renderRestoreHook()

    await act(async () => {
      resolveRequest({ data: { shopperType: 'WHOLESALER', email: 'wholesale@test.com' } })
    })

    await waitFor(() => {
      expect(useCustomerAuthStore.getState().customerType).toBe('WHOLESALE')
    })
    expect(useCustomerAuthStore.getState().isSignedIn).toBe(true)
    expect(result.current.isRestoring).toBe(false)
  })

  it("maps shopperType 'RETAILER' to customerType 'RETAIL'", async () => {
    useCustomerAuthStore.setState({ token: 'valid-token', isSignedIn: false })

    let resolveRequest!: (value: unknown) => void
    mockedGet.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      })
    )

    renderRestoreHook()

    await act(async () => {
      resolveRequest({ data: { shopperType: 'RETAILER', email: 'customer@test.com' } })
    })

    await waitFor(() => {
      expect(useCustomerAuthStore.getState().customerType).toBe('RETAIL')
    })
    expect(useCustomerAuthStore.getState().email).toBe('customer@test.com')
  })

  it('clears the session and logs when the exchange fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    useCustomerAuthStore.setState({ token: 'stale-token', isSignedIn: false })

    let rejectRequest!: (reason: unknown) => void
    mockedGet.mockReturnValue(
      new Promise((_, reject) => {
        rejectRequest = reject
      })
    )

    const { result } = renderRestoreHook()

    await act(async () => {
      rejectRequest(new Error('Unauthorized'))
    })

    await waitFor(() => {
      expect(useCustomerAuthStore.getState().token).toBeNull()
    })
    expect(useCustomerAuthStore.getState().isSignedIn).toBe(false)
    // A cleared token settles isRestoring — it must not strand the outlet.
    expect(result.current.isRestoring).toBe(false)
    expect(consoleError).toHaveBeenCalledWith(
      '[Auth] customer session restore failed:',
      expect.any(Error)
    )
  })

  it('seeds the customer-profile cache so account pages do not refetch it', async () => {
    // Without this, an account page mounting after a restore issues a second
    // identical GET /storefront/customer-portal via useCustomerProfile.
    useCustomerAuthStore.setState({ token: 'valid-token', isSignedIn: false })
    expect(queryClient.getQueryData(CUSTOMER_PROFILE_QUERY_KEY)).toBeUndefined()

    let resolveRequest!: (value: unknown) => void
    mockedGet.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      })
    )

    renderRestoreHook()

    const profile = { shopperType: 'WHOLESALER', email: 'wholesale@test.com' }
    await act(async () => {
      resolveRequest({ data: profile })
    })

    await waitFor(() => {
      expect(queryClient.getQueryData(CUSTOMER_PROFILE_QUERY_KEY)).toEqual(profile)
    })
  })

  it('does not seed the cache when the exchange fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    useCustomerAuthStore.setState({ token: 'stale-token', isSignedIn: false })

    let rejectRequest!: (reason: unknown) => void
    mockedGet.mockReturnValue(
      new Promise((_, reject) => {
        rejectRequest = reject
      })
    )

    renderRestoreHook()

    await act(async () => {
      rejectRequest(new Error('Unauthorized'))
    })

    await waitFor(() => {
      expect(useCustomerAuthStore.getState().token).toBeNull()
    })
    expect(queryClient.getQueryData(CUSTOMER_PROFILE_QUERY_KEY)).toBeUndefined()
  })

  it('does not clear the session when the request is aborted', async () => {
    useCustomerAuthStore.setState({ token: 'valid-token', isSignedIn: false })
    const clearSession = vi.fn()
    useCustomerAuthStore.setState({ clearSession })

    let rejectRequest!: (reason: unknown) => void
    mockedGet.mockReturnValue(
      new Promise((_, reject) => {
        rejectRequest = reject
      })
    )

    renderRestoreHook()

    const canceledError = new Error('canceled')
    canceledError.name = 'CanceledError'

    await act(async () => {
      rejectRequest(canceledError)
    })

    expect(clearSession).not.toHaveBeenCalled()
  })
})

describe('StorefrontLayout session gate', () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    vi.clearAllMocks()
    useCustomerAuthStore.setState({
      isSignedIn: false,
      token: null,
      customerType: 'RETAIL',
      email: null,
    })
  })

  it('renders page content immediately for an anonymous shopper', () => {
    render(<StorefrontLayout />, { wrapper })

    expect(screen.getByText('Page Content')).toBeInTheDocument()
    expect(mockedGet).not.toHaveBeenCalled()
  })

  it('withholds page content while a persisted token is being exchanged', () => {
    useCustomerAuthStore.setState({ token: 'valid-token', isSignedIn: false })
    mockedGet.mockReturnValue(new Promise(() => {}))

    render(<StorefrontLayout />, { wrapper })

    expect(screen.queryByText('Page Content')).not.toBeInTheDocument()
    const loader = screen.getByLabelText('Loading')
    expect(loader).toHaveAttribute('aria-busy', 'true')
  })

  it('renders page content once the tier has been restored', async () => {
    useCustomerAuthStore.setState({ token: 'valid-token', isSignedIn: false })

    let resolveRequest!: (value: unknown) => void
    mockedGet.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      })
    )

    render(<StorefrontLayout />, { wrapper })
    expect(screen.queryByText('Page Content')).not.toBeInTheDocument()

    await act(async () => {
      resolveRequest({ data: { shopperType: 'WHOLESALER', email: 'wholesale@test.com' } })
    })

    await waitFor(() => {
      expect(screen.getByText('Page Content')).toBeInTheDocument()
    })
    expect(useCustomerAuthStore.getState().customerType).toBe('WHOLESALE')
  })
})
