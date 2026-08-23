import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LegalPagesListPage } from '../LegalPagesListPage'

// --- Mocks ---

vi.mock('@/admin/hooks/pages', () => ({
  useLegalPages: vi.fn(),
}))

vi.mock('@/shared/auth/adminAuthStore', () => ({
  useAdminAuthStore: vi.fn(),
}))

vi.mock('@/admin/context/BreadcrumbContext', () => ({
  useBreadcrumb: vi.fn(),
}))

import { useLegalPages } from '@/admin/hooks/pages'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'

// --- Mock Data ---

const mockPages = [
  {
    id: 'page-1',
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    category: 'LEGAL',
    publishedAt: '2024-06-15T10:30:00Z',
    updatedAt: '2024-06-20T08:00:00Z',
    hasUnpublishedChanges: false,
  },
  {
    id: 'page-2',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    category: 'LEGAL',
    publishedAt: null,
    updatedAt: '2024-06-18T12:00:00Z',
    hasUnpublishedChanges: false,
  },
  {
    id: 'page-3',
    slug: 'delivery-and-returns',
    title: 'Delivery & Returns',
    category: 'LEGAL',
    publishedAt: '2024-05-01T09:00:00Z',
    updatedAt: '2024-06-22T14:00:00Z',
    hasUnpublishedChanges: true,
  },
]

// --- Helpers ---

function renderPage() {
  return render(
    <MemoryRouter>
      <LegalPagesListPage />
    </MemoryRouter>,
  )
}

// --- Tests ---

describe('LegalPagesListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: SUPER_ADMIN role
    vi.mocked(useAdminAuthStore).mockImplementation((selector: any) =>
      selector({ role: 'SUPER_ADMIN' }),
    )
  })

  describe('Renders a card per LEGAL page (Requirement 4.2)', () => {
    it('renders one card per page returned by useLegalPages', () => {
      vi.mocked(useLegalPages).mockReturnValue({
        data: mockPages,
        isLoading: false,
        error: null,
      } as any)

      renderPage()

      expect(screen.getByText('Terms & Conditions')).toBeInTheDocument()
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
      expect(screen.getByText('Delivery & Returns')).toBeInTheDocument()

      // 3 cards = 3 article elements
      const articles = document.querySelectorAll('article')
      expect(articles).toHaveLength(3)
    })
  })

  describe('Shows "Never published" when publishedAt is null (Requirement 4.2)', () => {
    it('displays "Never published" text for a page with null publishedAt', () => {
      vi.mocked(useLegalPages).mockReturnValue({
        data: mockPages,
        isLoading: false,
        error: null,
      } as any)

      renderPage()

      expect(screen.getByText('Never published')).toBeInTheDocument()
    })
  })

  describe('Shows unpublished-changes indicator (Requirement 4.2)', () => {
    it('displays "Unpublished changes" when hasUnpublishedChanges is true', () => {
      vi.mocked(useLegalPages).mockReturnValue({
        data: mockPages,
        isLoading: false,
        error: null,
      } as any)

      renderPage()

      expect(screen.getByText('Unpublished changes')).toBeInTheDocument()
    })
  })

  describe('VIEWER role hides Save/Publish and shows View (Requirement 4.4)', () => {
    it('shows "View" instead of "Edit" when role is VIEWER', () => {
      vi.mocked(useAdminAuthStore).mockImplementation((selector: any) =>
        selector({ role: 'VIEWER' }),
      )
      vi.mocked(useLegalPages).mockReturnValue({
        data: mockPages,
        isLoading: false,
        error: null,
      } as any)

      renderPage()

      const viewLinks = screen.getAllByText('View')
      expect(viewLinks).toHaveLength(3)
      expect(screen.queryByText('Edit')).not.toBeInTheDocument()
    })

    it('shows "Edit" when role is SUPER_ADMIN', () => {
      vi.mocked(useLegalPages).mockReturnValue({
        data: mockPages,
        isLoading: false,
        error: null,
      } as any)

      renderPage()

      const editLinks = screen.getAllByText('Edit')
      expect(editLinks).toHaveLength(3)
      expect(screen.queryByText('View')).not.toBeInTheDocument()
    })
  })

  describe('Edit navigates to /admin/storefront/legal/{id} (Requirement 4.3)', () => {
    it('Edit link points to /admin/storefront/legal/{id}', () => {
      vi.mocked(useLegalPages).mockReturnValue({
        data: mockPages,
        isLoading: false,
        error: null,
      } as any)

      renderPage()

      const editLink = screen.getByLabelText('Edit Terms & Conditions')
      expect(editLink).toHaveAttribute('href', '/admin/storefront/legal/page-1')
    })
  })
})
