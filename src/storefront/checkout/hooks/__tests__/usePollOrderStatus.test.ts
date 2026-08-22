import {beforeEach, describe, expect, it, vi} from 'vitest'
import {renderHook, waitFor} from '@testing-library/react'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {createElement} from 'react'

const mockRequest = vi.fn()

vi.mock('@/shared/api/graphql/graphqlClient', () => ({
    graphqlClient: {
        request: (...args: unknown[]) => mockRequest(...args),
    },
}))

import {isCancelledStatus, usePollOrderStatus} from '../usePollOrderStatus'

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {queries: {retry: false}},
    })
    return ({children}: { children: React.ReactNode }) =>
        createElement(QueryClientProvider, {client: queryClient}, children)
}

function orderStatusResult(status: string) {
    return {orderStatus: {id: 'order-1', status, totalAmount: 100, createdAt: '2024-01-01'}}
}

describe('usePollOrderStatus — terminal detection', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    /**
     * PAYMENT_FAILED is reachable within seconds of a real checkout attempt (the
     * PayFast ITN handler sets it on a declined card) but is architecturally NOT a
     * backend dead end — a retry or the abandoned-order sweep can both move it on
     * automatically. Neither happens inside this poll's lifetime, so from here it
     * must still count as a reason to stop asking.
     */
    it.each([
        'PAID', 'IN_STORE_PAYMENT', 'USER_CANCELED', 'ADMIN_CANCELED',
        'SYSTEM_CANCELED', 'FAILED', 'REFUNDED', 'PAYMENT_FAILED',
    ])('marks %s terminal so the poll stops', async (status) => {
        mockRequest.mockResolvedValue(orderStatusResult(status))

        const {result} = renderHook(() => usePollOrderStatus('order-1', 'token-1'), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isTerminal).toBe(true))
    })

    it.each(['CREATED', 'PENDING_PAYMENT', 'PROCESSING'])(
        'leaves %s non-terminal so the poll keeps running',
        async (status) => {
            mockRequest.mockResolvedValue(orderStatusResult(status))

            const {result} = renderHook(() => usePollOrderStatus('order-1', 'token-1'), {
                wrapper: createWrapper(),
            })

            await waitFor(() => expect(mockRequest).toHaveBeenCalled())
            expect(result.current.isTerminal).toBe(false)
        }
    )
})

describe('isCancelledStatus', () => {
    it.each(['USER_CANCELED', 'ADMIN_CANCELED', 'SYSTEM_CANCELED', 'FAILED'])(
        'treats %s as cancelled',
        (status) => {
            expect(isCancelledStatus(status)).toBe(true)
        }
    )

    // PAYMENT_FAILED is deliberately NOT cancelled-shaped: the backend's own
    // customerNotification() bucket calls it ACTION_REQUIRED, not ENDED, and the
    // account order-history badge groups it apart from the cancelled family.
    it.each(['PAID', 'IN_STORE_PAYMENT', 'PAYMENT_FAILED', 'REFUNDED', undefined])(
        'does not treat %s as cancelled',
        (status) => {
            expect(isCancelledStatus(status)).toBe(false)
        }
    )
})
