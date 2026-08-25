import { useCategoryList } from '@/admin/pages/categories/hooks/useCategoryList'
import type { CategoryListItem } from '@/admin/pages/categories/types'

type Category = Pick<CategoryListItem, 'id' | 'name'>

/**
 * Lightweight category list for dropdowns/filters ({id, name}). Delegates to
 * the single `GetCategories` query in {@link useCategoryList} rather than
 * defining a second one — the extra fields for a bounded (<=500) category set
 * are negligible.
 */
export function useCategories() {
  const { data, isLoading } = useCategoryList({ pageIndex: 0, pageSize: 500 })

  return {
    data: data?.content.map(({ id, name }): Category => ({ id, name })),
    isLoading,
  }
}
