import {describe, expect, it, vi} from 'vitest'
import {fireEvent, render, screen, within} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'

import {OrderStatus} from '@/shared/types/enums/OrderStatus'
import type {AdminOrderSummary} from '../../types'
import {OrderTable} from '../OrderTable'

vi.mock('../../hooks/useUpdateOrderStatus', () => ({
    useUpdateOrderStatus: () => ({mutate: vi.fn(), isPending: false}),
}))

/**
 * The server pages the orders and returns them in the order it was asked for — that makes
 * row order part of the answer, not a local presentation choice, and a table that re-sorts
 * what it was given can only ever sort the one page it holds, silently reordering 10 rows
 * out of however many matched.
 *
 * The failure this originally pinned is not the click itself but what it leaves behind: the
 * sort state outlives the rows, so every later fetch — a new filter, a new page — arrives
 * correct from the server and is reordered on the way to the screen. `OrderTable` now offers
 * real server-side sorting on the three columns with a backing column, so `sorting`/
 * `onSortingChange` are controlled props here rather than left empty — the "Customer" column
 * clicked below stays unsortable on its own terms (it is a computed fallback, not a stored
 * field), which is what proves the guard still holds where sorting is genuinely absent.
 */

const order = (reference: string, placedAt: string, customerName: string): AdminOrderSummary => ({
    id: reference,
    reference,
    customerName,
    placedAt,
    itemCount: 1,
    total: 100,
    status: OrderStatus.PAID,
})

/** Newest first, as the server returns them. */
const NEWEST_FIRST = [
    order('ORD-3', '2026-08-15T15:08:00', 'Zoe Adams'),
    order('ORD-2', '2026-08-14T09:00:00', 'Mike Brown'),
    order('ORD-1', '2026-08-02T11:22:00', 'Anna Clark'),
]

const renderTable = (data: AdminOrderSummary[]) =>
    render(
        <MemoryRouter>
            <OrderTable
                data={data}
                isLoading={false}
                canMutate={false}
                pageCount={1}
                totalRowCount={data.length}
                pagination={{pageIndex: 0, pageSize: 10}}
                onPaginationChange={vi.fn()}
                sorting={[]}
                onSortingChange={vi.fn()}
            />
        </MemoryRouter>,
    )

const referencesInOrder = () =>
    screen
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getByRole('link', {name: /^ORD-/}).textContent)

describe('OrderTable preserves the order the server returned', () => {
    it('renders rows newest first', () => {
        renderTable(NEWEST_FIRST)

        expect(referencesInOrder()).toEqual(['ORD-3', 'ORD-2', 'ORD-1'])
    })

    it('does not reorder rows when a column header is clicked', () => {
        renderTable(NEWEST_FIRST)

        fireEvent.click(screen.getByText('Customer'))

        expect(referencesInOrder()).toEqual(['ORD-3', 'ORD-2', 'ORD-1'])
    })

    it('renders a newly filtered result newest first even after a header was clicked', () => {
        // The bug in its reported form: the reader sorts by a column, then narrows by date.
        // The server answers correctly; the stale sort reorders the answer before it is seen.
        const {rerender} = renderTable(NEWEST_FIRST)

        fireEvent.click(screen.getByText('Customer'))

        const filtered = [
            order('ORD-9', '2026-08-15T16:00:00', 'Zoe Adams'),
            order('ORD-8', '2026-08-15T08:00:00', 'Anna Clark'),
        ]
        rerender(
            <MemoryRouter>
                <OrderTable
                    data={filtered}
                    isLoading={false}
                    canMutate={false}
                    pageCount={1}
                    totalRowCount={filtered.length}
                    pagination={{pageIndex: 0, pageSize: 10}}
                    onPaginationChange={vi.fn()}
                    sorting={[]}
                    onSortingChange={vi.fn()}
                />
            </MemoryRouter>,
        )

        expect(referencesInOrder()).toEqual(['ORD-9', 'ORD-8'])
    })

    it('clicking a real sortable column asks the server instead of reordering locally', () => {
        const onSortingChange = vi.fn()
        render(
            <MemoryRouter>
                <OrderTable
                    data={NEWEST_FIRST}
                    isLoading={false}
                    canMutate={false}
                    pageCount={1}
                    totalRowCount={NEWEST_FIRST.length}
                    pagination={{pageIndex: 0, pageSize: 10}}
                    onPaginationChange={vi.fn()}
                    sorting={[]}
                    onSortingChange={onSortingChange}
                />
            </MemoryRouter>,
        )

        fireEvent.click(screen.getByText('Order Date'))

        expect(onSortingChange).toHaveBeenCalledTimes(1)
        // The rows themselves must not move — only the server's next response should.
        expect(referencesInOrder()).toEqual(['ORD-3', 'ORD-2', 'ORD-1'])
    })
})
