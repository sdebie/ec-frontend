import {describe, expect, it} from 'vitest'
import {act, renderHook} from '@testing-library/react'
import {MemoryRouter, useSearchParams} from 'react-router-dom'
import {createElement} from 'react'
import {useTableSort} from '../useTableSort'

/**
 * Exposes the MemoryRouter's current search string so a test can assert on what
 * `onSortingChange` actually wrote to the URL, not just what it was called with — a
 * sibling under the same Router re-renders alongside the hook and stays in sync via the
 * router's shared location state.
 */
function createWrapper(initialEntries: string[] = ['/admin/products/brands']) {
    const location = {search: ''}

    function LocationSpy() {
        const [params] = useSearchParams()
        location.search = params.toString()
        return null
    }

    const Wrapper = ({children}: { children: React.ReactNode }) =>
        createElement(MemoryRouter, {initialEntries}, children, createElement(LocationSpy))

    return {Wrapper, location}
}

/**
 * The mount-reconciliation guard defers via setTimeout(0) — this flushes past it the same
 * way a real macrotask boundary would, without reaching for fake timers.
 */
async function flushMountGuard() {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
    })
}

describe('useTableSort', () => {
    it('exposes an empty sorting array and no sort request when the URL carries no sort', () => {
        const {Wrapper} = createWrapper(['/admin/products/brands'])
        const {result} = renderHook(() => useTableSort(), {wrapper: Wrapper})

        expect(result.current.sorting).toEqual([])
        expect(result.current.sort).toBeUndefined()
    })

    it('derives sorting and a SortItem from sortBy/sortDir in the URL', () => {
        const {Wrapper} = createWrapper(['/admin/products/brands?sortBy=name&sortDir=desc'])
        const {result} = renderHook(() => useTableSort(), {wrapper: Wrapper})

        expect(result.current.sorting).toEqual([{id: 'name', desc: true}])
        expect(result.current.sort).toEqual([{field: 'name', direction: 'DESC'}])
    })

    it('defaults to ascending when sortDir is absent from the URL', () => {
        const {Wrapper} = createWrapper(['/admin/products/brands?sortBy=slug'])
        const {result} = renderHook(() => useTableSort(), {wrapper: Wrapper})

        expect(result.current.sorting).toEqual([{id: 'slug', desc: false}])
        expect(result.current.sort).toEqual([{field: 'slug', direction: 'ASC'}])
    })

    it('the column id in the URL is passed straight through as the sort field, unmodified', () => {
        // This is the whole contract: whatever id a caller's ColumnDef exposes (its
        // accessorKey, i.e. the DTO's own field name) becomes the server's sort key. No
        // translation table exists between the two, so a column's accessorKey has to
        // already match what the backend accepts.
        const {Wrapper} = createWrapper(['/admin/products/brands?sortBy=customerName&sortDir=asc'])
        const {result} = renderHook(() => useTableSort(), {wrapper: Wrapper})

        expect(result.current.sort).toEqual([{field: 'customerName', direction: 'ASC'}])
    })

    it('onSortingChange writes sortBy/sortDir to the URL and resets page to 0', async () => {
        const {Wrapper, location} = createWrapper(['/admin/products/brands?page=2'])
        const {result} = renderHook(() => useTableSort(), {wrapper: Wrapper})

        await flushMountGuard()

        act(() => {
            result.current.onSortingChange([{id: 'name', desc: true}])
        })

        expect(location.search).toContain('sortBy=name')
        expect(location.search).toContain('sortDir=desc')
        expect(location.search).toContain('page=0')
    })

    it('onSortingChange with an empty array clears sortBy/sortDir from the URL', async () => {
        const {Wrapper, location} = createWrapper(['/admin/products/brands?sortBy=name&sortDir=asc'])
        const {result} = renderHook(() => useTableSort(), {wrapper: Wrapper})

        await flushMountGuard()

        act(() => {
            result.current.onSortingChange([])
        })

        expect(location.search).not.toContain('sortBy')
        expect(location.search).not.toContain('sortDir')
    })

    it('ignores the reconciliation call react-table fires with its own default during mount', () => {
        // Regression guard for the bug the mount-guard exists to prevent: react-table's
        // sorting plugin calls onSortingChange with [] during mount, before the
        // setTimeout(0) guard has flipped — a URL-restored sort must survive that call
        // untouched. No await before it: the guard flips on the next macrotask, so the
        // only way to land inside its window is to call synchronously, exactly like
        // react-table's own reconciliation does.
        const {Wrapper, location} = createWrapper(['/admin/products/brands?sortBy=name&sortDir=desc'])
        const {result} = renderHook(() => useTableSort(), {wrapper: Wrapper})

        act(() => {
            result.current.onSortingChange([])
        })

        expect(location.search).toContain('sortBy=name')
        expect(location.search).toContain('sortDir=desc')
    })

    it('a functional updater receives the current sorting state, matching TanStack\'s contract', async () => {
        const {Wrapper, location} = createWrapper(['/admin/products/brands?sortBy=name&sortDir=asc'])
        const {result} = renderHook(() => useTableSort(), {wrapper: Wrapper})

        await flushMountGuard()

        act(() => {
            result.current.onSortingChange((current) => {
                expect(current).toEqual([{id: 'name', desc: false}])
                return [{id: current[0].id, desc: !current[0].desc}]
            })
        })

        expect(location.search).toContain('sortDir=desc')
    })
})
