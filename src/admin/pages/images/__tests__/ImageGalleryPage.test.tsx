import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useImageList } from '@/admin/hooks/images/useImageList'
import { useImageDirectories } from '@/admin/hooks/images/useImageDirectories'
import { useUploadImage } from '@/admin/hooks/images/useUploadImage'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { ImageGalleryPage } from '../ImageGalleryPage'

vi.mock('@/admin/hooks/images/useImageList', () => ({
  useImageList: vi.fn(),
}))
vi.mock('@/admin/hooks/images/useImageDirectories', () => ({
  useImageDirectories: vi.fn(),
}))
vi.mock('@/admin/hooks/images/useUploadImage', () => ({
  useUploadImage: vi.fn(),
}))
vi.mock('@/shared/auth/adminAuthStore', () => ({
  useAdminAuthStore: vi.fn(),
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function setupDefaultMocks(overrides?: { role?: string }) {
  vi.mocked(useAdminAuthStore).mockImplementation((selector: unknown) => {
    const state = { role: overrides?.role ?? 'SUPER_ADMIN' }
    return typeof selector === 'function' ? (selector as (s: typeof state) => unknown)(state) : state
  })

  vi.mocked(useImageDirectories).mockReturnValue({
    data: ['products', 'brands'],
    isLoading: false,
  } as any)

  vi.mocked(useUploadImage).mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
  } as any)
}

function renderPage() {
  const queryClient = createQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ImageGalleryPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ImageGalleryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('renders thumbnails from mock data', () => {
    it('renders each image filename as alt text and displays filenames', async () => {
      setupDefaultMocks()

      vi.mocked(useImageList).mockReturnValue({
        data: {
          images: ['product1.jpg', 'logo.png', 'banner.webp'],
          totalCount: 3,
          page: 0,
          pageSize: 80,
        },
        isLoading: false,
      } as any)

      renderPage()

      await waitFor(() => {
        expect(screen.getByAltText('product1.jpg')).toBeInTheDocument()
        expect(screen.getByAltText('logo.png')).toBeInTheDocument()
        expect(screen.getByAltText('banner.webp')).toBeInTheDocument()
      })

      expect(screen.getByText('product1.jpg')).toBeInTheDocument()
      expect(screen.getByText('logo.png')).toBeInTheDocument()
      expect(screen.getByText('banner.webp')).toBeInTheDocument()
    })
  })

  describe('VIEWER role hides upload button and bulk-upload link', () => {
    it('hides "Upload image" button and "Bulk upload" link for VIEWER', async () => {
      setupDefaultMocks({ role: 'VIEWER' })

      vi.mocked(useImageList).mockReturnValue({
        data: {
          images: ['photo.jpg'],
          totalCount: 1,
          page: 0,
          pageSize: 80,
        },
        isLoading: false,
      } as any)

      renderPage()

      await waitFor(() => {
        expect(screen.getByAltText('photo.jpg')).toBeInTheDocument()
      })

      expect(screen.queryByRole('button', { name: /upload image/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /bulk upload/i })).not.toBeInTheDocument()
    })

    it('shows "Upload image" button and "Bulk upload" link for SUPER_ADMIN', async () => {
      setupDefaultMocks({ role: 'SUPER_ADMIN' })

      vi.mocked(useImageList).mockReturnValue({
        data: {
          images: ['photo.jpg'],
          totalCount: 1,
          page: 0,
          pageSize: 80,
        },
        isLoading: false,
      } as any)

      renderPage()

      await waitFor(() => {
        expect(screen.getByAltText('photo.jpg')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /upload image/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /bulk upload/i })).toBeInTheDocument()
    })
  })

  describe('"Load more" appends images to existing grid', () => {
    it('appends page 1 images to page 0 images without replacing', async () => {
      setupDefaultMocks()

      const mockUseImageList = vi.mocked(useImageList)

      // First render: page 0 data
      mockUseImageList.mockReturnValue({
        data: {
          images: ['page0-img1.jpg', 'page0-img2.jpg'],
          totalCount: 4,
          page: 0,
          pageSize: 80,
        },
        isLoading: false,
      } as any)

      const { rerender } = renderPage()

      await waitFor(() => {
        expect(screen.getByAltText('page0-img1.jpg')).toBeInTheDocument()
        expect(screen.getByAltText('page0-img2.jpg')).toBeInTheDocument()
      })

      // Click "Load more"
      const loadMoreButton = screen.getByRole('button', { name: /load more/i })
      fireEvent.click(loadMoreButton)

      // After clicking load more, the hook will be called with page=1
      // Simulate the hook returning page 1 data
      mockUseImageList.mockReturnValue({
        data: {
          images: ['page1-img1.jpg', 'page1-img2.jpg'],
          totalCount: 4,
          page: 1,
          pageSize: 80,
        },
        isLoading: false,
      } as any)

      // Re-render to trigger the effect with new data
      const queryClient = createQueryClient()
      rerender(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ImageGalleryPage />
          </MemoryRouter>
        </QueryClientProvider>,
      )

      // All images from both pages should be visible
      await waitFor(() => {
        expect(screen.getByAltText('page0-img1.jpg')).toBeInTheDocument()
        expect(screen.getByAltText('page0-img2.jpg')).toBeInTheDocument()
        expect(screen.getByAltText('page1-img1.jpg')).toBeInTheDocument()
        expect(screen.getByAltText('page1-img2.jpg')).toBeInTheDocument()
      })
    })
  })
})
