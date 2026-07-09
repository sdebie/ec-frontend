import { useState, useEffect } from 'react'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'
import { ImageIcon, Search } from 'lucide-react'

import { useImageList } from '@/admin/hooks/images'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { deriveCanMutate } from '@/admin/hooks/imports/utils'
import { thumbnailUrl } from '@/shared/utils/imageUrl'
import { PageLayout } from '@/shared/ui/components'
import { Button, Input } from '@/shared/ui/primitives'
import { ImagePreviewDialog } from './ImagePreviewDialog'
import { SingleUploadDialog } from './SingleUploadDialog'
import { BulkUploadDialog } from './BulkUploadDialog'

const PAGE_SIZE = 80

export function ImageGalleryPage() {
  const canMutate = deriveCanMutate(useAdminAuthStore((s) => s.role))

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const [totalCount, setTotalCount] = useState(0)

  const [previewFilename, setPreviewFilename] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Reset accumulated images when search changes
  useEffect(() => {
    setImages([])
  }, [debouncedSearch])

  const { data, isLoading } = useImageList({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
  })

  // Append fetched images to accumulated state
  useEffect(() => {
    if (data) {
      setTotalCount(data.totalCount)
      setImages((prev) => {
        if (page === 0) return data.images
        return [...prev, ...data.images]
      })
    }
  }, [data, page])

  const hasMore = images.length < totalCount

  const handleLoadMore = () => {
    setPage((prev) => prev + 1)
  }

  const headerAction = (
    <div className="flex items-center gap-2">
      {canMutate && (
        <>
          <Button variant="ghost" onClick={() => setBulkUploadOpen(true)}>Bulk upload</Button>
          <Button variant="solid" onClick={() => setUploadOpen(true)}>Upload image</Button>
        </>
      )}
    </div>
  )

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Images' },
  ])

  return (
    <PageLayout title="Images" subtitle="Browse and manage store images" action={headerAction}>
      <div className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)" />
          <Input
            placeholder="Search images..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Thumbnail Grid */}
        {isLoading && images.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-(--c-border) rounded-lg" />
                <div className="mt-1.5 h-3 w-3/4 bg-(--c-border) rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {images.map((filename) => (
                <button
                  key={filename}
                  type="button"
                  onClick={() => setPreviewFilename(filename)}
                  className="group text-left focus:outline-none focus:ring-2 focus:ring-(--c-ring) rounded-lg"
                >
                  <div className="aspect-square overflow-hidden rounded-lg border border-(--c-border) bg-(--c-surface)">
                    <ImageCell filename={filename} />
                  </div>
                  <p className="mt-1 text-xs text-(--c-text-muted) truncate">{filename}</p>
                </button>
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button variant="ghost" onClick={handleLoadMore} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Load more'}
                </Button>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && images.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-(--c-text-muted)">
                <ImageIcon className="h-12 w-12 mb-3 opacity-40" />
                <p className="text-sm">No images found</p>
              </div>
            )}
          </>
        )}
      </div>

      <ImagePreviewDialog
        open={previewFilename !== null}
        onClose={() => setPreviewFilename(null)}
        filename={previewFilename}
      />

      <SingleUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />

      <BulkUploadDialog
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
      />
    </PageLayout>
  )
}

function ImageCell({ filename }: { filename: string }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-(--c-surface)">
        <ImageIcon className="h-8 w-8 text-(--c-text-muted) opacity-50" />
      </div>
    )
  }

  return (
    <img
      src={thumbnailUrl(filename)}
      alt={filename}
      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
      onError={() => setHasError(true)}
    />
  )
}
