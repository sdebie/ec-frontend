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
}

export function QuantityStepper({ quantity, onIncrement, onDecrement, max }: QuantityStepperProps) {
  const atMax = max !== undefined && quantity >= max

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
