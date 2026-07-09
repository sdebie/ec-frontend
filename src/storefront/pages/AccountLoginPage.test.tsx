import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { AccountLoginPage } from './AccountLoginPage'

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

function renderLoginPage(initialEntries = ['/account/login']) {
  const queryClient = createQueryClient()
  return render(
    <GoogleOAuthProvider clientId="test-client-id">
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/account/login" element={<AccountLoginPage />} />
            <Route path="/account" element={<div>Account Dashboard</div>} />
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/products/123" element={<div>Product Page</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}

describe('AccountLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCustomerAuthStore.setState({
      isSignedIn: false,
      token: null,
      customerType: 'RETAIL',
      email: null,
    })
  })

  it('renders email input, password input, and submit button', () => {
    renderLoginPage()

    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows inline validation errors on empty submit', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })

    expect(mockedPost).not.toHaveBeenCalled()
  })

  it('redirects to /account when already signed in', () => {
    useCustomerAuthStore.setState({
      isSignedIn: true,
      token: 'valid-token',
      customerType: 'RETAIL',
      email: 'user@test.com',
    })

    renderLoginPage()

    expect(screen.getByText('Account Dashboard')).toBeInTheDocument()
  })

  it('displays "Invalid email or password." on 401', async () => {
    const user = userEvent.setup()
    mockedPost.mockRejectedValue({ response: { status: 401 } })

    renderLoginPage()

    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password.')
    })
  })

  it('displays "Invalid email or password." on 403', async () => {
    const user = userEvent.setup()
    mockedPost.mockRejectedValue({ response: { status: 403 } })

    renderLoginPage()

    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'somepassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password.')
    })
  })

  it('displays inactive account message on 400 with PENDING status', async () => {
    const user = userEvent.setup()
    mockedPost.mockRejectedValue({
      response: { status: 400, data: { status: 'PENDING' } },
    })

    renderLoginPage()

    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'somepassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Your account is not active. Please contact support.'
      )
    })
  })

  it('displays inactive account message on 400 with DISABLED status', async () => {
    const user = userEvent.setup()
    mockedPost.mockRejectedValue({
      response: { status: 400, data: { status: 'DISABLED' } },
    })

    renderLoginPage()

    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'somepassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Your account is not active. Please contact support.'
      )
    })
  })

  it('displays generic error on network failure', async () => {
    const user = userEvent.setup()
    mockedPost.mockRejectedValue(new Error('Network Error'))

    renderLoginPage()

    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'somepassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Something went wrong. Please try again.'
      )
    })
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const passwordInput = screen.getByLabelText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: /show password/i }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: /hide password/i }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('disables submit button while mutation is pending', async () => {
    const user = userEvent.setup()
    mockedPost.mockReturnValue(new Promise(() => {})) // never resolves

    renderLoginPage()

    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'somepassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /signing in/i })
      expect(button).toBeDisabled()
    })
  })

  it('navigates to ?return= URL on success', async () => {
    const user = userEvent.setup()
    mockedPost.mockResolvedValue({
      data: {
        token: 'jwt-token',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        shopperType: 'RETAILER',
        status: 'ACTIVE',
      },
    })

    renderLoginPage(['/account/login?return=/products/123'])

    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'correctpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Product Page')).toBeInTheDocument()
    })
  })

  it('navigates to / on success when no return param', async () => {
    const user = userEvent.setup()
    mockedPost.mockResolvedValue({
      data: {
        token: 'jwt-token',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        shopperType: 'RETAILER',
        status: 'ACTIVE',
      },
    })

    renderLoginPage()

    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'correctpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument()
    })
  })

  it('navigates to / when return param is an absolute URL (open redirect prevention)', async () => {
    const user = userEvent.setup()
    mockedPost.mockResolvedValue({
      data: {
        token: 'jwt-token',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        shopperType: 'RETAILER',
        status: 'ACTIVE',
      },
    })

    renderLoginPage(['/account/login?return=https://evil.com'])

    await user.type(screen.getByLabelText('Email address'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'correctpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument()
    })
  })

  it('has a link to registration page', () => {
    renderLoginPage()

    const link = screen.getByRole('link', { name: /create one/i })
    expect(link).toHaveAttribute('href', '/account/register')
  })

  it('associates validation errors with inputs via aria-describedby', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      const emailInput = screen.getByLabelText('Email address')
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error')
      expect(emailInput).toHaveAttribute('aria-invalid', 'true')
    })
  })
})
