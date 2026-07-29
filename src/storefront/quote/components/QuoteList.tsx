import { ImageIcon, Minus, Plus, Trash2 } from 'lucide-react'
import { useQuoteStore } from '../quoteStore'

/**
 * QuoteList — renders the current quote list items with quantity controls and remove.
 * Reads from quoteStore and uses updateQty (min 1) + remove.
 */
export function QuoteList() {
  const items = useQuoteStore((s) => s.items)
  const updateQty = useQuoteStore((s) => s.updateQty)
  const remove = useQuoteStore((s) => s.remove)

  if (items.length === 0) return null

  return (
    <ul className="divide-y divide-(--sf-border)" role="list">
      {items.map((item) => (
        <li
          key={item.variantId}
          className="flex items-center justify-between gap-4 py-3"
        >
          {/* Thumbnail */}
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-(--sf-surface-muted)">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-(--sf-muted-text)">
                <ImageIcon className="h-4 w-4" aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-(--sf-text)">
              {item.productName}
            </p>
            {item.variantLabel !== item.productName && (
              <p className="truncate text-xs text-(--sf-muted-text)">
                {item.variantLabel}
              </p>
            )}
          </div>

          {/* Quantity control */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => updateQty(item.variantId, item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label={`Decrease quantity of ${item.productName}`}
              className="flex h-7 w-7 items-center justify-center rounded border border-(--sf-border) text-(--sf-text) hover:bg-(--sf-panel) disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                if (!isNaN(val) && val >= 1) {
                  updateQty(item.variantId, val)
                }
              }}
              aria-label={`Quantity of ${item.productName}`}
              className="h-7 w-12 rounded border border-(--sf-border) bg-transparent text-center text-sm text-(--sf-text) focus:border-(--sf-ring) focus:outline-none focus:ring-1 focus:ring-(--sf-ring) [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />

            <button
              type="button"
              onClick={() => updateQty(item.variantId, item.quantity + 1)}
              aria-label={`Increase quantity of ${item.productName}`}
              className="flex h-7 w-7 items-center justify-center rounded border border-(--sf-border) text-(--sf-text) hover:bg-(--sf-panel)"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={() => remove(item.variantId)}
            aria-label={`Remove ${item.productName} from quote`}
            className="flex h-7 w-7 items-center justify-center rounded text-(--sf-muted-text) hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  )
}
