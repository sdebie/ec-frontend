import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { AdminSidebar } from './AdminSidebar'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'

vi.mock('@/admin/routes/adminMenuRoutes.config', () => ({
  adminMenuRoutes: [
    {
      key: 'dashboard',
      path: '/admin/dashboard',
      component: () => null,
      authority: ['SUPER_ADMIN', 'VIEWER'],
      meta: { label: 'Dashboard', section: 'MAIN', pageBackgroundType: 'plain', pageContainerType: 'contained', icon: 'layout-dashboard', menuMatch: 'exact' },
    },
    {
      key: 'products',
      path: '/admin/products',
      component: () => null,
      authority: ['SUPER_ADMIN', 'VIEWER'],
      meta: { label: 'Products', section: 'PRODUCTS', pageBackgroundType: 'plain', pageContainerType: 'contained', icon: 'store' },
    },
    {
      key: 'staff',
      path: '/admin/staff',
      component: () => null,
      authority: ['SUPER_ADMIN'],
      meta: { label: 'Staff', section: 'ADMIN', pageBackgroundType: 'plain', pageContainerType: 'contained', icon: 'users' },
    },
  ],
}))

function renderSidebar(props: { isOpen?: boolean; onClose?: () => void } = {}) {
  const { isOpen = false, onClose = vi.fn() } = props
  return render(
    <MemoryRouter>
      <AdminSidebar
        isOpen={isOpen}
        onClose={onClose}
        isCollapsed={false}
        onToggleCollapsed={vi.fn()}
        onSetCollapsed={vi.fn()}
      />
    </MemoryRouter>,
  )
}

describe('AdminSidebar', () => {
  beforeEach(() => {
    useAdminAuthStore.setState({ authority: [] })
  })

  describe('route filtering by authority (Req 3.2)', () => {
    it('renders only routes that match user authority', () => {
      useAdminAuthStore.setState({ authority: ['VIEWER'] })

      renderSidebar()

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Products')).toBeInTheDocument()
      expect(screen.queryByText('Staff')).not.toBeInTheDocument()
    })

    it('renders all routes when user has SUPER_ADMIN authority', () => {
      useAdminAuthStore.setState({ authority: ['SUPER_ADMIN'] })

      renderSidebar()

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Products')).toBeInTheDocument()
      expect(screen.getByText('Staff')).toBeInTheDocument()
    })

    it('renders no menu items when user has no matching authority', () => {
      useAdminAuthStore.setState({ authority: ['UNKNOWN_ROLE'] })

      renderSidebar()

      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      expect(screen.queryByText('Products')).not.toBeInTheDocument()
      expect(screen.queryByText('Staff')).not.toBeInTheDocument()
    })
  })

  describe('route grouping by section (Req 3.7a)', () => {
    it('renders section headings for each unique section', () => {
      useAdminAuthStore.setState({ authority: ['SUPER_ADMIN'] })

      renderSidebar()

      expect(screen.getByText('MAIN')).toBeInTheDocument()
      expect(screen.getByText('PRODUCTS')).toBeInTheDocument()
      expect(screen.getByText('ADMIN')).toBeInTheDocument()
    })

    it('only renders section headings for sections with authorized routes', () => {
      useAdminAuthStore.setState({ authority: ['VIEWER'] })

      renderSidebar()

      expect(screen.getByText('MAIN')).toBeInTheDocument()
      expect(screen.getByText('PRODUCTS')).toBeInTheDocument()
      expect(screen.queryByText('ADMIN')).not.toBeInTheDocument()
    })
  })

  describe('mobile overlay (Req 3.7c)', () => {
    it('renders overlay when isOpen is true', () => {
      useAdminAuthStore.setState({ authority: ['VIEWER'] })

      const { container } = renderSidebar({ isOpen: true })

      const overlay = container.querySelector('div[aria-hidden="true"].fixed')
      expect(overlay).toBeInTheDocument()
      expect(overlay).toHaveClass('fixed', 'inset-0', 'bg-black/50', 'z-40', 'md:hidden')
    })

    it('does not render overlay when isOpen is false', () => {
      useAdminAuthStore.setState({ authority: ['VIEWER'] })

      const { container } = renderSidebar({ isOpen: false })

      const overlay = container.querySelector('div[aria-hidden="true"].fixed')
      expect(overlay).not.toBeInTheDocument()
    })

    it('calls onClose when overlay is clicked', () => {
      useAdminAuthStore.setState({ authority: ['VIEWER'] })
      const onClose = vi.fn()

      const { container } = renderSidebar({ isOpen: true, onClose })

      const overlay = container.querySelector('div[aria-hidden="true"].fixed')
      fireEvent.click(overlay!)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Escape key (Req 3.7c)', () => {
    it('calls onClose when Escape key is pressed and sidebar is open', () => {
      useAdminAuthStore.setState({ authority: ['VIEWER'] })
      const onClose = vi.fn()

      renderSidebar({ isOpen: true, onClose })

      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not call onClose when Escape key is pressed and sidebar is closed', () => {
      useAdminAuthStore.setState({ authority: ['VIEWER'] })
      const onClose = vi.fn()

      renderSidebar({ isOpen: false, onClose })

      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).not.toHaveBeenCalled()
    })
  })
})
