import { Minus, Plus } from 'lucide-react'

export interface QuantityStepperProps {
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
  /**
   * Upper bound for the quantity — increment is disabled once reached. Omit
   * (the default) for an unbounded stepper, which is what the catalogue uses:
   * stock there is a display hint, not a limit.
   */
  max?: number
  /**
   * `plain` (default) — two separately bordered buttons with the count loose
   * between them. This is the cart's long-standing treatment; it stays the
   * default so the cart is untouched.
   *
   * `segmented` — one bordered control divided into −/count/+ cells, which reads
   * as a single input rather than three loose parts. Used on the product card.
   */
  appearance?: 'plain' | 'segmented'
}

/** Shared by the segmented cells so the divider lands on equal-height boxes. */
const SEGMENT_BUTTON =
  'px-3 py-1.5 text-(--sf-muted-text) transition-colors hover:bg-(--sf-surface-muted) disabled:opacity-40 disabled:cursor-not-allowed'

export function QuantityStepper({ quantity, onIncrement, onDecrement, max, appearance = 'plain' }: QuantityStepperProps) {
  const atMax = max !== undefined && quantity >= max

  if (appearance === 'segmented') {
    return (
      <div className="inline-flex items-stretch divide-x divide-(--sf-border) overflow-hidden rounded-lg border border-(--sf-border)">
        <button
          type="button"
          onClick={onDecrement}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className={SEGMENT_BUTTON}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="flex min-w-10 items-center justify-center px-3 py-1.5 text-sm font-medium">
          {quantity}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={atMax}
          aria-label="Increase quantity"
          className={SEGMENT_BUTTON}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity <= 1}
        aria-label="Decrease quantity"
        className="p-1 rounded border border-(--sf-border) text-(--sf-muted-text) hover:bg-(--sf-surface-muted) disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={atMax}
        aria-label="Increase quantity"
        className="p-1 rounded border border-(--sf-border) text-(--sf-muted-text) hover:bg-(--sf-surface-muted) disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
