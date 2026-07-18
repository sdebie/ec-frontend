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

/**
 * A single price row as returned by the GraphQL `prices` field on a variant.
 * The backend emits one row per tier; sale rows carry an `active` flag.
 */
export interface VariantPriceEntry {
  price: number | null
  priceType: string | null
  active: boolean | null
}

/**
 * Adapts the variant `prices[]` array (GraphQL shape) into the flat
 * {@link VariantPriceTiers} that {@link getDisplayPrice} consumes.
 *
 * Sale tiers are only taken when their row is `active === true`; base tiers are
 * taken as-is. This keeps all tier-selection semantics in `getDisplayPrice`
 * rather than re-deriving them per call site.
 */
export function priceTiersFromEntries(entries: VariantPriceEntry[]): VariantPriceTiers {
  const base = (type: string) => entries.find((e) => e.priceType === type)?.price ?? null
  const activeSale = (type: string) =>
    entries.find((e) => e.priceType === type && e.active === true)?.price ?? null

  return {
    retailPrice: base('RETAIL_PRICE'),
    wholesalePrice: base('WHOLESALE_PRICE'),
    retailSalePrice: activeSale('RETAIL_SALE_PRICE'),
    wholesaleSalePrice: activeSale('WHOLESALE_SALE_PRICE'),
  }
}
