import {afterEach, describe, expect, it, vi} from 'vitest'
import {cleanup, render, within} from '@testing-library/react'
import fc from 'fast-check'
import {MemoryRouter} from 'react-router-dom'
import {OrderHistoryPage} from '../OrderHistoryPage'
import {formatAmount} from '@/shared/utils/formatAmount'
import type {MyOrder} from '../../hooks/useMyOrders'
import {orderStatusBadgeClasses} from '../../orderStatusBadge'

const mockUseMyOrders = vi.fn()

vi.mock('../../hooks/useMyOrders', () => ({
    useMyOrders: () => mockUseMyOrders(),
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {...actual, useNavigate: () => vi.fn()}
})

const ORDER_STATUSES = ['CREATED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const

// Derived from the real source of truth so the test can never drift from it.
const STATUS_BADGE_CLASSES: Record<string, string> = Object.fromEntries(
    ORDER_STATUSES.map((s) => [s, orderStatusBadgeClasses(s)]),
)

/** Arbitrary for a valid order status */
const orderStatusArb = fc.constantFrom(...ORDER_STATUSES)

/**
 * Arbitrary for a valid ISO date string.
 * Uses integer timestamps within a safe range to avoid Invalid Date issues during shrinking.
 */
const orderDateArb = fc
    .integer({
        min: new Date('2020-01-01T00:00:00Z').getTime(),
        max: new Date('2030-12-31T23:59:59Z').getTime(),
    })
    .map((ts) => new Date(ts).toISOString())

/** Arbitrary for a valid MyOrder object */
const myOrderArb: fc.Arbitrary<MyOrder> = fc.record({
    id: fc.uuid(),
    orderDate: orderDateArb,
    status: orderStatusArb,
    itemCount: fc.integer({min: 1, max: 100}),
    totalAmount: fc.integer({min: 1, max: 99999999}).map((cents) => cents / 100),
})

/** Normalize all whitespace (including NBSP \u00A0) to regular spaces for comparison */
function normalizeWs(text: string): string {
    return text.replace(/\s+/g, ' ').trim()
}

function renderOrderHistory() {
    return render(
        <MemoryRouter>
            <OrderHistoryPage/>
        </MemoryRouter>,
    )
}

describe('OrderHistoryPage — property-based tests', () => {
    afterEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    /**
     * **Validates: Requirements 4.2**
     *
     * Property 3: Order row displays all required fields
     *
     * For any order object with valid date, status, itemCount, and totalAmount,
     * the rendered order row should contain: a formatted date string, a status badge
     * element, the item count, and a formatted total amount.
     */
    describe('Property 3: Order row displays all required fields', () => {
        it('renders date, status badge, item count, and formatted total for any valid order', () => {
            fc.assert(
                fc.property(myOrderArb, (order) => {
                    cleanup()

                    mockUseMyOrders.mockReturnValue({
                        data: {myOrders: [order]},
                        isLoading: false,
                        isError: false,
                        refetch: vi.fn(),
                    })

                    const {container} = renderOrderHistory()
                    const row = container.querySelector('button')!

                    const rowText = normalizeWs(row.textContent ?? '')

                    // Formatted date should be present (en-ZA short format)
                    const expectedDate = new Date(order.orderDate).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })
                    expect(rowText).toContain(expectedDate)

                    // Status badge should be present
                    expect(rowText).toContain(order.status)

                    // Item count should be present
                    const itemText = order.itemCount === 1
                        ? `${order.itemCount} item`
                        : `${order.itemCount} items`
                    expect(rowText).toContain(itemText)

                    // Formatted total amount should be present (normalize NBSP)
                    const formattedAmount = normalizeWs(formatAmount(order.totalAmount))
                    expect(rowText).toContain(formattedAmount)
                }),
                {numRuns: 50},
            )
        })
    })

    /**
     * **Validates: Requirements 4.7**
     *
     * Property 4: Order status badge colour mapping
     *
     * For any valid order status (CREATED, PAID, SHIPPED, DELIVERED, CANCELLED),
     * the rendered badge should apply the Tailwind colour classes defined in the
     * status-to-colour mapping and no other status colour classes.
     */
    describe('Property 4: Order status badge colour mapping', () => {
        it('applies correct Tailwind colour classes for any valid status and no other status classes', () => {
            fc.assert(
                fc.property(orderStatusArb, (status) => {
                    cleanup()

                    const order: MyOrder = {
                        id: 'test-order-id',
                        orderDate: '2024-06-15T10:00:00Z',
                        status,
                        itemCount: 2,
                        totalAmount: 500.0,
                    }

                    mockUseMyOrders.mockReturnValue({
                        data: {myOrders: [order]},
                        isLoading: false,
                        isError: false,
                        refetch: vi.fn(),
                    })

                    const {container} = renderOrderHistory()
                    const view = within(container)

                    const badge = view.getByText(status)
                    const expectedClasses = STATUS_BADGE_CLASSES[status]

                    // Badge should contain the expected colour classes
                    for (const cls of expectedClasses.split(' ')) {
                        expect(badge.className).toContain(cls)
                    }

                    // Badge should NOT contain colour classes for other statuses
                    const otherStatuses = ORDER_STATUSES.filter((s) => s !== status)
                    for (const otherStatus of otherStatuses) {
                        const otherClasses = STATUS_BADGE_CLASSES[otherStatus].split(' ')
                        const otherBgClass = otherClasses.find((c) => c.startsWith('bg-'))!
                        const expectedBgClass = expectedClasses.split(' ').find((c) => c.startsWith('bg-'))!
                        // Only assert if the bg class differs from the expected one
                        if (otherBgClass !== expectedBgClass) {
                            expect(badge.className).not.toContain(otherBgClass)
                        }
                    }
                }),
                {numRuns: 20},
            )
        })
    })
})
