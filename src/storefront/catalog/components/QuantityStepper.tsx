import { Minus, Plus } from 'lucide-react'

export interface QuantityStepperProps {
  quantity: number
  onIncrement: () => void
  onDecrement: () => void
}

export function QuantityStepper({ quantity, onIncrement, onDecrement }: QuantityStepperProps) {
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
        aria-label="Increase quantity"
        className="p-1 rounded border border-(--sf-border) text-(--sf-muted-text) hover:bg-(--sf-surface-muted) transition-colors"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}
