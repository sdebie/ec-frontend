interface Category {
  id: string
  name: string
  parent: { id: string; name: string } | null
}

/**
 * Returns only top-level categories (parent === null) excluding the one being edited.
 * Used to populate the parent category dropdown in create/edit forms.
 *
 * @param categories - Full list of categories
 * @param editingCategoryId - The ID of the category being edited (omit for create mode)
 */
export function getParentCategoryOptions(
  categories: Category[],
  editingCategoryId?: string | null,
): Category[] {
  return categories.filter(
    (cat) => cat.parent === null && cat.id !== editingCategoryId,
  )
}
