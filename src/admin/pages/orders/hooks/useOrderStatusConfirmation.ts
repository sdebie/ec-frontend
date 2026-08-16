import {useCallback, useState} from 'react'
import {OrderStatus} from '@/shared/types/enums/OrderStatus'
import type {ConfirmedAction} from '../utils/confirmedActions'
import {CONFIRMED_ACTIONS} from '../utils/confirmedActions'

export interface OrderStatusConfirmationState {
    open: boolean
    type: ConfirmedAction
    orderId: string
    fromStatus: OrderStatus
}

export interface UpdateOrderStatusPayload {
    orderId: string
    status: OrderStatus
}

export function useOrderStatusConfirmation() {
    const [state, setState] = useState<OrderStatusConfirmationState>({
        open: false,
        type: 'cancel-staff',
        orderId: '',
        fromStatus: OrderStatus.CREATED,
    })

    const ask = useCallback((type: ConfirmedAction, orderId: string, fromStatus: OrderStatus) => {
        setState({open: true, type, orderId, fromStatus})
    }, [])

    const close = useCallback(() => setState((prev) => ({...prev, open: false})), [])

    const buildPayload = useCallback(
        (): UpdateOrderStatusPayload => ({
            orderId: state.orderId,
            status: CONFIRMED_ACTIONS[state.type].status,
        }),
        [state.type, state.orderId],
    )

    return {state, ask, close, buildPayload}
}
