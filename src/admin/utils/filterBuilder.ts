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

export interface SortItem {
  field: string
  direction: 'ASC' | 'DESC'
}

/**
 * Builds a FilterRequestInput for searching by name with ILIKE, optionally
 * combined with a sort. Wraps the trimmed search term in `%` wildcards.
 *
 * Returns undefined only when there's neither a search term nor a sort —
 * sort must still come through even when the search box is empty.
 */
export function buildSearchFilterRequest(search: string, sort?: SortItem[]): FilterRequestInput | undefined {
  const trimmed = search.trim()
  const hasSort = !!sort && sort.length > 0

  if (!trimmed && !hasSort) {
    return undefined
  }

  return {
    ...(trimmed ? { filters: [{ key: 'name', operator: 'ILIKE' as const, value: `%${trimmed}%` }] } : {}),
    ...(hasSort ? { sort } : {}),
  }
}
