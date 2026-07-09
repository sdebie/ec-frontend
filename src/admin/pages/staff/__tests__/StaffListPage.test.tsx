import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import type { StaffMember } from '@/admin/hooks/staff'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

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

vi.mock('@/admin/hooks/staff', () => ({
  useStaff: vi.fn(() => ({
    data: { data: mockStaffData, total: 2 },
    isLoading: false,
    isError: false,
    error: null,
  })),
  useUpdateStaff: vi.fn(() => ({
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

    it('does not render staff actions menus', () => {
      renderStaffList()
      expect(screen.queryByTestId('staff-actions-menu')).not.toBeInTheDocument()
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

    it('renders staff actions menus for each row', () => {
      renderStaffList()
      const menus = screen.getAllByTestId('staff-actions-menu')
      expect(menus.length).toBe(2)
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
  })
})
