import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'

const mockCountrySettings = [
  { countryCode: 'ZA', countryName: 'South Africa', currencyCode: 'ZAR', locale: 'en-ZA', decimalPlaces: 2, isDefault: true, isActive: true },
  { countryCode: 'US', countryName: 'United States', currencyCode: 'USD', locale: 'en-US', decimalPlaces: 2, isDefault: false, isActive: false },
]

vi.mock('@/admin/hooks/settings', () => ({
  useCountrySettings: vi.fn(() => ({
    data: mockCountrySettings,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })),
}))

import { CountrySettingsPage } from '../CountrySettingsPage'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/settings/countries']}>
      <CountrySettingsPage />
    </MemoryRouter>,
  )
}

describe('CountrySettingsPage', () => {
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

  describe('data rendering', () => {
    it('renders both country names', () => {
      renderPage()
      expect(screen.getByText('South Africa')).toBeInTheDocument()
      expect(screen.getByText('United States')).toBeInTheDocument()
    })

    it('displays "Default" badge for the default country', () => {
      renderPage()
      // "Default" appears as column header and as badge text for ZA row
      const defaults = screen.getAllByText('Default')
      expect(defaults.length).toBeGreaterThanOrEqual(2)
    })

    it('applies opacity-50 class to inactive country row cells', () => {
      renderPage()
      const usCell = screen.getByText('United States')
      expect(usCell).toHaveClass('opacity-50')
    })

    it('does not apply opacity-50 class to active country row cells', () => {
      renderPage()
      const zaCell = screen.getByText('South Africa')
      expect(zaCell).not.toHaveClass('opacity-50')
    })
  })

  describe('read-only for all roles', () => {
    it('has no edit, add, or delete buttons as SUPER_ADMIN', () => {
      renderPage()
      expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      expect(screen.queryByText('Add')).not.toBeInTheDocument()
      expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    })

    it('has no edit, add, or delete buttons as VIEWER', () => {
      useAdminAuthStore.setState({
        role: 'VIEWER',
        authority: ['VIEWER'],
        userId: '2',
      })
      renderPage()
      expect(screen.queryByText('Edit')).not.toBeInTheDocument()
      expect(screen.queryByText('Add')).not.toBeInTheDocument()
      expect(screen.queryByText('Delete')).not.toBeInTheDocument()
    })
  })
})
