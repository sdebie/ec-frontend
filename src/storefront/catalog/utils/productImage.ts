import { resolveImageUrl } from '@/shared/utils/imageUrl'

export interface ProductImage {
  imageUrl: string
  featured: boolean
  sortOrder: number
}

export function pickFeaturedImage(images: ProductImage[]): string | null {
  if (!images.length) return null
  const featured = images.find(img => img.featured)
  const raw = featured
    ? featured.imageUrl
    : [...images].sort((a, b) => a.sortOrder - b.sortOrder)[0].imageUrl
  return resolveImageUrl(raw)
}
