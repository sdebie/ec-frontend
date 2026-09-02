import {useCallback, useMemo} from 'react'
import {useSearchParams} from 'react-router-dom'
import type {OnChangeFn, SortingState, Updater} from '@tanstack/react-table'
import type {SortItem} from '@/admin/utils'

export interface UseTableSortResult {
    /** DataTable's own sorting state — pass straight through as its `sorting` prop. */
    sorting: SortingState
    /** DataTable's own change handler — pass straight through as its `onSortingChange` prop. */
    onSortingChange: OnChangeFn<SortingState>
    /** The list query's `filterRequest.sort`, or undefined when nothing is sorted. */
    sort: SortItem[] | undefined
}

/**
 * Server-side sorting for one admin list, shared by every table so the URL-persistence logic
 * exists in one place instead of being copied per table.
 *
 * **The column id is the sort key, unmodified.** A `ColumnDef`'s `accessorKey` becomes its
 * `column.id`, and that id is exactly the string this hook writes to the URL and sends the
 * server as `sort[0].field` — there is no translation table between the two. This only
 * works because the convention elsewhere in this codebase is to name a column's
 * `accessorKey` after the DTO field it displays, matching the wire shape (see
 * `useBrands`/`useAdminProductList`'s selection sets). A column whose accessorKey does not
 * match a real, sortable field on the backend entity will send a `sort.field` the server
 * cannot resolve — check the entity's fields, not just the DTO's, before wiring a new
 * column to this hook.
 *
 * Sort state lives in the URL (`sortBy`/`sortDir`), the same as page and search — a sorted
 * column survives `navigate(-1)` from a create/edit form the same way the page number does.
 *
 * Only one column sorts at a time: `sorting` is at most one entry, matching what a single
 * `sortBy`/`sortDir` pair in the URL can express. Multi-column sort would need its own URL
 * encoding and is not something any admin table has asked for.
 *
 * `defaultSort` only applies while the URL carries no `sortBy` at all — the moment a caller
 * sorts by anything (including re-sorting the default column, e.g. toggling it to ascending),
 * that becomes an explicit URL state and wins outright. It never merges with the URL: a
 * `sortBy` with no `sortDir` still means ascending, not "fall back to the default's direction".
 */
export function useTableSort(defaultSort?: { field: string; desc: boolean }): UseTableSortResult {
    const [searchParams, setSearchParams] = useSearchParams()
    const urlSortField = searchParams.get('sortBy')
    const sortField = urlSortField ?? defaultSort?.field ?? null
    const sortDesc = urlSortField ? searchParams.get('sortDir') === 'desc' : (defaultSort?.desc ?? false)

    const sorting = useMemo<SortingState>(
        () => (sortField ? [{id: sortField, desc: sortDesc}] : []),
        [sortField, sortDesc],
    )

    const onSortingChange: OnChangeFn<SortingState> = useCallback(
        (updater: Updater<SortingState>) => {
            const next = typeof updater === 'function' ? updater(sorting) : updater
            setSearchParams((prev) => {
                const nextParams = new URLSearchParams(prev)
                const nextSort = next[0]
                if (nextSort) {
                    nextParams.set('sortBy', nextSort.id)
                    nextParams.set('sortDir', nextSort.desc ? 'desc' : 'asc')
                } else {
                    nextParams.delete('sortBy')
                    nextParams.delete('sortDir')
                }
                // A sort changes which page 1 means, the same way a filter does — staying
                // put would strand the reader on a page number that may no longer hold
                // what it held before.
                nextParams.set('page', '0')
                return nextParams
            })
        },
        [sorting, setSearchParams],
    )

    const sort: SortItem[] | undefined = sortField
        ? [{field: sortField, direction: sortDesc ? 'DESC' : 'ASC'}]
        : undefined

    return {sorting, onSortingChange, sort}
}
