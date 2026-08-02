import { useMemo, useState } from 'react'
import { pickFeaturedImage } from '../utils/productImage'
import { resolveImageUrl } from '@/shared/utils/imageUrl'

interface ImageGalleryProps {
  images: Array<{
    id: string
    imageUrl: string
    featured: boolean
    sortOrder: number
  }>
  productName: string
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const featuredUrl = pickFeaturedImage(images)
  const [selectedImage, setSelectedImage] = useState<string | null>(featuredUrl)

  // The flat list carries one row per VARIANT image, and variants of the same
  // product overwhelmingly share a single photo — one live product has 24 image
  // rows and exactly 1 distinct URL. Undeduplicated that renders 24 identical
  // thumbnails, and since selection is matched by URL, every one of them
  // highlights at once. Collapse by URL: the strip then shows genuinely
  // different pictures, and hides itself entirely when there is only one.
  const uniqueImages = useMemo(() => {
    const seen = new Set<string>()
    return images.filter((image) => {
      const url = resolveImageUrl(image.imageUrl)
      if (!url || seen.has(url)) return false
      seen.add(url)
      return true
    })
  }, [images])

  if (!images.length || !selectedImage) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-(--sf-surface-muted)">
        <div className="flex h-full w-full items-center justify-center text-(--sf-muted-text)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-3">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-(--sf-surface-muted)">
        <img
          src={selectedImage}
          alt={productName}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>

      {uniqueImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {[...uniqueImages]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedImage(resolveImageUrl(image.imageUrl))}
                className={`shrink-0 h-16 w-16 overflow-hidden rounded-md border-2 transition-colors ${
                  selectedImage === resolveImageUrl(image.imageUrl)
                    ? 'border-(--sf-accent)'
                    : 'border-transparent hover:border-(--sf-border)'
                }`}
              >
                <img
                  src={resolveImageUrl(image.imageUrl) ?? ''}
                  alt={productName}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
