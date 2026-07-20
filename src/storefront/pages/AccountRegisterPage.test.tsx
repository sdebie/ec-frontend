import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { AccountRegisterPage } from './AccountRegisterPage'

vi.mock('@/shared/api/http/storefrontHttpClient', () => ({
  storefrontHttpClient: {
    post: vi.fn(),
  },
}))

import { storefrontHttpClient } from '@/shared/api/http/storefrontHttpClient'

const mockedPost = vi.mocked(storefrontHttpClient.post)

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
}

function renderRegisterPage(initialEntries = ['/account/register']) {
  const queryClient = createQueryClient()
  return render(
    <GoogleOAuthProvider clientId="test-client-id">
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/account/register" element={<AccountRegisterPage />} />
            <Route path="/account" element={<div>Account Dashboard</div>} />
            <Route path="/account/login" element={<div>Login Page</div>} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}

describe('AccountRegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCustomerAuthStore.setState({
      isSignedIn: false,
      token: null,
      customerType: 'RETAIL',
      email: null,
    })
  })

  it('shows "Passwords do not match" error without network call when passwords differ', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByLabelText('First name'), 'Jane')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    await user.type(screen.getByLabelText('Email address'), 'jane@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm password'), 'different456')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
    })

    expect(mockedPost).not.toHaveBeenCalled()
  })

  it('shows validation error when password is under 8 characters', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByLabelText('First name'), 'Jane')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    await user.type(screen.getByLabelText('Email address'), 'jane@example.com')
    await user.type(screen.getByLabelText('Password'), 'short')
    await user.type(screen.getByLabelText('Confirm password'), 'short')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    })

    expect(mockedPost).not.toHaveBeenCalled()
  })

  it('shows email-exists message with login link on 409 response', async () => {
    const user = userEvent.setup()
    mockedPost.mockRejectedValue({ response: { status: 409 } })

    renderRegisterPage()

    await user.type(screen.getByLabelText('First name'), 'Jane')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    await user.type(screen.getByLabelText('Email address'), 'existing@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'An account with this email already exists.'
      )
      const signInLink = screen.getByRole('link', { name: /sign in instead/i })
      expect(signInLink).toHaveAttribute('href', '/account/login')
    })
  })

  it('redirects to /account on successful registration', async () => {
    const user = userEvent.setup()
    mockedPost.mockResolvedValue({
      data: {
        token: 'jwt-token',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        shopperType: 'RETAILER',
        status: 'ACTIVE',
      },
    })

    renderRegisterPage()

    await user.type(screen.getByLabelText('First name'), 'Jane')
    await user.type(screen.getByLabelText('Last name'), 'Doe')
    await user.type(screen.getByLabelText('Email address'), 'jane@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.type(screen.getByLabelText('Confirm password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Account Dashboard')).toBeInTheDocument()
    })
  })
})
