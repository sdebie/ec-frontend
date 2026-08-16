import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useImageList } from '@/admin/pages/images/hooks/useImageList'
import { useImageDirectories } from '@/admin/pages/images/hooks/useImageDirectories'
import { useUploadImage } from '@/admin/pages/images/hooks/useUploadImage'
import { useImageListPage } from '@/admin/hooks/images/useImageListPage'
import { useDeleteImage } from '@/admin/pages/images/hooks/useDeleteImage'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { toast } from '@/shared/ui/components/toast'
import { ImageGalleryPage } from '../ImageGalleryPage'

vi.mock('@/admin/pages/images/hooks/useImageList', () => ({
  useImageList: vi.fn(),
}))
vi.mock('@/admin/pages/images/hooks/useImageDirectories', () => ({
  useImageDirectories: vi.fn(),
}))
vi.mock('@/admin/pages/images/hooks/useUploadImage', () => ({
  useUploadImage: vi.fn(),
}))
vi.mock('@/admin/hooks/images/useImageListPage', () => ({
  useImageListPage: vi.fn(),
}))
vi.mock('@/admin/pages/images/hooks/useDeleteImage', () => ({
  useDeleteImage: vi.fn(),
}))
vi.mock('@/shared/auth/adminAuthStore', () => ({
  useAdminAuthStore: vi.fn(),
}))
vi.mock('@/shared/ui/components/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
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

  vi.mocked(useImageListPage).mockReturnValue({
    data: { images: [], totalCount: 0, page: 0, pageSize: 10 },
    isLoading: false,
  } as any)

  vi.mocked(useDeleteImage).mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
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
        data: { pages: [{ images: ['product1.jpg', 'logo.png', 'banner.webp'], totalCount: 3, page: 0, pageSize: 80 }] },
        isLoading: false,
        hasNextPage: false,
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
        data: { pages: [{ images: ['photo.jpg'], totalCount: 1, page: 0, pageSize: 80 }] },
        isLoading: false,
        hasNextPage: false,
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
        data: { pages: [{ images: ['photo.jpg'], totalCount: 1, page: 0, pageSize: 80 }] },
        isLoading: false,
        hasNextPage: false,
      } as any)

      renderPage()

      await waitFor(() => {
        expect(screen.getByAltText('photo.jpg')).toBeInTheDocument()
      })

      expect(screen.getByRole('button', { name: /upload image/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /bulk upload/i })).toBeInTheDocument()
    })

    it('shows "Upload image" button and "Bulk upload" link for CATALOG_MANAGER (image:write mirrors ImageResource)', async () => {
      setupDefaultMocks({ role: 'CATALOG_MANAGER' })

      vi.mocked(useImageList).mockReturnValue({
        data: { pages: [{ images: ['photo.jpg'], totalCount: 1, page: 0, pageSize: 80 }] },
        isLoading: false,
        hasNextPage: false,
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
        data: { pages: [{ images: ['page0-img1.jpg', 'page0-img2.jpg'], totalCount: 4, page: 0, pageSize: 2 }] },
        isLoading: false,
        hasNextPage: true,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: false,
      } as any)

      const { rerender } = renderPage()

      await waitFor(() => {
        expect(screen.getByAltText('page0-img1.jpg')).toBeInTheDocument()
        expect(screen.getByAltText('page0-img2.jpg')).toBeInTheDocument()
      })

      const loadMoreButton = screen.getByRole('button', { name: /load more/i })
      fireEvent.click(loadMoreButton)

      // Simulate the infinite-query cache gaining its next page.
      mockUseImageList.mockReturnValue({
        data: { pages: [
          { images: ['page0-img1.jpg', 'page0-img2.jpg'], totalCount: 4, page: 0, pageSize: 2 },
          { images: ['page1-img1.jpg', 'page1-img2.jpg'], totalCount: 4, page: 1, pageSize: 2 },
        ] },
        isLoading: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
        isFetchingNextPage: false,
      } as any)

      // Re-render with the cached pages supplied by the infinite query.
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

  describe('grid/list view toggle', () => {
    it('switches from the thumbnail grid to the list table and back', async () => {
      setupDefaultMocks()

      vi.mocked(useImageList).mockReturnValue({
        data: { pages: [{ images: ['grid-photo.jpg'], totalCount: 1, page: 0, pageSize: 80 }] },
        isLoading: false,
        hasNextPage: false,
      } as any)

      vi.mocked(useImageListPage).mockReturnValue({
        data: { images: ['list-photo.jpg'], totalCount: 1, page: 0, pageSize: 10 },
        isLoading: false,
      } as any)

      renderPage()

      await waitFor(() => {
        expect(screen.getByAltText('grid-photo.jpg')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /^list$/i }))

      await waitFor(() => {
        expect(screen.getByText('list-photo.jpg')).toBeInTheDocument()
      })
      expect(screen.queryByAltText('grid-photo.jpg')).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /^grid$/i }))

      await waitFor(() => {
        expect(screen.getByAltText('grid-photo.jpg')).toBeInTheDocument()
      })
      expect(screen.queryByText('list-photo.jpg')).not.toBeInTheDocument()
    })
  })

  describe('list view bulk selection', () => {
    it('shows the bulk action bar with the selected count once a row is checked, and hides it on Clear', async () => {
      setupDefaultMocks()

      vi.mocked(useImageListPage).mockReturnValue({
        data: { images: ['a.jpg', 'b.jpg'], totalCount: 2, page: 0, pageSize: 10 },
        isLoading: false,
      } as any)

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: /^list$/i }))
      await waitFor(() => {
        expect(screen.getByText('a.jpg')).toBeInTheDocument()
      })

      expect(screen.queryByTestId('bulk-delete-images')).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole('checkbox', { name: 'Select a.jpg' }))

      await waitFor(() => {
        expect(screen.getByText('1 selected')).toBeInTheDocument()
      })
      expect(screen.getByTestId('bulk-delete-images')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /^clear$/i }))

      await waitFor(() => {
        expect(screen.queryByTestId('bulk-delete-images')).not.toBeInTheDocument()
      })
    })
  })

  describe('delete refused while the image is still in use', () => {
    it('surfaces the backend reason as an error toast instead of silently succeeding', async () => {
      setupDefaultMocks()

      vi.mocked(useImageListPage).mockReturnValue({
        data: { images: ['brand-logo.jpg'], totalCount: 1, page: 0, pageSize: 10 },
        isLoading: false,
      } as any)

      const mockMutate = vi.fn(
        (_filename: string, options?: { onSuccess?: () => void; onError?: (error: unknown) => void }) => {
          options?.onError?.(new Error('Image is still in use (1 brand)'))
        },
      )
      vi.mocked(useDeleteImage).mockReturnValue({
        mutate: mockMutate,
        mutateAsync: vi.fn(),
        isPending: false,
      } as any)

      renderPage()

      fireEvent.click(screen.getByRole('button', { name: /^list$/i }))
      await waitFor(() => {
        expect(screen.getByText('brand-logo.jpg')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /delete brand-logo\.jpg/i }))

      const confirmButton = await screen.findByRole('button', { name: 'Delete' })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Image is still in use (1 brand)', { duration: 0 })
      })
      expect(toast.success).not.toHaveBeenCalled()
    })
  })
})
