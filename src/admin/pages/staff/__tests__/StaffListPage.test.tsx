import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import type { StaffMember } from '../hooks/types'

const mockStaffData: StaffMember[] = [
  {
    id: '1',
    email: 'admin@test.com',
    fullName: 'Admin User',
    role: 'SUPER_ADMIN',
    active: true,
    resetPassword: false,
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    email: 'viewer@test.com',
    fullName: 'Viewer User',
    role: 'VIEWER',
    active: false,
    resetPassword: false,
    createdAt: '2024-01-02',
  },
]

vi.mock('../hooks/useStaff', () => ({
  useStaff: vi.fn(() => ({
    data: { data: mockStaffData, total: 2 },
    isLoading: false,
    isError: false,
    error: null,
  })),
}))

// StaffListPage renders StaffTable, which calls this hook itself for activate/deactivate.
vi.mock('../hooks/useUpdateStaff', () => ({
  useUpdateStaff: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}))

// StaffFormDialog is only mounted once the Add/Edit dialog opens, but it calls this
// hook unconditionally on every render (both modes), so it must always be mocked.
vi.mock('../hooks/useCreateStaff', () => ({
  useCreateStaff: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}))

import { StaffListPage } from '../StaffListPage'

function renderStaffList() {
  return render(
    <MemoryRouter initialEntries={['/admin/staff']}>
      <StaffListPage />
    </MemoryRouter>,
  )
}

describe('StaffListPage', () => {
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

  describe('VIEWER role', () => {
    beforeEach(() => {
      useAdminAuthStore.setState({
        role: 'VIEWER',
        authority: ['VIEWER'],
        userId: '3',
      })
    })

    it('hides the "Add staff member" button', () => {
      renderStaffList()
      expect(screen.queryByText('Add staff member')).not.toBeInTheDocument()
    })

    it('hides the actions column', () => {
      renderStaffList()
      expect(screen.queryByText('Actions')).not.toBeInTheDocument()
    })

    it('does not render any row action buttons', () => {
      renderStaffList()
      expect(screen.queryByLabelText(/^Edit /)).not.toBeInTheDocument()
    })

    it('does not open a dialog when a row is double-clicked', () => {
      renderStaffList()
      fireEvent.doubleClick(screen.getByText('Admin User'))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('still renders staff data rows', () => {
      renderStaffList()
      expect(screen.getByText('Admin User')).toBeInTheDocument()
      expect(screen.getByText('Viewer User')).toBeInTheDocument()
    })
  })

  describe('SUPER_ADMIN role', () => {
    it('shows the "Add staff member" button', () => {
      renderStaffList()
      expect(screen.getByText('Add staff member')).toBeInTheDocument()
    })

    it('shows the actions column header', () => {
      renderStaffList()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('renders an Edit icon action for each row', () => {
      renderStaffList()
      expect(screen.getByLabelText('Edit Admin User')).toBeInTheDocument()
      expect(screen.getByLabelText('Edit Viewer User')).toBeInTheDocument()
    })

    it('renders staff data in the table', () => {
      renderStaffList()
      expect(screen.getByText('Admin User')).toBeInTheDocument()
      expect(screen.getByText('admin@test.com')).toBeInTheDocument()
      expect(screen.getByText('Viewer User')).toBeInTheDocument()
      expect(screen.getByText('viewer@test.com')).toBeInTheDocument()
    })

    it('renders the page heading', () => {
      renderStaffList()
      expect(screen.getByText('Staff')).toBeInTheDocument()
    })

    it('opens the create dialog when "Add staff member" is clicked', () => {
      renderStaffList()
      fireEvent.click(screen.getByText('Add staff member'))
      expect(screen.getByText('Add Staff Member')).toBeInTheDocument()
    })

    it('opens the edit dialog, pre-filled, when the Edit action is clicked', () => {
      renderStaffList()
      fireEvent.click(screen.getByLabelText('Edit Admin User'))
      expect(screen.getByText('Edit Staff Member')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('staff@example.com')).toHaveValue('admin@test.com')
    })

    it('opens the edit dialog, pre-filled, when a row is double-clicked', () => {
      renderStaffList()
      fireEvent.doubleClick(screen.getByText('Viewer User'))
      expect(screen.getByText('Edit Staff Member')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('staff@example.com')).toHaveValue('viewer@test.com')
    })

    it('closing the dialog removes it from the document', () => {
      renderStaffList()
      fireEvent.click(screen.getByText('Add staff member'))
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
