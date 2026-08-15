import {beforeEach, describe, expect, it, vi} from 'vitest'
import fc from 'fast-check'
import {render, screen} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import type {MyOrder} from '../hooks/useMyOrders'
import {useMyOrders} from '../hooks/useMyOrders'
import {useCustomerProfile} from '../hooks/useCustomerProfile'
import {useWishlist} from '../wishlist/hooks/useWishlist'
import {AccountDashboardPage} from '../AccountDashboardPage'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'

vi.mock('../hooks/useMyOrders')
vi.mock('../hooks/useCustomerProfile')
vi.mock('../wishlist/hooks/useWishlist')

const mockedUseMyOrders = vi.mocked(useMyOrders)
const mockedUseCustomerProfile = vi.mocked(useCustomerProfile)
const mockedUseWishlist = vi.mocked(useWishlist)

/**
 * Drawn from the OrderStatus vocabulary itself. Hand-listing the statuses is how
 * `SHIPPED` — which the enum has never contained — survived here while the six real
 * statuses it omitted went untested.
 */
const orderStatusArb = fc.constantFrom(...Object.values(OrderStatus))

/** Arbitrary for a valid ISO date string (within a reasonable range) */
const orderDateArb = fc
    .integer({min: new Date('2020-01-01').getTime(), max: new Date('2030-12-31').getTime()})
    .map((ts) => new Date(ts).toISOString())

const myOrderArb: fc.Arbitrary<MyOrder> = fc.record({
    id: fc.uuid(),
    orderDate: orderDateArb,
    status: orderStatusArb,
    itemCount: fc.integer({min: 1, max: 50}),
    totalAmount: fc.integer({min: 100, max: 100000}),
})

/** Arbitrary for a list of orders with length 0 to 10 */
const ordersListArb = fc.array(myOrderArb, {minLength: 0, maxLength: 10})

function setupDefaultMocks(orders: MyOrder[]) {
    mockedUseMyOrders.mockReturnValue({
        data: {myOrders: orders},
        isLoading: false,
    } as ReturnType<typeof useMyOrders>)

    mockedUseCustomerProfile.mockReturnValue({
        data: {firstName: 'Test', lastName: 'User', email: 'test@example.com'},
        isLoading: false,
    } as ReturnType<typeof useCustomerProfile>)

    mockedUseWishlist.mockReturnValue({
        data: new Set<string>(),
        isLoading: false,
    } as ReturnType<typeof useWishlist>)
}

function renderDashboard() {
    return render(
        <MemoryRouter>
            <AccountDashboardPage/>
        </MemoryRouter>,
    )
}

describe('AccountDashboardPage — property-based tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    /**
     * Property 2: Dashboard recent orders limit
     *
     * For any list of orders of length N, the dashboard should display exactly
     * min(3, N) orders, and they should be the 3 most recent by date (descending).
     */
    describe('Property 2: Dashboard recent orders limit', () => {
        it('displays exactly min(3, N) order links for any list of N orders', () => {
            fc.assert(
                fc.property(ordersListArb, (orders) => {
                    setupDefaultMocks(orders)
                    const {unmount} = renderDashboard()

                    const expectedCount = Math.min(3, orders.length)

                    // Each order renders as a Link to /account/orders/{id}
                    const orderLinks = screen
                        .queryAllByRole('link')
                        .filter((link) =>
                            link.getAttribute('href')?.match(/^\/account\/orders\/[0-9a-f-]+$/),
                        )

                    expect(orderLinks).toHaveLength(expectedCount)

                    unmount()
                }),
                {numRuns: 100},
            )
        })

        it('displays orders in descending date order (most recent first)', () => {
            fc.assert(
                fc.property(
                    fc.array(myOrderArb, {minLength: 2, maxLength: 10}),
                    (orders) => {
                        setupDefaultMocks(orders)
                        const {unmount} = renderDashboard()

                        // Compute expected order: sorted by orderDate descending, take first 3
                        const expectedOrders = [...orders]
                            .sort(
                                (a, b) =>
                                    new Date(b.orderDate).getTime() -
                                    new Date(a.orderDate).getTime(),
                            )
                            .slice(0, 3)

                        // Get rendered order links — they correspond to displayed orders
                        const orderLinks = screen
                            .queryAllByRole('link')
                            .filter((link) =>
                                link.getAttribute('href')?.match(/^\/account\/orders\/[0-9a-f-]+$/),
                            )

                        // Verify order IDs match the expected sorted order
                        const renderedIds = orderLinks.map((link) => {
                            const href = link.getAttribute('href')!
                            return href.replace('/account/orders/', '')
                        })

                        const expectedIds = expectedOrders.map((o) => o.id)
                        expect(renderedIds).toEqual(expectedIds)

                        unmount()
                    },
                ),
                {numRuns: 100},
            )
        })

        it('displays no order links when the order list is empty', () => {
            setupDefaultMocks([])
            renderDashboard()

            const orderLinks = screen
                .queryAllByRole('link')
                .filter((link) =>
                    link.getAttribute('href')?.match(/^\/account\/orders\/[0-9a-f-]+$/),
                )

            expect(orderLinks).toHaveLength(0)
            expect(screen.getByText(/no orders yet/i)).toBeInTheDocument()
        })
    })
})
