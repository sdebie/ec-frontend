import type { Category } from '@/types/shared/CategoryTypes.ts'

/**
 * Picks a storefront root category id whose name matches any of the hints.
 */
export function resolveRootCategoryId(categories: Category[], hints: string[]): string | null {
    if (hints.length === 0) return null

    const roots = categories.filter((c) => c.parent == null)
    const normalizedHints = hints.map((h) => h.toLowerCase().trim())

    for (const cat of roots) {
        const name = cat.name.toLowerCase()
        for (const hint of normalizedHints) {
            if (!hint) continue
            if (name.includes(hint)) {
                return cat.id
            }
        }
    }

    return null
}
