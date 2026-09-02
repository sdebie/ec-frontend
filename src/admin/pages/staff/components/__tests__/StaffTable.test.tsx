import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import type { StaffMember } from '../../types'
import { StaffTable } from '../StaffTable'

const mockMutate = vi.fn()

vi.mock('../../hooks/useUpdateStaff', () => ({
  useUpdateStaff: vi.fn(() => ({ mutate: mockMutate, isPending: false })),
}))

const activeAdmin: StaffMember = {
  id: '1',
  email: 'admin@test.com',
  fullName: 'Admin User',
  role: 'SUPER_ADMIN',
  active: true,
  resetPassword: false,
  createdAt: '2024-01-01',
}
const inactiveViewer: StaffMember = {
  id: '2',
  email: 'viewer@test.com',
  fullName: 'Viewer User',
  role: 'VIEWER',
  active: false,
  resetPassword: false,
  createdAt: '2024-01-02',
}

function renderStaffTable(overrides: Partial<ComponentProps<typeof StaffTable>> = {}) {
  const defaultProps: ComponentProps<typeof StaffTable> = {
    data: [],
    isLoading: false,
    canMutate: true,
    pageCount: 1,
    totalRowCount: 0,
    pagination: { pageIndex: 0, pageSize: 10 },
    onPaginationChange: vi.fn(),
    sorting: [],
    onSortingChange: vi.fn(),
    onEdit: vi.fn(),
  }
  return render(<StaffTable {...defaultProps} {...overrides} />)
}

describe('StaffTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAdminAuthStore.setState({
      isSignedIn: true,
      token: 'test-token',
      role: 'SUPER_ADMIN',
      authority: ['SUPER_ADMIN'],
      userName: 'Admin',
      email: 'admin@test.com',
      userId: 'current-admin',
    })
  })

  describe('columns', () => {
    it('renders column headers: Name, Email, Role, Active, Actions', () => {
      renderStaffTable({ data: [activeAdmin] })

      expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Role' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Active' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument()
    })

    it('renders staff data', () => {
      renderStaffTable({ data: [activeAdmin, inactiveViewer] })

      expect(screen.getByText('Admin User')).toBeInTheDocument()
      expect(screen.getByText('admin@test.com')).toBeInTheDocument()
      expect(screen.getByText('Super Admin')).toBeInTheDocument()
      expect(screen.getByText('Viewer User')).toBeInTheDocument()
      expect(screen.getByText('Viewer')).toBeInTheDocument()
    })
  })

  describe('row actions — canMutate true', () => {
    it('shows an Edit action for each row', () => {
      renderStaffTable({ data: [activeAdmin] })
      expect(screen.getByLabelText('Edit Admin User')).toBeInTheDocument()
    })

    it('clicking Edit calls onEdit with the row data', () => {
      const onEdit = vi.fn()
      renderStaffTable({ data: [activeAdmin], onEdit })

      fireEvent.click(screen.getByLabelText('Edit Admin User'))

      expect(onEdit).toHaveBeenCalledWith(activeAdmin)
    })

    it('double-clicking a row calls onEdit with the row data', () => {
      const onEdit = vi.fn()
      renderStaffTable({ data: [activeAdmin], onEdit })

      fireEvent.doubleClick(screen.getByText('Admin User'))

      expect(onEdit).toHaveBeenCalledWith(activeAdmin)
    })

    it('shows a Deactivate action for an active, non-self row', () => {
      renderStaffTable({ data: [activeAdmin] })
      expect(screen.getByLabelText('Deactivate Admin User')).toBeInTheDocument()
      expect(screen.queryByLabelText('Activate Admin User')).not.toBeInTheDocument()
    })

    it('shows an Activate action for an inactive, non-self row', () => {
      renderStaffTable({ data: [inactiveViewer] })
      expect(screen.getByLabelText('Activate Viewer User')).toBeInTheDocument()
      expect(screen.queryByLabelText('Deactivate Viewer User')).not.toBeInTheDocument()
    })

    it('clicking Deactivate opens a confirmation dialog naming the staff member', () => {
      renderStaffTable({ data: [activeAdmin] })

      fireEvent.click(screen.getByLabelText('Deactivate Admin User'))

      expect(screen.getByText('Deactivate staff member')).toBeInTheDocument()
      expect(screen.getByText(/Are you sure you want to deactivate Admin User/)).toBeInTheDocument()
    })

    it('confirming Deactivate calls the update mutation with isActive: false', () => {
      renderStaffTable({ data: [activeAdmin] })

      fireEvent.click(screen.getByLabelText('Deactivate Admin User'))
      fireEvent.click(screen.getByRole('button', { name: 'Deactivate' }))

      expect(mockMutate).toHaveBeenCalledWith(
        {
          id: '1',
          staffDto: {
            email: 'admin@test.com',
            fullName: 'Admin User',
            role: 'SUPER_ADMIN',
            isActive: false,
            resetPassword: false,
          },
        },
        expect.anything(),
      )
    })

    it('closing the Deactivate dialog without confirming does not call the mutation', () => {
      renderStaffTable({ data: [activeAdmin] })

      fireEvent.click(screen.getByLabelText('Deactivate Admin User'))
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(mockMutate).not.toHaveBeenCalled()
      expect(screen.queryByText('Deactivate staff member')).not.toBeInTheDocument()
    })

    it('clicking Activate calls the update mutation directly with isActive: true, with no confirmation', () => {
      renderStaffTable({ data: [inactiveViewer] })

      fireEvent.click(screen.getByLabelText('Activate Viewer User'))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(mockMutate).toHaveBeenCalledWith({
        id: '2',
        staffDto: {
          email: 'viewer@test.com',
          fullName: 'Viewer User',
          role: 'VIEWER',
          isActive: true,
          resetPassword: false,
        },
      })
    })

    it('hides Deactivate/Activate for the signed-in user\'s own row', () => {
      useAdminAuthStore.setState({ userId: '1' })
      renderStaffTable({ data: [activeAdmin] })

      expect(screen.getByLabelText('Edit Admin User')).toBeInTheDocument()
      expect(screen.queryByLabelText('Deactivate Admin User')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Activate Admin User')).not.toBeInTheDocument()
    })
  })

  describe('row actions — canMutate false', () => {
    it('hides the Actions column and all row actions', () => {
      renderStaffTable({ data: [activeAdmin], canMutate: false })

      expect(screen.queryByRole('columnheader', { name: 'Actions' })).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Edit Admin User')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Deactivate Admin User')).not.toBeInTheDocument()
    })

    it('does not call onEdit when a row is double-clicked', () => {
      const onEdit = vi.fn()
      renderStaffTable({ data: [activeAdmin], canMutate: false, onEdit })

      fireEvent.doubleClick(screen.getByText('Admin User'))

      expect(onEdit).not.toHaveBeenCalled()
    })
  })
})
