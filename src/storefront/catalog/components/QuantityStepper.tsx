import { Minus, Plus } from 'lucide-react'
import type { ReactNode } from 'react'

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
   * `segmented` — one full-width bordered control divided into −/count/+ cells,
   * matching the width of the button beneath it. Used on the product card.
   */
  appearance?: 'plain' | 'segmented'
}

// --- segmented geometry -------------------------------------------------
// Declared once and shared by the real control and its placeholder below, so
// the two cannot drift apart — the placeholder exists purely to reserve this
// control's height on cards that have no stepper, and a hand-copied mirror
// would silently desynchronise the moment this padding changed.
const SEGMENT_BOX =
  'flex w-full items-stretch divide-x divide-(--sf-border) overflow-hidden rounded-lg border border-(--sf-border)'
const SEGMENT_SIDE = 'flex items-center justify-center px-3 py-1.5 text-(--sf-muted-text)'
const SEGMENT_COUNT = 'flex flex-1 items-center justify-center px-3 py-1.5 text-sm font-medium'

/** One −/+ cell. Shared by both appearances so the behaviour is written once. */
function StepButton({
  onClick,
  disabled,
  label,
  className,
  children,
}: {
  onClick: () => void
  disabled: boolean
  label: string
  className: string
  children: ReactNode
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} className={className}>
      {children}
    </button>
  )
}

const PLAIN_BUTTON =
  'p-1 rounded border border-(--sf-border) text-(--sf-muted-text) hover:bg-(--sf-surface-muted) disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
const SEGMENT_BUTTON = `${SEGMENT_SIDE} transition-colors hover:bg-(--sf-surface-muted) disabled:opacity-40 disabled:cursor-not-allowed`

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
  max,
  appearance = 'plain',
}: QuantityStepperProps) {
  const atMax = max !== undefined && quantity >= max
  const isSegmented = appearance === 'segmented'

  const decrement = (
    <StepButton
      onClick={onDecrement}
      disabled={quantity <= 1}
      label="Decrease quantity"
      className={isSegmented ? SEGMENT_BUTTON : PLAIN_BUTTON}
    >
      <Minus className="h-4 w-4" />
    </StepButton>
  )

  const increment = (
    <StepButton
      onClick={onIncrement}
      disabled={atMax}
      label="Increase quantity"
      className={isSegmented ? SEGMENT_BUTTON : PLAIN_BUTTON}
    >
      <Plus className="h-4 w-4" />
    </StepButton>
  )

  if (isSegmented) {
    return (
      <div className={SEGMENT_BOX}>
        {decrement}
        <span className={SEGMENT_COUNT}>{quantity}</span>
        {increment}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {decrement}
      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
      {increment}
    </div>
  )
}

/**
 * An invisible stand-in occupying exactly the segmented stepper's height, for
 * cards whose action is a single control ("Select options", "Out of stock",
 * "View product"). Without it a deck's height follows whichever products happen
 * to be simple, and sections that should align diverge.
 *
 * Built from this module's own geometry constants and plain `<span>`s:
 * `visibility: hidden` keeps the box in layout while removing it from paint,
 * the accessibility tree and the tab order.
 */
export function QuantityStepperPlaceholder() {
  return (
    <div aria-hidden="true" className={`${SEGMENT_BOX} invisible`}>
      <span className={SEGMENT_SIDE}>
        <Minus className="h-4 w-4" />
      </span>
      <span className={SEGMENT_COUNT}>1</span>
      <span className={SEGMENT_SIDE}>
        <Plus className="h-4 w-4" />
      </span>
    </div>
  )
}
