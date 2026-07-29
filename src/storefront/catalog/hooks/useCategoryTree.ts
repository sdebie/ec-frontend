import { useMemo } from 'react'
import { useCategories } from './useCategories'
import { buildCategoryTree, type CategoryNode } from '../utils/buildCategoryTree'

export type { CategoryNode }

export function useCategoryTree() {
  const { categories, isLoading, isError } = useCategories()
  const tree = useMemo(() => buildCategoryTree(categories), [categories])
  return { tree, isLoading, isError }
}
