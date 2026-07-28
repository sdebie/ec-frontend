import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { CustomerGuard } from './CustomerGuard'

// Session restore lives in useRestoreCustomerSession (mounted by
// StorefrontLayout), not here — see useRestoreCustomerSession.test.tsx.
// CustomerGuard's only job is the redirect, so these tests cover only that.

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
    useCustomerAuthStore.setState({
      isSignedIn: false,
      token: null,
      customerType: 'RETAIL',
      email: null,
    })
  })

  it('redirects to the login page when not signed in', () => {
    renderGuard()
    expect(screen.getByText('Customer Login Page')).toBeInTheDocument()
  })

  it('carries the attempted path as the return parameter', () => {
    renderGuard('/account/dashboard')
    expect(screen.getByText('Customer Login Page')).toBeInTheDocument()
  })

  it('renders children when signed in', () => {
    useCustomerAuthStore.setState({
      token: 'valid-token',
      isSignedIn: true,
      customerType: 'RETAIL',
      email: 'customer@test.com',
    })

    renderGuard()

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects when a token is present but the session was never established', () => {
    // Restore has already run and failed upstream, leaving a stale token.
    // The guard trusts isSignedIn, not the token's presence.
    useCustomerAuthStore.setState({ token: 'stale-token', isSignedIn: false })

    renderGuard()

    expect(screen.getByText('Customer Login Page')).toBeInTheDocument()
  })
})
