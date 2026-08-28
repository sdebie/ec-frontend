import {useCallback, useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {gql} from 'graphql-request'
import {graphqlClient} from '@/shared/api/graphql/graphqlClient'
import type {OrderStatusResponse} from '../types'

/**
 * S2′ (guest-order-authorization) — keyed on the order id and authorized by the
 * same X-Order-Token every other order-scoped request carries.
 *
 * Must stay a TAGGED gql template (Requirement 4.6): schemaContract.test.ts's
 * extraction is a naive text scan for the tagged form, so a plain backtick
 * literal here would go unchecked against the backend schema and let a bad
 * field sit undetected.
 *
 * (Not written as gql-backtick-ellipsis-backtick in THIS comment on purpose —
 * the contract test's extraction regex has no notion of comments and matches
 * that exact shape wherever it appears in the file.)
 */
const ORDER_STATUS_QUERY = gql`
  query OrderStatus($orderId: String!) {
    orderStatus(orderId: $orderId) {
      id
      status
      totalAmount
      createdAt
    }
  }
`

const POLL_INTERVAL = 3000
const TIMEOUT_MS = 120_000

/**
 * Statuses that stop the poll. Not all are permanent on the backend —
 * PAYMENT_FAILED can still move on its own (a retried payment, or the
 * abandoned-order sweep after its default 30-minute hold) — but neither happens
 * inside this poll's 120s window, so there is nothing left here worth waiting for.
 */
const TERMINAL_STATUSES = new Set([
    'PAID',
    'IN_STORE_PAYMENT',
    'USER_CANCELED',
    'ADMIN_CANCELED',
    'SYSTEM_CANCELED',
    'PAYMENT_FAILED',
    'FAILED',
    'REFUNDED',
])

/** Statuses among {@link TERMINAL_STATUSES} that mean the order did not go through. */
const CANCELLED_STATUSES = new Set(['USER_CANCELED', 'ADMIN_CANCELED', 'SYSTEM_CANCELED', 'FAILED'])

export function isCancelledStatus(status: string | undefined): boolean {
    return !!status && CANCELLED_STATUSES.has(status)
}

export function usePollOrderStatus(orderId: string | null, token: string | null) {
    const [isTerminal, setIsTerminal] = useState(false)
    const [isTimedOut, setIsTimedOut] = useState(false)
    const [startTime] = useState(() => Date.now())

    const checkTimeout = useCallback(() => {
        if (Date.now() - startTime > TIMEOUT_MS) {
            setIsTimedOut(true)
            return true
        }
        return false
    }, [startTime])

    const query = useQuery({
        queryKey: ['checkout', 'order-status', orderId],
        queryFn: async () => {
            // Requirement 9.3: checked on the error path too, not only on success — a
            // query that errors on every poll must still hit this timeout check, or a
            // guest who paid in store would sit on "Confirming your payment…" forever.
            try {
                const data = await graphqlClient.request<{ orderStatus: OrderStatusResponse }>(
                    ORDER_STATUS_QUERY,
                    {orderId},
                    token ? {'X-Order-Token': token} : undefined,
                )
                const result = data.orderStatus
                if (TERMINAL_STATUSES.has(result?.status ?? '')) {
                    setIsTerminal(true)
                } else {
                    checkTimeout()
                }
                return result
            } catch (err) {
                checkTimeout()
                throw err
            }
        },
        enabled: !!orderId && !!token && !isTerminal && !isTimedOut,
        refetchInterval: POLL_INTERVAL,
    })

    return {...query, isTerminal, isTimedOut}
}
