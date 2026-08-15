import { Checkbox } from '@/shared/ui/components'
import { OrderStatus } from '@/shared/types/enums/OrderStatus'

export interface RefundRestockChoiceProps {
  /** The status being refunded from — shapes the wording, not the answer. */
  fromStatus: OrderStatus
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

/**
 * The stock half of a refund. A refund can legitimately end either way — the goods
 * are back on the shelf, or they are with the customer — and the server refuses to
 * guess, so this is the answer it needs.
 *
 * The hint below the checkbox names the risk that applies to the pre-selected
 * default, so the staff member is prompted to correct it in exactly the case where
 * the status is misleading: an order dispatched but never moved past Paid.
 */
export function RefundRestockChoice({
  fromStatus,
  checked,
  onChange,
  disabled,
}: RefundRestockChoiceProps) {
  const dispatched = fromStatus === OrderStatus.DELIVERED

  return (
    <div className="flex flex-col gap-1.5" data-testid="refund-restock-choice">
      <Checkbox
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        label="Return these items to stock"
      />
      <p className="text-xs text-(--c-text-muted) leading-relaxed">
        {dispatched
          ? 'This order was delivered, so its items are not counted as returned. Tick only if the goods are physically back.'
          : 'This order has not been marked as shipped, so its items are counted as returned. Untick if the goods have already left.'}
      </p>
    </div>
  )
}
