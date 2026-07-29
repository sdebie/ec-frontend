import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { AdminGuard } from './AdminGuard'

vi.mock('@/shared/api/http/adminHttpClient', () => ({
  adminHttpClient: {
    get: vi.fn(),
  },
}))

import { adminHttpClient } from '@/shared/api/http/adminHttpClient'

const mockedGet = vi.mocked(adminHttpClient.get)

function renderGuard() {
  return render(
    <MemoryRouter initialEntries={['/admin/dashboard']}>
      <Routes>
        <Route
          path="/admin/dashboard"
          element={
            <AdminGuard>
              <div>Protected Content</div>
            </AdminGuard>
          }
        />
        <Route path="/admin/login" element={<div>Admin Login Page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AdminGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAdminAuthStore.setState({
      isSignedIn: false,
      token: null,
      role: null,
      authority: [],
      userName: null,
      email: null,
    })
  })

  it('redirects to /admin/login when token is null', () => {
    renderGuard()
    expect(screen.getByText('Admin Login Page')).toBeInTheDocument()
  })

  it('renders loading indicator while rehydration fetch is pending', () => {
    useAdminAuthStore.setState({ token: 'valid-token', role: null })
    mockedGet.mockReturnValue(new Promise(() => {})) // never resolves

    renderGuard()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('renders children after successful GET /api/admin/me', async () => {
    useAdminAuthStore.setState({ token: 'valid-token', role: null })
    mockedGet.mockResolvedValue({
      data: {
        role: 'SUPER_ADMIN',
        authority: ['ORDER_READ'],
        userName: 'Admin User',
        email: 'admin@test.com',
      },
    })

    renderGuard()

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it('redirects to /admin/login on rehydration failure', async () => {
    useAdminAuthStore.setState({ token: 'valid-token', role: null })
    mockedGet.mockRejectedValue(new Error('Unauthorized'))

    renderGuard()

    await waitFor(() => {
      expect(screen.getByText('Admin Login Page')).toBeInTheDocument()
    })
  })

  it('renders children immediately (no fetch) when token and role are both already set', () => {
    useAdminAuthStore.setState({
      token: 'valid-token',
      role: 'SUPER_ADMIN',
      isSignedIn: true,
      authority: ['ORDER_READ'],
      userName: 'Admin User',
      email: 'admin@test.com',
    })

    renderGuard()

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(mockedGet).not.toHaveBeenCalled()
  })
})
