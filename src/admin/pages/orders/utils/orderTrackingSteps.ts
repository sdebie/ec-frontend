import {OrderStatus} from '@/shared/types/enums/OrderStatus'
import type {OrderStatusHistoryEntry} from '../types'

export type TrackingStepState = 'complete' | 'current' | 'pending' | 'stopped'

export interface TrackingStep {
    id: string
    label: string
    state: TrackingStepState
    /** ISO timestamp this step was reached. Present only for 'complete'/'stopped'. */
    timestamp?: string
}

interface Slot {
    id: string
    label: string
    statuses: OrderStatus[]
}

/**
 * The order lifecycle forks after PROCESSING into a courier path and an
 * in-store-collection path (OrderStatusEn.java), and each fork has one status
 * READY_TO_SHIP that the other has no equivalent for. A 5-slot glanceable
 * tracker folds that into "Preparing" rather than giving it a 6th slot — the
 * exact intermediate statuses are still visible in the status history list
 * below this tracker.
 */
const DELIVERY_SLOTS: Slot[] = [
    {id: 'placed', label: 'Placed', statuses: [OrderStatus.CREATED, OrderStatus.PENDING_PAYMENT, OrderStatus.PAYMENT_FAILED]},
    {id: 'paid', label: 'Paid', statuses: [OrderStatus.PAID]},
    {id: 'preparing', label: 'Preparing', statuses: [OrderStatus.PROCESSING, OrderStatus.READY_TO_SHIP]},
    {id: 'shipped', label: 'Shipped', statuses: [OrderStatus.IN_TRANSIT]},
    {id: 'delivered', label: 'Delivered', statuses: [OrderStatus.DELIVERED]},
]

const COLLECTION_SLOTS: Slot[] = [
    {id: 'placed', label: 'Placed', statuses: [OrderStatus.CREATED, OrderStatus.IN_STORE_PAYMENT]},
    {id: 'paid', label: 'Paid', statuses: [OrderStatus.PAID]},
    {id: 'preparing', label: 'Preparing', statuses: [OrderStatus.PROCESSING]},
    {id: 'ready', label: 'Ready for Collection', statuses: [OrderStatus.READY_FOR_COLLECTION]},
    {id: 'collected', label: 'Collected', statuses: [OrderStatus.COLLECTED]},
]

/** Reachable only via PENDING_PAYMENT (OrderStatusEn.systemTransitions) — a delivery-only signal. */
const COLLECTION_SIGNAL: ReadonlySet<OrderStatus> = new Set([
    OrderStatus.IN_STORE_PAYMENT,
    OrderStatus.READY_FOR_COLLECTION,
    OrderStatus.COLLECTED,
])

/**
 * Whether a status can still become PAID (or already has). PENDING is the
 * entity's field default rather than a real state — no transition reaches it
 * — and is treated the same as CREATED. Every other status here is a genuine
 * off-ramp: cancelled, failed, delivery-failed, returned, or refunded. Exhaustive
 * by constant so a new backend status fails to compile here until categorised,
 * mirroring OrderStatusEn's own exhaustive-switch discipline.
 */
function isForwardStatus(status: OrderStatus): boolean {
    switch (status) {
        case OrderStatus.CREATED:
        case OrderStatus.PENDING_PAYMENT:
        case OrderStatus.IN_STORE_PAYMENT:
        case OrderStatus.PAYMENT_FAILED:
        case OrderStatus.PAID:
        case OrderStatus.PROCESSING:
        case OrderStatus.READY_TO_SHIP:
        case OrderStatus.READY_FOR_COLLECTION:
        case OrderStatus.IN_TRANSIT:
        case OrderStatus.DELIVERED:
        case OrderStatus.COLLECTED:
        case OrderStatus.PENDING:
            return true
        case OrderStatus.USER_CANCELED:
        case OrderStatus.ADMIN_CANCELED:
        case OrderStatus.SYSTEM_CANCELED:
        case OrderStatus.FAILED:
        case OrderStatus.DELIVERY_FAILED:
        case OrderStatus.RETURNED_TO_ORIGIN:
        case OrderStatus.PARTIALLY_REFUNDED:
        case OrderStatus.REFUNDED:
        case OrderStatus.CANCELLED:
            return false
        default: {
            const exhaustive: never = status
            return exhaustive
        }
    }
}

function buildVisited(history: OrderStatusHistoryEntry[], currentStatus: OrderStatus): Map<OrderStatus, string> {
    const visited = new Map<OrderStatus, string>()
    for (const entry of history) {
        if (!visited.has(entry.status)) {
            visited.set(entry.status, entry.timestamp)
        }
    }
    if (!visited.has(currentStatus)) {
        visited.set(currentStatus, history[0]?.timestamp ?? '')
    }
    return visited
}

function earliestTimestamp(visited: Map<OrderStatus, string>, statuses: OrderStatus[]): string | undefined {
    let best: string | undefined
    for (const status of statuses) {
        const timestamp = visited.get(status)
        if (!timestamp) continue
        if (!best || new Date(timestamp).getTime() < new Date(best).getTime()) {
            best = timestamp
        }
    }
    return best
}

function buildStep(slot: Slot, state: TrackingStepState, visited: Map<OrderStatus, string>): TrackingStep {
    const timestamp = state === 'complete' || state === 'stopped'
        ? earliestTimestamp(visited, slot.statuses)
        : undefined
    return {id: slot.id, label: slot.label, state, timestamp}
}

/**
 * Maps an order's current status + history onto a fixed 5-slot progress tracker.
 *
 * Two real fulfilment paths exist (courier delivery vs in-store collection,
 * chosen at checkout — IN_STORE_PAYMENT/READY_FOR_COLLECTION/COLLECTED never
 * occur on a delivery order and vice versa) and are detected from whichever
 * path-specific status appears in history, defaulting to delivery labels when
 * the order hasn't reached a fork-revealing status yet.
 *
 * A cancelled/failed/refunded order is not "further along" the happy path —
 * forcing it into one of the 5 slots as if still progressing would misrepresent
 * it. Instead its progress freezes at the last slot it has real evidence of
 * having reached ('stopped'), and every slot after that is 'pending' — because
 * for an ended order, nothing after the freeze point is coming. A refund
 * recorded after DELIVERED/COLLECTED does not freeze anything: it is bookkeeping
 * on a fulfilment that already completed (OrderStatusEn.stockEffect docs this
 * same distinction), so that case resolves to all 5 slots complete.
 */
export function getOrderTrackingSteps(order: { status: OrderStatus; statusHistory: OrderStatusHistoryEntry[] }): TrackingStep[] {
    const visited = buildVisited(order.statusHistory, order.status)
    const collection = [...COLLECTION_SIGNAL].some((status) => visited.has(status))
    const slots = collection ? COLLECTION_SLOTS : DELIVERY_SLOTS

    if (isForwardStatus(order.status)) {
        const effectiveStatus = order.status === OrderStatus.PENDING ? OrderStatus.CREATED : order.status
        const foundIndex = slots.findIndex((slot) => slot.statuses.includes(effectiveStatus))
        const currentIndex = foundIndex === -1 ? 0 : foundIndex
        const isFinal = currentIndex === slots.length - 1

        return slots.map((slot, i) => {
            const state: TrackingStepState = i < currentIndex ? 'complete' : i === currentIndex ? (isFinal ? 'complete' : 'current') : 'pending'
            return buildStep(slot, state, visited)
        })
    }

    let reached = -1
    slots.forEach((slot, i) => {
        if (slot.statuses.some((status) => visited.has(status))) reached = i
    })
    const freeze = Math.max(reached, 0)
    const isFinal = freeze === slots.length - 1

    return slots.map((slot, i) => {
        const state: TrackingStepState = i < freeze ? 'complete' : i === freeze ? (isFinal ? 'complete' : 'stopped') : 'pending'
        return buildStep(slot, state, visited)
    })
}
