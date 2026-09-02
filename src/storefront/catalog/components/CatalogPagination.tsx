import { clampItemRange } from '@/shared/utils/pagination'

interface CatalogPaginationProps {
  page: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function CatalogPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
}: CatalogPaginationProps) {
  const { start, end } = clampItemRange(page, pageSize, totalElements)

  const isFirstPage = page === 1
  const isLastPage = page >= totalPages

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {totalPages > 1 && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            disabled={isFirstPage}
            onClick={() => onPageChange(page - 1)}
            className="rounded-md border border-(--sf-border) bg-(--sf-panel) px-4 py-2 text-sm font-medium text-(--sf-text) transition-colors hover:bg-(--sf-surface-muted) disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-(--sf-text)">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={isLastPage}
            onClick={() => onPageChange(page + 1)}
            className="rounded-md border border-(--sf-border) bg-(--sf-panel) px-4 py-2 text-sm font-medium text-(--sf-text) transition-colors hover:bg-(--sf-surface-muted) disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <p className="text-sm text-(--sf-muted-text)">
        Showing {start}–{end} of {totalElements} products
      </p>
    </div>
  )
}
