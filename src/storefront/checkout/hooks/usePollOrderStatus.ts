import {useCallback, useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {graphqlClient} from '@/shared/api/graphql/graphqlClient'
import type {OrderStatusResponse} from '../types'

const ORDER_BY_SESSION_ID_QUERY = `
  query OrderBySessionId($sessionId: String!) {
    orderBySessionId(sessionId: $sessionId) {
      id
      status
      totalAmount
      createdAt
    }
  }
`

const POLL_INTERVAL = 3000
const TIMEOUT_MS = 120_000

export function usePollOrderStatus(sessionId: string | null) {
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
        queryKey: ['checkout', 'order-status', sessionId],
        queryFn: async () => {
            const data = await graphqlClient.request<{ orderBySessionId: OrderStatusResponse }>(
                ORDER_BY_SESSION_ID_QUERY,
                {sessionId}
            )
            const result = data.orderBySessionId
            const status = result?.status
            if (status === 'PAID' || status === 'IN_STORE_PAYMENT') {
                setIsTerminal(true)
            } else {
                checkTimeout()
            }
            return result
        },
        enabled: !!sessionId && !isTerminal && !isTimedOut,
        refetchInterval: POLL_INTERVAL,
    })

    return {...query, isTerminal, isTimedOut}
}
