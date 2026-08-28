import {afterEach, describe, expect, it} from 'vitest'
import * as fc from 'fast-check'
import {cleanup, render} from '@testing-library/react'
import {OrderStatusDisplay} from '../OrderStatusDisplay'
import {ProductStatusDisplay} from '@/shared/ui/components'
import {OrderStatus, OrderStatusOptions} from '@/shared/types/enums/OrderStatus'
import {ProductStatus, ProductStatusOptions} from '@/shared/types/enums/ProductStatus'

/**
 * Property 9: Status display renders the correct badge
 *
 * For any enum value from OrderStatus or ProductStatus, the corresponding StatusDisplay
 * SHALL render a badge carrying that status's label and a defined token family.
 *
 * These assertions deliberately do not restate StatusBadge's colour map: a copy of the map
 * can only detect that it changed, never that it is wrong (StatusBadge.tsx documents two
 * real defects this distinction caught). What is asserted instead is what a reader needs to
 * be true: every status is styled from a token, and statuses that mean different things look
 * different.
 */

const orderStatusValues = Object.values(OrderStatus)
const productStatusValues = Object.values(ProductStatus)

const orderStatusArb = fc.constantFrom(...orderStatusValues)
const productStatusArb = fc.constantFrom(...productStatusValues)

const badgeIn = (container: HTMLElement) => {
    const badge = container.querySelector<HTMLElement>('[data-testid="status-badge"]')
    expect(badge).not.toBeNull()
    return badge!
}

/** The background utility a badge resolved to, which is its whole visual identity. */
const backgroundOf = (status: string) => {
    const {container, unmount} = render(<OrderStatusDisplay status={status}/>)
    const className = badgeIn(container).className
    unmount()
    return className.match(/bg-\(--[\w-]+\)/)?.[0]
}

describe('Status display renders correct badge — Property Tests', () => {
    afterEach(() => {
        cleanup()
    })

    it('OrderStatusDisplay labels every status from the Options map and styles it from a token', () => {
        fc.assert(
            fc.property(orderStatusArb, (status) => {
                const {unmount, container} = render(<OrderStatusDisplay status={status}/>)
                const badge = badgeIn(container)
                const option = OrderStatusOptions[status]

                expect(badge.textContent).toBe(option.label)
                // Every colour utility is a token reference. A literal palette class here
                // would be a theme-layer bypass — invisible to a preset, wrong in dark mode.
                expect(badge.className).toMatch(/bg-\(--c-[\w-]+\)/)
                expect(badge.className).toMatch(/text-\(--c-[\w-]+\)/)
                expect(badge.className).toMatch(/border-\(--c-[\w-]+\)/)

                unmount()
            }),
            {numRuns: 100},
        )
    })

    it('ProductStatusDisplay labels every status from the Options map and styles it from a token', () => {
        fc.assert(
            fc.property(productStatusArb, (status) => {
                const {unmount, container} = render(<ProductStatusDisplay status={status}/>)
                const badge = badgeIn(container)

                expect(badge.textContent).toBe(ProductStatusOptions[status].label)
                expect(badge.className).toMatch(/bg-\(--c-[\w-]+\)/)
                expect(badge.className).toMatch(/text-\(--c-[\w-]+\)/)

                unmount()
            }),
            {numRuns: 100},
        )
    })

    it('a status still in progress does not wear the same colour as one already finished', () => {
        // The distinction the shopper-facing outcome turns on: goods on a van and goods in
        // the customer's hands are different answers, and staff read the colour before the
        // word. Same for an order that ended badly.
        const inProgress = backgroundOf(OrderStatus.IN_TRANSIT)
        const finished = backgroundOf(OrderStatus.DELIVERED)
        const failed = backgroundOf(OrderStatus.ADMIN_CANCELED)
        const notStarted = backgroundOf(OrderStatus.CREATED)

        expect(new Set([inProgress, finished, failed, notStarted]).size).toBe(4)
    })

    it('a qualifier is rendered beside the badge, never folded into its label', () => {
        // SYSTEM_CANCELED carries two facts. Only the status belongs in the pill; the
        // payment note is context, and reads as quiet secondary text.
        const {container} = render(<OrderStatusDisplay status={OrderStatus.SYSTEM_CANCELED}/>)

        expect(badgeIn(container).textContent).toBe('Cancelled')
        expect(container.textContent).toContain('Not paid')
    })
})
