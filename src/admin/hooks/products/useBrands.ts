import { useBrandList } from '@/admin/pages/brands/hooks/useBrandList'
import type { BrandListItem } from '@/admin/pages/brands/types'

/** Narrow {id, name} shape this hook hands to dropdown/filter consumers. */
type Brand = Pick<BrandListItem, 'id' | 'name'>

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
