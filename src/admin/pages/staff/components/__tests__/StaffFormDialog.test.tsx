import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import type { StaffMember } from '../../types'

const mockCreateMutate = vi.fn()
const mockUpdateMutate = vi.fn()

vi.mock('../../hooks/useCreateStaff', () => ({
  useCreateStaff: vi.fn(() => ({
    mutate: mockCreateMutate,
    isPending: false,
  })),
}))

vi.mock('../../hooks/useUpdateStaff', () => ({
  useUpdateStaff: vi.fn(() => ({
    mutate: mockUpdateMutate,
    isPending: false,
  })),
}))

import { StaffFormDialog } from '../StaffFormDialog'

const mockStaff: StaffMember = {
  id: 'staff-1',
  email: 'staff@test.com',
  fullName: 'Staff User',
  role: 'CATALOG_MANAGER',
  active: true,
  resetPassword: false,
  createdAt: '2024-01-01',
}

function renderDialog(overrides: Partial<React.ComponentProps<typeof StaffFormDialog>> = {}) {
  return render(
    <StaffFormDialog open mode="create" onClose={vi.fn()} {...overrides} />,
  )
}

describe('StaffFormDialog', () => {
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

  describe('create mode', () => {
    it('shows the "Add Staff Member" title and a temporary password field', () => {
      renderDialog({ mode: 'create' })

      expect(screen.getByText('Add Staff Member')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Minimum 8 characters')).toBeInTheDocument()
    })

    it('shows email validation error for invalid email', async () => {
      const user = userEvent.setup()
      renderDialog({ mode: 'create' })

      await user.type(screen.getByPlaceholderText('Full name'), 'Valid Name')
      await user.type(screen.getByPlaceholderText('Minimum 8 characters'), 'password123')
      await user.click(screen.getByText('Select a role'))
      await user.click(screen.getByText('Super Admin'))

      await user.click(screen.getByRole('button', { name: 'Create' }))

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('shows fullName validation error when too short', async () => {
      const user = userEvent.setup()
      renderDialog({ mode: 'create' })

      await user.type(screen.getByPlaceholderText('Full name'), 'A')
      await user.click(screen.getByRole('button', { name: 'Create' }))

      await waitFor(() => {
        expect(screen.getByText('Full name must be at least 2 characters')).toBeInTheDocument()
      })
    })

    it('shows role validation error when not selected', async () => {
      const user = userEvent.setup()
      renderDialog({ mode: 'create' })

      await user.click(screen.getByRole('button', { name: 'Create' }))

      await waitFor(() => {
        expect(screen.getByText('Please select a role')).toBeInTheDocument()
      })
    })

    it('shows password validation error when too short', async () => {
      const user = userEvent.setup()
      renderDialog({ mode: 'create' })

      await user.type(screen.getByPlaceholderText('Minimum 8 characters'), 'short')
      await user.click(screen.getByRole('button', { name: 'Create' }))

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
      })
    })

    it('calls create mutate with the correct staffDto on valid submission, then closes on success', async () => {
      const onClose = vi.fn()
      mockCreateMutate.mockImplementation((_dto, opts) => opts?.onSuccess?.())
      const user = userEvent.setup()
      renderDialog({ mode: 'create', onClose })

      await user.type(screen.getByPlaceholderText('staff@example.com'), 'new@test.com')
      await user.type(screen.getByPlaceholderText('Full name'), 'New Staff')
      await user.type(screen.getByPlaceholderText('Minimum 8 characters'), 'password123')
      await user.click(screen.getByText('Select a role'))
      await user.click(screen.getByText('Catalog Manager'))

      await user.click(screen.getByRole('button', { name: 'Create' }))

      await waitFor(() => {
        expect(mockCreateMutate).toHaveBeenCalledWith(
          {
            email: 'new@test.com',
            fullName: 'New Staff',
            role: 'CATALOG_MANAGER',
            isActive: true,
            temporaryPassword: 'password123',
            resetPassword: false,
          },
          expect.anything(),
        )
      })
      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose (not a navigation) when Cancel is clicked', async () => {
      const onClose = vi.fn()
      const user = userEvent.setup()
      renderDialog({ mode: 'create', onClose })

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(onClose).toHaveBeenCalled()
      expect(mockCreateMutate).not.toHaveBeenCalled()
    })
  })

  describe('edit mode', () => {
    it('shows the "Edit Staff Member" title with no temporary password field', () => {
      renderDialog({ mode: 'edit', staff: mockStaff })

      expect(screen.getByText('Edit Staff Member')).toBeInTheDocument()
      expect(screen.queryByPlaceholderText('Minimum 8 characters')).not.toBeInTheDocument()
    })

    it('pre-populates email and fullName from the staff prop', () => {
      renderDialog({ mode: 'edit', staff: mockStaff })

      expect(screen.getByPlaceholderText('staff@example.com')).toHaveValue('staff@test.com')
      expect(screen.getByPlaceholderText('Full name')).toHaveValue('Staff User')
    })

    describe('self-edit guard', () => {
      it('disables the role select and the isActive switcher when editing your own record', () => {
        useAdminAuthStore.setState({ userId: 'staff-1' })
        renderDialog({ mode: 'edit', staff: mockStaff })

        expect(screen.getByRole('button', { name: /catalog manager/i })).toBeDisabled()
        expect(screen.getByRole('checkbox', { hidden: true })).toBeDisabled()
      })
    })

    describe('editing another staff member', () => {
      it('does not disable the role select or the isActive switcher', () => {
        useAdminAuthStore.setState({ userId: 'admin-1' })
        renderDialog({ mode: 'edit', staff: mockStaff })

        expect(screen.getByRole('button', { name: /catalog manager/i })).not.toBeDisabled()
        expect(screen.getByRole('checkbox', { hidden: true })).not.toBeDisabled()
      })
    })

    it('calls update mutate with the correct staffDto on valid submission, then closes on success', async () => {
      const onClose = vi.fn()
      mockUpdateMutate.mockImplementation((_dto, opts) => opts?.onSuccess?.())
      const user = userEvent.setup()
      renderDialog({ mode: 'edit', staff: mockStaff, onClose })

      await user.clear(screen.getByPlaceholderText('Full name'))
      await user.type(screen.getByPlaceholderText('Full name'), 'Updated Name')

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(mockUpdateMutate).toHaveBeenCalledWith(
          {
            id: 'staff-1',
            staffDto: {
              email: 'staff@test.com',
              fullName: 'Updated Name',
              role: 'CATALOG_MANAGER',
              isActive: true,
              resetPassword: false,
            },
          },
          expect.anything(),
        )
      })
      expect(onClose).toHaveBeenCalled()
    })
  })
})
