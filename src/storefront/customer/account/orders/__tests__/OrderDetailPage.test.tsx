import {afterEach, describe, expect, it, vi} from 'vitest'
import {cleanup, render} from '@testing-library/react'
import fc from 'fast-check'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import {OrderDetailPage} from '../OrderDetailPage'
import {formatAmount} from '@/shared/utils/formatAmount'
import {formatDisplayDate} from '@/shared/utils/formatDateTime'
import type {OrderDetail} from '../../hooks/useOrderDetail'

const mockUseOrderDetail = vi.fn()

vi.mock('../../hooks/useOrderDetail', () => ({
    useOrderDetail: (orderId: string) => mockUseOrderDetail(orderId),
}))

const ORDER_STATUSES = ['CREATED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const

/** Arbitrary for a valid order status */
const orderStatusArb = fc.constantFrom(...ORDER_STATUSES)

/**
 * Arbitrary for a valid ISO date string.
 * Uses integer timestamps within a safe range.
 */
const orderDateArb = fc
    .integer({
        min: new Date('2020-01-01T00:00:00Z').getTime(),
        max: new Date('2030-12-31T23:59:59Z').getTime(),
    })
    .map((ts) => new Date(ts).toISOString())

/** Arbitrary for a valid shipping address */
const addressArb = fc.record({
    line1: fc.string({minLength: 1, maxLength: 50}).filter((s) => s.trim().length > 0),
    line2: fc.option(fc.string({minLength: 1, maxLength: 50}), {nil: null}),
    suburb: fc.option(fc.string({minLength: 1, maxLength: 30}), {nil: null}),
    city: fc.string({minLength: 1, maxLength: 30}).filter((s) => s.trim().length > 0),
    province: fc.string({minLength: 1, maxLength: 30}).filter((s) => s.trim().length > 0),
    postalCode: fc.stringMatching(/^[0-9]{4,6}$/),
})

/** Arbitrary for a valid line item */
const lineItemArb = fc.record({
    productName: fc.string({minLength: 1, maxLength: 40}).filter((s) => s.trim().length > 0),
    variantName: fc.string({minLength: 1, maxLength: 30}).filter((s) => s.trim().length > 0),
    quantity: fc.integer({min: 1, max: 100}),
    unitPrice: fc.integer({min: 1, max: 9999999}).map((cents) => cents / 100),
})

/** Arbitrary for a status history event */
const statusEventArb = fc.record({
    status: orderStatusArb.map((s) => s as string),
    timestamp: orderDateArb,
})

const orderDetailArb: fc.Arbitrary<OrderDetail> = fc
    .record({
        id: fc.uuid(),
        orderDate: orderDateArb,
        status: orderStatusArb,
        totalAmount: fc.integer({min: 1, max: 9999999}).map((cents) => cents / 100),
        shippingAddress: addressArb,
        lineItems: fc.array(lineItemArb, {minLength: 1, maxLength: 5}),
        statusHistory: fc.array(statusEventArb, {minLength: 0, maxLength: 5}),
    })

/** Normalize all whitespace (including NBSP \u00A0) to regular spaces for comparison */
function normalizeWs(text: string): string {
    return text.replace(/\s+/g, ' ').trim()
}

function renderOrderDetail(orderId: string) {
    return render(
        <MemoryRouter initialEntries={[`/account/orders/${orderId}`]}>
            <Routes>
                <Route path="/account/orders/:orderId" element={<OrderDetailPage/>}/>
            </Routes>
        </MemoryRouter>,
    )
}

describe('OrderDetailPage — property-based tests', () => {
    afterEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    /**
     * Property 5: Order detail renders all required fields
     *
     * For any order with varying line items (name, variant, quantity, unit price),
     * status, shipping address, and total, the detail page should render all of
     * those fields without omission.
     */
    describe('Property 5: Order detail renders all required fields', () => {
        it('renders order date, status, shipping address, line items, and total for any valid order', () => {
            fc.assert(
                fc.property(orderDetailArb, (order) => {
                    cleanup()

                    mockUseOrderDetail.mockReturnValue({
                        data: {getOrderDetail: order},
                        isLoading: false,
                        isError: false,
                    })

                    const {container} = renderOrderDetail(order.id)
                    const pageText = normalizeWs(container.textContent ?? '')

                    // Order date should be rendered in the shared display format
                    expect(pageText).toContain(formatDisplayDate(order.orderDate))

                    // Status should be rendered
                    expect(pageText).toContain(order.status)

                    // Shipping address fields should be rendered
                    expect(pageText).toContain(normalizeWs(order.shippingAddress.line1))
                    expect(pageText).toContain(normalizeWs(order.shippingAddress.city))
                    expect(pageText).toContain(normalizeWs(order.shippingAddress.province))
                    expect(pageText).toContain(order.shippingAddress.postalCode)

                    // Each line item fields should be rendered
                    for (const item of order.lineItems) {
                        expect(pageText).toContain(normalizeWs(item.productName))
                        expect(pageText).toContain(normalizeWs(item.variantName))
                        expect(pageText).toContain(String(item.quantity))
                        const formattedPrice = normalizeWs(formatAmount(item.unitPrice))
                        expect(pageText).toContain(formattedPrice)
                    }

                    // Total amount should be rendered
                    const formattedTotal = normalizeWs(formatAmount(order.totalAmount))
                    expect(pageText).toContain(formattedTotal)
                }),
                {numRuns: 50},
            )
        })
    })

    /**
     * Property 6: Status history chronological order
     *
     * For any order with a status history containing two or more events, the
     * rendered timeline should display events in chronological (ascending timestamp) order.
     */
    describe('Property 6: Status history chronological order', () => {
        it('renders status history events in ascending chronological order', () => {
            const orderWithHistoryArb = fc.record({
                id: fc.uuid(),
                orderDate: orderDateArb,
                status: orderStatusArb,
                totalAmount: fc.integer({min: 1, max: 9999999}).map((cents) => cents / 100),
                shippingAddress: addressArb,
                lineItems: fc.array(lineItemArb, {minLength: 1, maxLength: 3}),
                statusHistory: fc.array(statusEventArb, {minLength: 2, maxLength: 6}),
            }) as fc.Arbitrary<OrderDetail>

            fc.assert(
                fc.property(orderWithHistoryArb, (order) => {
                    cleanup()

                    mockUseOrderDetail.mockReturnValue({
                        data: {getOrderDetail: order},
                        isLoading: false,
                        isError: false,
                    })

                    const {container} = renderOrderDetail(order.id)

                    // Get the timeline list element
                    const timeline = container.querySelector('ol')
                    expect(timeline).not.toBeNull()

                    // Get all timeline items
                    const timelineItems = timeline!.querySelectorAll('li')

                    // Expected sorted order (ascending by timestamp)
                    const expectedSorted = [...order.statusHistory].sort(
                        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
                    )

                    // Verify the number of timeline items matches the history length
                    expect(timelineItems.length).toBe(expectedSorted.length)

                    // Verify each timeline item renders in ascending order
                    timelineItems.forEach((item, index) => {
                        const itemText = normalizeWs(item.textContent ?? '')
                        expect(itemText).toContain(expectedSorted[index].status)
                    })
                }),
                {numRuns: 50},
            )
        })
    })
})
