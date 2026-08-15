import { ConfirmationDialog } from '@/shared/ui/components'
import { CONFIRMED_ACTIONS } from '../utils/confirmedActions'
import type { OrderStatusConfirmationState } from '../hooks/useOrderStatusConfirmation'

export interface OrderStatusConfirmationDialogProps {
  state: OrderStatusConfirmationState
  onConfirm: () => void
  onClose: () => void
  isLoading: boolean
}

/**
 * The confirm-before-acting prompt for a staff status change, shared by the order list
 * and the order detail page so both ask identically.
 *
 * It asks nothing beyond "are you sure": what happens to an order's stock follows from
 * the status it is moving to, so there is no decision here for a staff member to get
 * wrong. Cancelling always returns the goods; a refund never touches them.
 */
export function OrderStatusConfirmationDialog({
  state,
  onConfirm,
  onClose,
  isLoading,
}: OrderStatusConfirmationDialogProps) {
  const action = CONFIRMED_ACTIONS[state.type]

  return (
    <ConfirmationDialog
      open={state.open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={action.title}
      description={action.description}
      variant={action.variant}
      confirmLabel={action.confirmLabel}
      isLoading={isLoading}
    />
  )
}
