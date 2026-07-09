import type { FC } from 'react'
import { cn } from '@/shared/utils/cn'

export interface ProductImageProps {
  /** The image source URL */
  src: string
  /** Alt text for the image */
  alt: string
  /** Optional fallback image URL */
  fallbackSrc?: string
  /** Custom CSS class */
  className?: string
}

export const ProductImage: FC<ProductImageProps> = ({
  src,
  alt,
  fallbackSrc = '/img/default-product.png',
  className,
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={cn('w-full h-48 object-cover rounded-md', className)}
      onError={(e) => {
        const target = e.target as HTMLImageElement
        target.src = fallbackSrc
      }}
    />
  )
}
