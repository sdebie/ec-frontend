import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'

const mockStoreSettings = [
  { key: 'vat_rate_percent', value: '0.15', description: 'VAT rate as decimal' },
  { key: 'payment_methods_allowed', value: '["payfast"]', description: 'Allowed payment methods' },
]

vi.mock('@/admin/hooks/settings', () => ({
  useStoreSettings: vi.fn(() => ({
    data: mockStoreSettings,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })),
  useUpdateSetting: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}))

vi.mock('../StoreSettingEditDialog', () => ({
  StoreSettingEditDialog: () => null,
}))

import { StoreSettingsPage } from '../StoreSettingsPage'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/settings/store']}>
      <StoreSettingsPage />
    </MemoryRouter>,
  )
}

describe('StoreSettingsPage', () => {
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

  describe('table rendering', () => {
    it('renders the "Store Settings" heading', () => {
      renderPage()
      expect(screen.getByText('Store Settings')).toBeInTheDocument()
    })

    it('renders setting keys in the table', () => {
      renderPage()
      expect(screen.getByText('vat_rate_percent')).toBeInTheDocument()
      expect(screen.getByText('payment_methods_allowed')).toBeInTheDocument()
    })

    it('renders setting values in the table', () => {
      renderPage()
      expect(screen.getByText('0.15')).toBeInTheDocument()
      expect(screen.getByText('["payfast"]')).toBeInTheDocument()
    })

    it('renders setting descriptions in the table', () => {
      renderPage()
      expect(screen.getByText('VAT rate as decimal')).toBeInTheDocument()
      expect(screen.getByText('Allowed payment methods')).toBeInTheDocument()
    })
  })

  describe('SUPER_ADMIN role', () => {
    it('shows edit icons (pencil buttons)', () => {
      renderPage()
      const buttons = screen.getAllByRole('button')
      // Each setting row should have an edit button (2 settings = 2 pencil buttons)
      const editButtons = buttons.filter((btn) => btn.querySelector('svg'))
      expect(editButtons.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('VIEWER role', () => {
    beforeEach(() => {
      useAdminAuthStore.setState({
        role: 'VIEWER',
        authority: ['VIEWER'],
        userId: '2',
      })
    })

    it('hides edit icons', () => {
      renderPage()
      const buttons = screen.queryAllByRole('button')
      const editButtons = buttons.filter((btn) => btn.querySelector('svg'))
      expect(editButtons).toHaveLength(0)
    })
  })
})
