import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'

const mockMutate = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/admin/hooks/staff', () => ({
  useCreateStaff: vi.fn(() => ({
    mutate: mockMutate,
    isPending: false,
  })),
}))

import { StaffCreatePage } from '../StaffCreatePage'

function renderCreatePage() {
  return render(
    <MemoryRouter initialEntries={['/admin/staff/new']}>
      <StaffCreatePage />
    </MemoryRouter>,
  )
}

describe('StaffCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAdminAuthStore.setState({
      isSignedIn: true,
      token: 'test-token',
      role: 'SUPER_ADMIN',
      authority: ['SUPER_ADMIN'],
      userName: 'Admin',
      email: 'admin@test.com',
      userId: '1',
    })
  })

  describe('form validation', () => {
    it('shows email validation error for invalid email', async () => {
      const user = userEvent.setup()
      renderCreatePage()

      // Fill other required fields but leave email empty to trigger Zod validation
      await user.type(screen.getByPlaceholderText('Full name'), 'Valid Name')
      await user.type(screen.getByPlaceholderText('Minimum 8 characters'), 'password123')

      await user.click(screen.getByText('Select a role'))
      await user.click(screen.getByText('Super Admin'))

      const submitButton = screen.getByRole('button', { name: /create staff member/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('shows fullName validation error when too short', async () => {
      const user = userEvent.setup()
      renderCreatePage()

      const nameInput = screen.getByPlaceholderText('Full name')
      await user.type(nameInput, 'A')

      const submitButton = screen.getByRole('button', { name: /create staff member/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Full name must be at least 2 characters')).toBeInTheDocument()
      })
    })

    it('shows role validation error when not selected', async () => {
      const user = userEvent.setup()
      renderCreatePage()

      const submitButton = screen.getByRole('button', { name: /create staff member/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please select a role')).toBeInTheDocument()
      })
    })

    it('shows password validation error when too short', async () => {
      const user = userEvent.setup()
      renderCreatePage()

      const passwordInput = screen.getByPlaceholderText('Minimum 8 characters')
      await user.type(passwordInput, 'short')

      const submitButton = screen.getByRole('button', { name: /create staff member/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('calls mutate with correct staffDto on valid submission', async () => {
      const user = userEvent.setup()
      renderCreatePage()

      await user.type(screen.getByPlaceholderText('staff@example.com'), 'new@test.com')
      await user.type(screen.getByPlaceholderText('Full name'), 'New Staff')
      await user.type(screen.getByPlaceholderText('Minimum 8 characters'), 'password123')

      const roleSelect = screen.getByText('Select a role')
      await user.click(roleSelect)
      await user.click(screen.getByText('Catalog Manager'))

      const submitButton = screen.getByRole('button', { name: /create staff member/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          email: 'new@test.com',
          fullName: 'New Staff',
          role: 'CATALOG_MANAGER',
          isActive: true,
          temporaryPassword: 'password123',
          resetPassword: false,
        })
      })
    })

    it('navigates to /admin/staff on cancel', async () => {
      const user = userEvent.setup()
      renderCreatePage()

      await user.click(screen.getByText('Cancel'))

      expect(mockNavigate).toHaveBeenCalledWith('/admin/staff')
    })
  })
})
