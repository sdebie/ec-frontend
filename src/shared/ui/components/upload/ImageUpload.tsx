import { ImageIcon, UploadCloud, X } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/shared/utils/cn'

export interface ImageUploadProps {
  /** Array of image URLs currently displayed */
  images: string[]
  /** Callback when a file is selected for upload — caller handles the API call */
  onUpload: (file: File) => void
  /** Callback to remove an image by its URL */
  onRemove: (imageUrl: string) => void
  /** Custom label for the upload area */
  label?: string
  /** Whether the component is disabled */
  disabled?: boolean
  /** Custom CSS class */
  className?: string
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onUpload,
  onRemove,
  label = 'Upload Image',
  disabled = false,
  className,
}) => {
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    onUpload(file)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file || disabled) return
    onUpload(file)
  }

  return (
    <div className={cn('w-full', className)}>
      <label className="block text-sm font-medium text-(--c-text) mb-3">
        {label}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        aria-label="Upload image file"
      />

      <div className="space-y-3">
        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          aria-label="Upload image"
          className={cn(
            'flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 outline-none',
            !disabled && !isDragging &&
              'border-(--c-border) hover:border-(--c-accent) hover:bg-(--c-surface-hover) cursor-pointer focus-visible:border-(--c-accent) focus-visible:ring-2 focus-visible:ring-(--c-ring)',
            isDragging && !disabled &&
              'border-(--c-accent) bg-(--c-surface-hover) scale-[1.01] cursor-copy',
            disabled && 'border-(--c-border) cursor-not-allowed opacity-40'
          )}
        >
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200',
              isDragging
                ? 'bg-(--c-surface-hover) text-(--c-accent)'
                : 'bg-(--c-border)/60 text-(--c-text-muted)'
            )}
          >
            <UploadCloud className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-(--c-text) leading-snug">
              {isDragging ? (
                'Drop to upload'
              ) : (
                <>
                  Click to upload{' '}
                  <span className="font-normal text-(--c-text-muted)">
                    or drag and drop
                  </span>
                </>
              )}
            </p>
            <p className="text-xs text-(--c-text-muted)">PNG, JPG, GIF</p>
          </div>
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((imageUrl) => (
              <div
                key={imageUrl}
                className="relative overflow-hidden rounded-xl border border-(--c-border) bg-(--c-panel)"
              >
                <div className="flex items-center justify-between border-b border-(--c-border) px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs text-(--c-text-muted)">
                    <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium truncate max-w-[100px]">
                      Image
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(imageUrl)}
                    disabled={disabled}
                    aria-label="Remove image"
                    className="rounded-md p-1 text-(--c-text-muted) transition-colors hover:bg-(--c-bg) hover:text-(--c-text) disabled:pointer-events-none disabled:opacity-40"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="relative flex items-center justify-center bg-(--c-bg) p-2 min-h-24">
                  <img
                    src={imageUrl}
                    alt="Uploaded"
                    className="max-h-32 max-w-full rounded-lg object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
