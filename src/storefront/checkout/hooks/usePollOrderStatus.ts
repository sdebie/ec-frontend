import {useCallback, useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {gql} from 'graphql-request'
import {graphqlClient} from '@/shared/api/graphql/graphqlClient'
import type {OrderStatusResponse} from '../types'

/**
 * S2′ (guest-order-authorization) — replaces orderBySessionId, keyed on the order id
 * and authorized by the same X-Order-Token every other order-scoped request carries.
 * Written as a tagged gql template deliberately (Requirement 4.6): the query it
 * replaces was an untagged backtick literal, which is the entire reason
 * schemaContract.test.ts never caught it selecting a field the backend schema does
 * not have — a poll that had never once succeeded against the real backend.
 * (Not written as gql-backtick-ellipsis-backtick in this comment on purpose — the
 * contract test's own extraction regex is a naive text scan with no notion of
 * comments, and matches that exact shape wherever it appears in the file.)
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

/** Statuses that stop the poll — a definite outcome, good or bad. */
const TERMINAL_STATUSES = new Set([
    'PAID',
    'IN_STORE_PAYMENT',
    'USER_CANCELED',
    'ADMIN_CANCELED',
    'SYSTEM_CANCELED',
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
            // Requirement 9.3: checked on the error path too, not only on success — the
            // untagged query below used to select a field the backend rejects, so every
            // poll errored and the timeout this guards was unreachable, leaving a guest
            // who paid in store on "Confirming your payment…" forever.
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
