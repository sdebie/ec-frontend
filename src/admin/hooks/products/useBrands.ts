import { useBrandList, type BrandListItem } from '@/admin/hooks/brands/useBrandList'

/** @deprecated Use {@link BrandListItem}. Retained for callers that only read id/name. */
export type Brand = Pick<BrandListItem, 'id' | 'name'>

/**
 * Lightweight brand list for dropdowns/filters ({id, name}). Delegates to the
 * single `GetBrands` query in {@link useBrandList} rather than defining a second
 * one — the extra fields for a bounded (<=500) brand set are negligible.
 */
export function useBrands() {
  const { data, isLoading } = useBrandList({ pageIndex: 0, pageSize: 500 })

  return {
    data: data?.content.map(({ id, name }): Brand => ({ id, name })),
    isLoading,
  }
}
