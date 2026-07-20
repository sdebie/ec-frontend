import type { ProductStatus } from '@/shared/types/enums'

export type StockLevel = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'

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
