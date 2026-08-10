import type { ProductStatus } from '@/shared/types/enums'

export type StockLevel = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'

/** One free-form name/value pair (e.g. Colour/Navy) carried inside a variant's `attributesJson`. */
export interface VariantAttribute {
  key: string
  value: string
}

/**
 * Canonical variant shape shared by the read (hydration), write (payload), and
 * form-default surfaces — previously duplicated four ways across this feature.
 * `id`/`priceId`/`wholesalePriceId` are absent for a variant that doesn't exist
 * on the server yet (a freshly added row, or a product being created).
 */
export interface AdminProductVariant {
  id?: string
  priceId?: string
  sku: string
  price: string
  wholesalePriceId?: string
  /** Absent when the variant has no WHOLESALE_PRICE row. */
  wholesalePrice?: string
  stock: number
  attributes: VariantAttribute[]
}

export interface ProductImagePayload {
  /** Stored storage-relative path — the image's identity in the form. */
  url: string
  altText?: string
}

export interface ProductPayload {
  name: string
  slug: string
  shortDescription: string
  description: string
  status: ProductStatus
  categoryIds: string[]
  images: ProductImagePayload[]
  imageIds?: Record<string, string>
  variants: AdminProductVariant[]
}

// --- GraphQL input types (hand-written per project convention) ---

export interface ProductImageDtoInput {
  id?: string
  imageUrl: string
  featured: boolean
  sortOrder: number
  altText: string | null
}

export interface VariantPriceDtoInput {
  id?: string
  priceType: string
  price: string
}

export interface ProductVariantDtoInput {
  id?: string
  sku: string
  stockQuantity: number
  /** Always a valid JSON object string — see `serializeAttributes` in `./mappers`. */
  attributesJson: string
  prices: VariantPriceDtoInput[]
  images?: ProductImageDtoInput[]
  status?: string
}

export interface ProductDtoInput {
  id?: string
  name: string
  slug: string
  shortDescription: string
  description: string
  status: string
  categories: Array<{ id: string }>
}

export interface ProductInformationDtoInput {
  product: ProductDtoInput
  variants: ProductVariantDtoInput[]
}

export interface AdminProductListItem {
  id: string
  name: string
  slug: string
  sku: string
  category: { id: string; name: string }
  status: ProductStatus
  thumbnailUrl: string | null
  retailPrice: string | null
  stockCount: number
  stockLevel?: StockLevel
}

export interface ProductStats {
  total: number
  active: number
  pending: number
  disabled: number
}

/**
 * Derives a StockLevel from a numeric stock count.
 * Returns OUT_OF_STOCK when 0, LOW_STOCK when 1–10, IN_STOCK when > 10.
 */
export function deriveStockLevel(stockCount: number): StockLevel {
  if (stockCount <= 0) return 'OUT_OF_STOCK'
  if (stockCount <= 10) return 'LOW_STOCK'
  return 'IN_STOCK'
}
