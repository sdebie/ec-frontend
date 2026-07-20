/**
 * Pagination utility functions for the admin product list.
 * Exported for independent testing.
 */

/**
 * Calculates the "Showing X to Y of Z results" text.
 *
 * X = (page-1)*pageSize+1, Y = min(page*pageSize, total), Z = total
 * When total = 0, X = 0 (displays "Showing 0 to 0 of 0 results")
 *
 * @param page - 1-based page number
 * @param pageSize - Number of items per page
 * @param total - Total number of items
 */
export function getPaginationText(page: number, pageSize: number, total: number): string {
  if (total === 0) {
    return 'Showing 0 to 0 of 0 results'
  }

  const x = (page - 1) * pageSize + 1
  const y = Math.min(page * pageSize, total)

  return `Showing ${x} to ${y} of ${total} results`
}

export type PageButton = number | '...'

/**
 * Calculates which page buttons to render.
 *
 * Rules:
 * - Always show page 1, current page, and last page
 * - Show up to one page on each side of current page
 * - Use "..." ellipsis for gaps between non-adjacent displayed pages
 *
 * @param currentPage - 1-based current page number
 * @param totalPages - Total number of pages (>= 1)
 */
export function getPageNumbers(currentPage: number, totalPages: number): PageButton[] {
  if (totalPages <= 0) return [1]
  if (totalPages === 1) return [1]

  // Collect the set of pages to always show
  const pageSet = new Set<number>()

  // Always include page 1 and last page
  pageSet.add(1)
  pageSet.add(totalPages)

  // Always include current page (clamped to valid range)
  const clampedCurrent = Math.max(1, Math.min(currentPage, totalPages))
  pageSet.add(clampedCurrent)

  // Include one page on each side of current
  if (clampedCurrent - 1 >= 1) pageSet.add(clampedCurrent - 1)
  if (clampedCurrent + 1 <= totalPages) pageSet.add(clampedCurrent + 1)

  // Sort and insert ellipsis for gaps
  const sorted = Array.from(pageSet).sort((a, b) => a - b)
  const result: PageButton[] = []

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push('...')
    }
    result.push(sorted[i])
  }

  return result
}
