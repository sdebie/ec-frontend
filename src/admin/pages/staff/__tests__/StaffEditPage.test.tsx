import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'

const mockMutate = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockStaff = {
  id: 'staff-1',
  email: 'staff@test.com',
  fullName: 'Staff User',
  role: 'CATALOG_MANAGER' as const,
  active: true,
  resetPassword: false,
  createdAt: '2024-01-01',
}

vi.mock('@/admin/hooks/staff', () => ({
  useStaffMember: vi.fn(() => ({
    data: mockStaff,
    isLoading: false,
    error: null,
  })),
  useUpdateStaff: vi.fn(() => ({
    mutate: mockMutate,
    isPending: false,
  })),
}))

import { StaffEditPage } from '../StaffEditPage'

function renderEditPage(id = 'staff-1') {
  return render(
    <MemoryRouter initialEntries={[`/admin/staff/${id}/edit`]}>
      <Routes>
        <Route path="/admin/staff/:id/edit" element={<StaffEditPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('StaffEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAdminAuthStore.setState({
      isSignedIn: true,
      token: 'test-token',
      role: 'SUPER_ADMIN',
      authority: ['SUPER_ADMIN'],
      userName: 'Admin',
      email: 'admin@test.com',
      userId: 'admin-1',
    })
  })

  describe('form pre-population', () => {
    it('pre-populates email field from staff data', async () => {
      renderEditPage()

      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText('staff@example.com') as HTMLInputElement
        expect(emailInput.value).toBe('staff@test.com')
      })
    })

    it('pre-populates fullName field from staff data', async () => {
      renderEditPage()

      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Full name') as HTMLInputElement
        expect(nameInput.value).toBe('Staff User')
      })
    })

    it('does not render a password field', () => {
      renderEditPage()
      expect(screen.queryByPlaceholderText('Minimum 8 characters')).not.toBeInTheDocument()
    })
  })

  describe('self-edit guard', () => {
    beforeEach(() => {
      // Set userId to match the staff being edited
      useAdminAuthStore.setState({ userId: 'staff-1' })
    })

    it('disables the role select when editing own record', async () => {
      renderEditPage('staff-1')

      await waitFor(() => {
        // The Select button renders with disabled attribute
        const roleButton = screen.getByRole('button', { name: /catalog manager/i })
        expect(roleButton).toBeDisabled()
      })
    })

    it('disables the isActive switcher when editing own record', async () => {
      renderEditPage('staff-1')

      await waitFor(() => {
        // The Switcher renders a hidden checkbox with disabled attribute
        const checkbox = screen.getByRole('checkbox', { hidden: true })
        expect(checkbox).toBeDisabled()
      })
    })
  })

  describe('editing other staff member', () => {
    it('does not disable role select when editing another user', async () => {
      useAdminAuthStore.setState({ userId: 'admin-1' })
      renderEditPage('staff-1')

      await waitFor(() => {
        const roleButton = screen.getByRole('button', { name: /catalog manager/i })
        expect(roleButton).not.toBeDisabled()
      })
    })

    it('does not disable isActive switcher when editing another user', async () => {
      useAdminAuthStore.setState({ userId: 'admin-1' })
      renderEditPage('staff-1')

      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox', { hidden: true })
        expect(checkbox).not.toBeDisabled()
      })
    })
  })
})
