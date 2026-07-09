import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { CustomerGuard } from './CustomerGuard'

vi.mock('@/shared/api/http/storefrontHttpClient', () => ({
  storefrontHttpClient: {
    get: vi.fn(),
  },
}))

import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'

const mockedGet = vi.mocked(storefrontHttpClient.get)

function renderGuard(initialPath = '/account/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/account/dashboard"
          element={
            <CustomerGuard>
              <div>Protected Content</div>
            </CustomerGuard>
          }
        />
        <Route path="/account/login" element={<div>Customer Login Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('CustomerGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCustomerAuthStore.setState({
      isSignedIn: false,
      token: null,
      customerType: 'RETAIL',
      email: null,
    })
  })

  it('redirects to /account/login?return=... when token is null', () => {
    renderGuard()
    expect(screen.getByText('Customer Login Page')).toBeInTheDocument()
  })

  it('renders loading indicator with aria-busy while rehydration fetch is pending', () => {
    useCustomerAuthStore.setState({ token: 'valid-token', isSignedIn: false })
    mockedGet.mockReturnValue(new Promise(() => {})) // never resolves

    renderGuard()
    const loader = screen.getByLabelText('Loading')
    expect(loader).toBeInTheDocument()
    expect(loader).toHaveAttribute('aria-busy', 'true')
  })

  it('renders children after successful GET /storefront/customer-portal', async () => {
    useCustomerAuthStore.setState({ token: 'valid-token', isSignedIn: false })

    let resolveRequest!: (value: unknown) => void
    mockedGet.mockReturnValue(
      new Promise((resolve) => { resolveRequest = resolve })
    )

    renderGuard()
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()

    await act(async () => {
      resolveRequest({ data: { shopperType: 'RETAILER', email: 'customer@test.com' } })
    })

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it("maps shopperType 'WHOLESALER' to customerType 'WHOLESALE' after rehydration", async () => {
    useCustomerAuthStore.setState({ token: 'valid-token', isSignedIn: false })

    let resolveRequest!: (value: unknown) => void
    mockedGet.mockReturnValue(
      new Promise((resolve) => { resolveRequest = resolve })
    )

    renderGuard()

    await act(async () => {
      resolveRequest({ data: { shopperType: 'WHOLESALER', email: 'wholesale@test.com' } })
    })

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    expect(useCustomerAuthStore.getState().customerType).toBe('WHOLESALE')
  })

  it('redirects to /account/login on rehydration failure', async () => {
    useCustomerAuthStore.setState({ token: 'valid-token', isSignedIn: false })

    let rejectRequest!: (reason: unknown) => void
    mockedGet.mockReturnValue(
      new Promise((_, reject) => { rejectRequest = reject })
    )

    renderGuard()

    await act(async () => {
      rejectRequest(new Error('Unauthorized'))
    })

    await waitFor(() => {
      expect(screen.getByText('Customer Login Page')).toBeInTheDocument()
    })
  })

  it('renders children immediately (no fetch) when isSignedIn is true', () => {
    useCustomerAuthStore.setState({
      token: 'valid-token',
      isSignedIn: true,
      customerType: 'RETAIL',
      email: 'customer@test.com',
    })

    renderGuard()

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(mockedGet).not.toHaveBeenCalled()
  })

  it('passes AbortController signal to the HTTP request', () => {
    useCustomerAuthStore.setState({ token: 'valid-token', isSignedIn: false })
    mockedGet.mockReturnValue(new Promise(() => {}))

    renderGuard()

    expect(mockedGet).toHaveBeenCalledWith('/storefront/customer-portal', {
      signal: expect.any(AbortSignal),
    })
  })

  it('does not call clearSession when request is aborted (CanceledError)', async () => {
    useCustomerAuthStore.setState({ token: 'valid-token', isSignedIn: false })
    const clearSession = vi.fn()
    useCustomerAuthStore.setState({ clearSession })

    let rejectRequest!: (reason: unknown) => void
    mockedGet.mockReturnValue(
      new Promise((_, reject) => { rejectRequest = reject })
    )

    renderGuard()

    const canceledError = new Error('canceled')
    canceledError.name = 'CanceledError'

    await act(async () => {
      rejectRequest(canceledError)
    })

    expect(clearSession).not.toHaveBeenCalled()
  })
})
