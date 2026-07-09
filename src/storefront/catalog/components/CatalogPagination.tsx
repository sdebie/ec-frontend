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
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalElements)

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
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={isLastPage}
            onClick={() => onPageChange(page + 1)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <p className="text-sm text-gray-500">
        Showing {start}–{end} of {totalElements} products
      </p>
    </div>
  )
}
