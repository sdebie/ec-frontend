import type { CustomerType } from '@/shared/auth/customerAuthStore'

export interface VariantPriceTiers {
  retailPrice: number | null
  wholesalePrice: number | null
  retailSalePrice: number | null
  wholesaleSalePrice: number | null
}

export interface DisplayPrice {
  price: number | null
  originalPrice: number | null
}

/**
 * Selects which backend-provided price to display based on the customer type.
 * Does NOT calculate, add, subtract, or adjust any price value.
 */
export function getDisplayPrice(
  variant: VariantPriceTiers,
  customerType: CustomerType | null,
): DisplayPrice {
  if (customerType === 'WHOLESALE') {
    const sale = variant.wholesaleSalePrice
    const base = variant.wholesalePrice
    return sale != null
      ? { price: sale, originalPrice: base }
      : { price: base, originalPrice: null }
  }
  // RETAIL or unauthenticated
  const sale = variant.retailSalePrice
  const base = variant.retailPrice
  return sale != null
    ? { price: sale, originalPrice: base }
    : { price: base, originalPrice: null }
}
