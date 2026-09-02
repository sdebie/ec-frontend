import {describe, it, expect} from 'vitest'
import {OrderStatus} from '@/shared/types/enums/OrderStatus'
import {getOrderTrackingSteps} from '../orderTrackingSteps'
import type {OrderStatusHistoryEntry} from '../../types'

function entry(status: OrderStatus, timestamp: string): OrderStatusHistoryEntry {
    return {status, timestamp}
}

const LABELS = ['Placed', 'Paid', 'Preparing', 'Shipped', 'Delivered']
const COLLECTION_LABELS = ['Placed', 'Paid', 'Preparing', 'Ready for Collection', 'Collected']

describe('getOrderTrackingSteps', () => {
    describe('delivery path progression', () => {
        it('CREATED only: placed is current, everything after is pending', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.CREATED,
                statusHistory: [entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z')],
            })

            expect(steps.map((s) => s.label)).toEqual(LABELS)
            expect(steps.map((s) => s.state)).toEqual(['current', 'pending', 'pending', 'pending', 'pending'])
        })

        it('PENDING_PAYMENT: still slot 0, current', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.PENDING_PAYMENT,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.PENDING_PAYMENT, '2026-01-01T10:01:00Z'),
                ],
            })

            expect(steps[0].state).toBe('current')
            expect(steps.slice(1).every((s) => s.state === 'pending')).toBe(true)
        })

        it('PAYMENT_FAILED: still slot 0, current — recoverable, not stopped', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.PAYMENT_FAILED,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.PENDING_PAYMENT, '2026-01-01T10:01:00Z'),
                    entry(OrderStatus.PAYMENT_FAILED, '2026-01-01T10:05:00Z'),
                ],
            })

            expect(steps[0].state).toBe('current')
            expect(steps.slice(1).every((s) => s.state === 'pending')).toBe(true)
        })

        it('PAID: slot 0 complete (dated to CREATED), slot 1 current', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.PAID,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.PENDING_PAYMENT, '2026-01-01T10:01:00Z'),
                    entry(OrderStatus.PAID, '2026-01-01T10:02:00Z'),
                ],
            })

            expect(steps[0].state).toBe('complete')
            expect(steps[0].timestamp).toBe('2026-01-01T10:00:00Z')
            expect(steps[1].state).toBe('current')
            expect(steps.slice(2).every((s) => s.state === 'pending')).toBe(true)
        })

        it('READY_TO_SHIP folds into Preparing, still current (no 6th slot)', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.READY_TO_SHIP,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.PENDING_PAYMENT, '2026-01-01T10:01:00Z'),
                    entry(OrderStatus.PAID, '2026-01-01T10:02:00Z'),
                    entry(OrderStatus.PROCESSING, '2026-01-01T10:03:00Z'),
                    entry(OrderStatus.READY_TO_SHIP, '2026-01-01T10:04:00Z'),
                ],
            })

            expect(steps).toHaveLength(5)
            expect(steps[2].label).toBe('Preparing')
            expect(steps[2].state).toBe('current')
            // Dated to when it first entered "preparing" (PROCESSING), not READY_TO_SHIP.
            expect(steps[2].timestamp).toBeUndefined()
        })

        it('IN_TRANSIT: Shipped is current', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.IN_TRANSIT,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.PENDING_PAYMENT, '2026-01-01T10:01:00Z'),
                    entry(OrderStatus.PAID, '2026-01-01T10:02:00Z'),
                    entry(OrderStatus.PROCESSING, '2026-01-01T10:03:00Z'),
                    entry(OrderStatus.READY_TO_SHIP, '2026-01-01T10:04:00Z'),
                    entry(OrderStatus.IN_TRANSIT, '2026-01-01T10:05:00Z'),
                ],
            })

            expect(steps.map((s) => s.state)).toEqual(['complete', 'complete', 'complete', 'current', 'pending'])
        })

        it('DELIVERED: final slot collapses current into complete', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.DELIVERED,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.PENDING_PAYMENT, '2026-01-01T10:01:00Z'),
                    entry(OrderStatus.PAID, '2026-01-01T10:02:00Z'),
                    entry(OrderStatus.PROCESSING, '2026-01-01T10:03:00Z'),
                    entry(OrderStatus.READY_TO_SHIP, '2026-01-01T10:04:00Z'),
                    entry(OrderStatus.IN_TRANSIT, '2026-01-01T10:05:00Z'),
                    entry(OrderStatus.DELIVERED, '2026-01-01T10:06:00Z'),
                ],
            })

            expect(steps.every((s) => s.state === 'complete')).toBe(true)
            expect(steps[4].timestamp).toBe('2026-01-01T10:06:00Z')
        })
    })

    describe('collection path progression', () => {
        it('uses collection labels once IN_STORE_PAYMENT appears', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.IN_STORE_PAYMENT,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.IN_STORE_PAYMENT, '2026-01-01T10:01:00Z'),
                ],
            })

            expect(steps.map((s) => s.label)).toEqual(COLLECTION_LABELS)
            expect(steps[0].state).toBe('current')
        })

        it('READY_FOR_COLLECTION is its own slot, not folded into Preparing', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.READY_FOR_COLLECTION,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.IN_STORE_PAYMENT, '2026-01-01T10:01:00Z'),
                    entry(OrderStatus.PAID, '2026-01-01T10:02:00Z'),
                    entry(OrderStatus.PROCESSING, '2026-01-01T10:03:00Z'),
                    entry(OrderStatus.READY_FOR_COLLECTION, '2026-01-01T10:04:00Z'),
                ],
            })

            expect(steps.map((s) => s.state)).toEqual(['complete', 'complete', 'complete', 'current', 'pending'])
        })

        it('COLLECTED: all complete', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.COLLECTED,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.IN_STORE_PAYMENT, '2026-01-01T10:01:00Z'),
                    entry(OrderStatus.PAID, '2026-01-01T10:02:00Z'),
                    entry(OrderStatus.PROCESSING, '2026-01-01T10:03:00Z'),
                    entry(OrderStatus.READY_FOR_COLLECTION, '2026-01-01T10:04:00Z'),
                    entry(OrderStatus.COLLECTED, '2026-01-01T10:05:00Z'),
                ],
            })

            expect(steps.every((s) => s.state === 'complete')).toBe(true)
        })
    })

    describe('off-ramps: cancelled, failed, returned', () => {
        it('ADMIN_CANCELED from CREATED with no other history: stopped at slot 0', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.ADMIN_CANCELED,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.ADMIN_CANCELED, '2026-01-01T10:01:00Z'),
                ],
            })

            expect(steps.map((s) => s.state)).toEqual(['stopped', 'pending', 'pending', 'pending', 'pending'])
        })

        it('ADMIN_CANCELED from PROCESSING: complete through Paid, stopped at Preparing', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.ADMIN_CANCELED,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.PENDING_PAYMENT, '2026-01-01T10:01:00Z'),
                    entry(OrderStatus.PAID, '2026-01-01T10:02:00Z'),
                    entry(OrderStatus.PROCESSING, '2026-01-01T10:03:00Z'),
                    entry(OrderStatus.ADMIN_CANCELED, '2026-01-01T10:04:00Z'),
                ],
            })

            expect(steps.map((s) => s.state)).toEqual(['complete', 'complete', 'stopped', 'pending', 'pending'])
            // Never lies about a cancelled order still being "in progress" toward Shipped/Delivered.
            expect(steps[3].state).not.toBe('current')
            expect(steps[4].state).not.toBe('current')
        })

        it('USER_CANCELED never shows a fake current step (no state is "current" on an ended order)', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.USER_CANCELED,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.PENDING_PAYMENT, '2026-01-01T10:01:00Z'),
                    entry(OrderStatus.USER_CANCELED, '2026-01-01T10:02:00Z'),
                ],
            })

            expect(steps.some((s) => s.state === 'current')).toBe(false)
        })

        it('SYSTEM_CANCELED (abandoned-cart sweep) from PENDING_PAYMENT: stopped at slot 0', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.SYSTEM_CANCELED,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.PENDING_PAYMENT, '2026-01-01T10:01:00Z'),
                    entry(OrderStatus.SYSTEM_CANCELED, '2026-06-01T10:00:00Z'),
                ],
            })

            expect(steps[0].state).toBe('stopped')
        })

        it('DELIVERY_FAILED from IN_TRANSIT: stopped at Shipped, Delivered still pending', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.DELIVERY_FAILED,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.PENDING_PAYMENT, '2026-01-01T10:01:00Z'),
                    entry(OrderStatus.PAID, '2026-01-01T10:02:00Z'),
                    entry(OrderStatus.PROCESSING, '2026-01-01T10:03:00Z'),
                    entry(OrderStatus.READY_TO_SHIP, '2026-01-01T10:04:00Z'),
                    entry(OrderStatus.IN_TRANSIT, '2026-01-01T10:05:00Z'),
                    entry(OrderStatus.DELIVERY_FAILED, '2026-01-01T10:06:00Z'),
                ],
            })

            expect(steps.map((s) => s.state)).toEqual(['complete', 'complete', 'complete', 'stopped', 'pending'])
        })

        it('RETURNED_TO_ORIGIN after DELIVERY_FAILED: still frozen at Shipped', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.RETURNED_TO_ORIGIN,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.PENDING_PAYMENT, '2026-01-01T10:01:00Z'),
                    entry(OrderStatus.PAID, '2026-01-01T10:02:00Z'),
                    entry(OrderStatus.PROCESSING, '2026-01-01T10:03:00Z'),
                    entry(OrderStatus.IN_TRANSIT, '2026-01-01T10:05:00Z'),
                    entry(OrderStatus.DELIVERY_FAILED, '2026-01-01T10:06:00Z'),
                    entry(OrderStatus.RETURNED_TO_ORIGIN, '2026-01-01T10:07:00Z'),
                ],
            })

            expect(steps[3].state).toBe('stopped')
            expect(steps[4].state).toBe('pending')
        })
    })

    describe('refunds', () => {
        it('REFUNDED after DELIVERED: all 5 complete — refund is bookkeeping, not a regression', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.REFUNDED,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.PENDING_PAYMENT, '2026-01-01T10:01:00Z'),
                    entry(OrderStatus.PAID, '2026-01-01T10:02:00Z'),
                    entry(OrderStatus.PROCESSING, '2026-01-01T10:03:00Z'),
                    entry(OrderStatus.IN_TRANSIT, '2026-01-01T10:05:00Z'),
                    entry(OrderStatus.DELIVERED, '2026-01-01T10:06:00Z'),
                    entry(OrderStatus.REFUNDED, '2026-01-02T10:00:00Z'),
                ],
            })

            expect(steps.every((s) => s.state === 'complete')).toBe(true)
        })

        it('PARTIALLY_REFUNDED after COLLECTED: all 5 complete, collection labels', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.PARTIALLY_REFUNDED,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.IN_STORE_PAYMENT, '2026-01-01T10:01:00Z'),
                    entry(OrderStatus.PAID, '2026-01-01T10:02:00Z'),
                    entry(OrderStatus.PROCESSING, '2026-01-01T10:03:00Z'),
                    entry(OrderStatus.READY_FOR_COLLECTION, '2026-01-01T10:04:00Z'),
                    entry(OrderStatus.COLLECTED, '2026-01-01T10:05:00Z'),
                    entry(OrderStatus.PARTIALLY_REFUNDED, '2026-01-02T10:00:00Z'),
                ],
            })

            expect(steps.map((s) => s.label)).toEqual(COLLECTION_LABELS)
            expect(steps.every((s) => s.state === 'complete')).toBe(true)
        })

        it('REFUNDED after RETURNED_TO_ORIGIN (delivery never completed): frozen at Shipped, not all-complete', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.REFUNDED,
                statusHistory: [
                    entry(OrderStatus.CREATED, '2026-01-01T10:00:00Z'),
                    entry(OrderStatus.PENDING_PAYMENT, '2026-01-01T10:01:00Z'),
                    entry(OrderStatus.PAID, '2026-01-01T10:02:00Z'),
                    entry(OrderStatus.PROCESSING, '2026-01-01T10:03:00Z'),
                    entry(OrderStatus.IN_TRANSIT, '2026-01-01T10:05:00Z'),
                    entry(OrderStatus.DELIVERY_FAILED, '2026-01-01T10:06:00Z'),
                    entry(OrderStatus.RETURNED_TO_ORIGIN, '2026-01-01T10:07:00Z'),
                    entry(OrderStatus.REFUNDED, '2026-01-02T10:00:00Z'),
                ],
            })

            expect(steps[3].state).toBe('stopped')
            expect(steps[4].state).toBe('pending')
        })
    })

    describe('legacy statuses', () => {
        it('PENDING behaves like CREATED: slot 0 current', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.PENDING,
                statusHistory: [],
            })

            expect(steps[0].state).toBe('current')
        })

        it('CANCELLED with no history: stopped at slot 0, does not throw', () => {
            const steps = getOrderTrackingSteps({
                status: OrderStatus.CANCELLED,
                statusHistory: [],
            })

            expect(steps[0].state).toBe('stopped')
        })
    })

    describe('exhaustiveness', () => {
        it('every OrderStatus value produces exactly 5 steps without throwing', () => {
            for (const status of Object.values(OrderStatus)) {
                const steps = getOrderTrackingSteps({
                    status,
                    statusHistory: [entry(status, '2026-01-01T10:00:00Z')],
                })
                expect(steps).toHaveLength(5)
            }
        })
    })
})
