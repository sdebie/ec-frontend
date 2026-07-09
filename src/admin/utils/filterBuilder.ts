/**
 * GraphQL FilterRequestInput shape matching the backend FilterRequest class.
 * Defined locally since __generated__ types are gitignored and may not exist at dev time.
 */
export interface FilterRequestInput {
  filters?: FilterItem[]
  filterGroups?: FilterGroup[]
  sort?: SortItem[]
}

interface FilterItem {
  key: string
  value: string
  operator: 'EQUALS' | 'ILIKE'
}

interface FilterGroup {
  filters: FilterItem[]
  operator: 'OR' | 'AND'
}

interface SortItem {
  field: string
  direction: 'ASC' | 'DESC'
}

/**
 * Builds a FilterRequestInput for searching by name with ILIKE.
 * Wraps the trimmed search term in `%` wildcards.
 *
 * Returns undefined if the search string is empty or whitespace-only.
 */
export function buildSearchFilterRequest(search: string): FilterRequestInput | undefined {
  const trimmed = search.trim()

  if (!trimmed) {
    return undefined
  }

  return {
    filters: [
      { key: 'name', operator: 'ILIKE', value: `%${trimmed}%` },
    ],
  }
}
