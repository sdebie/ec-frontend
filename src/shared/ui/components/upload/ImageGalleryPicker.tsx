import { Check, Loader } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/shared/utils/cn'

export interface ImageGalleryPickerProps {
  /** Array of image URLs to display in the gallery */
  images: string[]
  /** Currently selected image URL */
  selectedImage?: string | null
  /** Callback when an image is selected — caller handles the selection logic */
  onSelect: (imageUrl: string) => void
  /** Whether the gallery is in a loading state */
  isLoading?: boolean
  /** Custom CSS class */
  className?: string
}

export const ImageGalleryPicker: React.FC<ImageGalleryPickerProps> = ({
  images,
  selectedImage,
  onSelect,
  isLoading = false,
  className,
}) => {
  if (isLoading && images.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12 text-(--c-text-muted)', className)}>
        <Loader className="w-5 h-5 animate-spin mr-2" />
        Loading images...
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8 text-(--c-text-muted) text-sm', className)}>
        No images available
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((imageUrl) => (
          <button
            key={imageUrl}
            onClick={() => onSelect(imageUrl)}
            type="button"
            className={cn(
              'group relative aspect-square rounded-md overflow-hidden border-2 transition',
              selectedImage === imageUrl
                ? 'border-(--c-accent) scale-95 bg-(--c-surface-hover)'
                : 'border-(--c-border) hover:border-(--c-accent)'
            )}
          >
            <img
              src={imageUrl}
              className="w-full h-full object-cover"
              alt=""
            />
            {selectedImage === imageUrl && (
              <div className="absolute top-1 right-1 bg-(--c-accent) rounded-full p-1 shadow-md">
                <Check className="w-3 h-3 text-(--c-accent-text)" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-end p-1 transition">
              <span className="text-[10px] truncate w-full text-(--c-accent-text)">
                {imageUrl.split('/').pop() || imageUrl}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
