import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { useShippingMethods } from '@/admin/hooks/settings'

const mockShippingMethods = [
  { id: '1', name: 'Standard Delivery', baseFee: 5000, isActive: true, estimatedDays: '3-5 business days' },
  { id: '2', name: 'Express Delivery', baseFee: 15000, isActive: false, estimatedDays: '1-2 business days' },
]

vi.mock('@/admin/hooks/settings', () => ({
  useShippingMethods: vi.fn(() => ({
    data: mockShippingMethods,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })),
  useSaveShippingMethod: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}))

vi.mock('@/shared/utils/formatAmount', () => ({
  formatAmount: vi.fn((val: number) => `R ${(val / 100).toFixed(2)}`),
}))

vi.mock('../ShippingMethodDialog', () => ({
  ShippingMethodDialog: () => null,
}))

import { ShippingMethodsPage } from '../ShippingMethodsPage'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/admin/settings/shipping']}>
      <ShippingMethodsPage />
    </MemoryRouter>,
  )
}

describe('ShippingMethodsPage', () => {
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
    vi.mocked(useShippingMethods).mockReturnValue({
      data: mockShippingMethods,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any)
  })

  describe('SUPER_ADMIN role', () => {
    it('renders the "Shipping Methods" heading', () => {
      renderPage()
      expect(screen.getByText('Shipping Methods')).toBeInTheDocument()
    })

    it('shows the "Add shipping method" button', () => {
      renderPage()
      expect(screen.getByText('Add shipping method')).toBeInTheDocument()
    })

    it('shows the "Actions" column header', () => {
      renderPage()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('renders both shipping method names', () => {
      renderPage()
      expect(screen.getByText('Standard Delivery')).toBeInTheDocument()
      expect(screen.getByText('Express Delivery')).toBeInTheDocument()
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

    it('hides the "Add shipping method" button', () => {
      renderPage()
      expect(screen.queryByText('Add shipping method')).not.toBeInTheDocument()
    })

    it('hides the "Actions" column', () => {
      renderPage()
      expect(screen.queryByText('Actions')).not.toBeInTheDocument()
    })
  })

  describe('query error state', () => {
    beforeEach(() => {
      vi.mocked(useShippingMethods).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: vi.fn(),
      } as any)
    })

    it('shows error message when query fails', () => {
      renderPage()
      expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
    })
  })
})
