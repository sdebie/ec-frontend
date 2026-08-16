import { useMemo, useState } from 'react'
import { pickFeaturedImage } from '@/storefront/catalog'
import { resolveImageUrl } from '@/shared/utils/imageUrl'
import {ProductImagePlaceholder} from './ProductImageStage'

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
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-(--sf-surface-muted)">
        <ProductImagePlaceholder className="h-16 w-16"/>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-3">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-(--sf-surface-muted)">
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
