import { useCallback, useState } from 'react'

import { OrderStatus } from '@/shared/types/enums/OrderStatus'
import { CONFIRMED_ACTIONS } from '../utils/confirmedActions'
import type { ConfirmedAction } from '../utils/confirmedActions'

export interface OrderStatusConfirmationState {
  open: boolean
  type: ConfirmedAction
  orderId: string
  /**
   * The order's status when the prompt was opened, not its status now. Snapshotting
   * keeps the dialog describing the action the staff member actually initiated even
   * if a background refetch lands while it is open.
   */
  fromStatus: OrderStatus
}

export interface UpdateOrderStatusPayload {
  orderId: string
  status: OrderStatus
}

/**
 * Owns the confirm-before-acting state shared by the order list and the order detail
 * page: which action is pending, and on which order.
 *
 * One implementation because both pages must send an identical payload. When the two
 * pages held their own copies they had already drifted (one snapshotted the order's
 * status, the other read it live), and only one of them was tested.
 *
 * The payload carries no stock instruction. What happens to an order's goods follows
 * from the status it is moving to, so there is nothing here for a staff member to get
 * wrong: cancelling always returns the stock, and a refund never touches it.
 */
export function useOrderStatusConfirmation() {
  const [state, setState] = useState<OrderStatusConfirmationState>({
    open: false,
    type: 'cancel-staff',
    orderId: '',
    fromStatus: OrderStatus.CREATED,
  })

  const ask = useCallback((type: ConfirmedAction, orderId: string, fromStatus: OrderStatus) => {
    setState({ open: true, type, orderId, fromStatus })
  }, [])

  // Only flips `open`, keeping the rest: the dialog still needs its title and copy
  // while it animates out.
  const close = useCallback(() => setState((prev) => ({ ...prev, open: false })), [])

  const buildPayload = useCallback(
    (): UpdateOrderStatusPayload => ({
      orderId: state.orderId,
      status: CONFIRMED_ACTIONS[state.type].status,
    }),
    [state.type, state.orderId],
  )

  return { state, ask, close, buildPayload }
}
