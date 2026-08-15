import { ConfirmationDialog } from '@/shared/ui/components'
import { CONFIRMED_ACTIONS } from '../utils/confirmedActions'
import type { OrderStatusConfirmationState } from '../hooks/useOrderStatusConfirmation'
import { RefundRestockChoice } from './RefundRestockChoice'

export interface OrderStatusConfirmationDialogProps {
  state: OrderStatusConfirmationState
  restockItems: boolean
  onRestockChange: (checked: boolean) => void
  onConfirm: () => void
  onClose: () => void
  isLoading: boolean
}

/**
 * The confirm-before-acting prompt for a staff status change, shared by the order list
 * and the order detail page so both ask identically. Only a refund carries the restock
 * question, because it is the only transition where either stock outcome is legitimate.
 */
export function OrderStatusConfirmationDialog({
  state,
  restockItems,
  onRestockChange,
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
    >
      {state.type === 'refund' && (
        <RefundRestockChoice
          fromStatus={state.fromStatus}
          checked={restockItems}
          onChange={onRestockChange}
          disabled={isLoading}
        />
      )}
    </ConfirmationDialog>
  )
}
