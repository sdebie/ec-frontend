import { useCallback, useState } from 'react'

import { OrderStatus } from '@/shared/types/enums/OrderStatus'
import { CONFIRMED_ACTIONS, defaultRestockForStatus } from '../utils/confirmedActions'
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
  restockItems?: boolean
}

/**
 * Owns the confirm-before-acting state shared by the order list and the order detail
 * page: which action is pending, and — for a refund — whether its items return to stock.
 *
 * One implementation because both pages must send an identical payload. When the two
 * pages held their own copies they had already drifted (one snapshotted the order's
 * status, the other read it live), and only one of them was tested.
 *
 * The restock default is re-derived on every open, so it follows the order being acted
 * on rather than whatever the previous refund left behind.
 */
export function useOrderStatusConfirmation() {
  const [state, setState] = useState<OrderStatusConfirmationState>({
    open: false,
    type: 'cancel',
    orderId: '',
    fromStatus: OrderStatus.CREATED,
  })
  const [restockItems, setRestockItems] = useState(false)

  const ask = useCallback((type: ConfirmedAction, orderId: string, fromStatus: OrderStatus) => {
    setRestockItems(defaultRestockForStatus(fromStatus))
    setState({ open: true, type, orderId, fromStatus })
  }, [])

  // Only flips `open`, keeping the rest: the dialog still needs its title and copy
  // while it animates out.
  const close = useCallback(() => setState((prev) => ({ ...prev, open: false })), [])

  /**
   * The mutation payload for the pending action. `restockItems` is attached only to a
   * refund — the server rejects it on any other transition rather than ignoring it.
   */
  const buildPayload = useCallback((): UpdateOrderStatusPayload => {
    const isRefund = state.type === 'refund'
    return {
      orderId: state.orderId,
      status: CONFIRMED_ACTIONS[state.type].status,
      ...(isRefund ? { restockItems } : {}),
    }
  }, [state.type, state.orderId, restockItems])

  return { state, restockItems, setRestockItems, ask, close, buildPayload }
}
