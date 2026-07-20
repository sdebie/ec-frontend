import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/shared/utils/cn'
import { type ToastItem, useToastStore } from './toastStore'

// ─── Variant configuration ─────────────────────────────────────────────────────

type VariantConfig = {
  Icon: React.ElementType
  iconClass: string
  accentClass: string
  /** ARIA live value — errors/warnings use assertive so screen readers interrupt */
  ariaLive: 'polite' | 'assertive'
}

const VARIANT_CONFIG: Record<ToastItem['variant'], VariantConfig> = {
  success: {
    Icon: CheckCircle2,
    iconClass: 'text-(--c-success)',
    accentClass: 'bg-(--c-success)',
    ariaLive: 'polite',
  },
  error: {
    Icon: XCircle,
    iconClass: 'text-(--c-error)',
    accentClass: 'bg-(--c-error)',
    ariaLive: 'assertive',
  },
  warning: {
    Icon: AlertTriangle,
    iconClass: 'text-(--c-warning)',
    accentClass: 'bg-(--c-warning)',
    ariaLive: 'assertive',
  },
  info: {
    Icon: Info,
    iconClass: 'text-(--c-info)',
    accentClass: 'bg-(--c-info)',
    ariaLive: 'polite',
  },
}

// ─── Slide-in direction ────────────────────────────────────────────────────────

/** Direction the toast slides in from. Derived from position by ToastContainer. */
export type ToastSlideFrom = 'top' | 'bottom' | 'left' | 'right'

const SLIDE_MAP: Record<ToastSlideFrom, { hidden: string; visible: string }> = {
  top: { hidden: '-translate-y-2 opacity-0', visible: 'translate-y-0 opacity-100' },
  bottom: { hidden: 'translate-y-2 opacity-0', visible: 'translate-y-0 opacity-100' },
  left: { hidden: '-translate-x-4 opacity-0', visible: 'translate-x-0 opacity-100' },
  right: { hidden: 'translate-x-4 opacity-0', visible: 'translate-x-0 opacity-100' },
}

// ─── Toast item component ──────────────────────────────────────────────────────

type ToastProps = ToastItem & {
  /** Controls enter/exit animation direction. Provided by ToastContainer. */
  slideFrom?: ToastSlideFrom
}

export function Toast({ id, variant, title, message, duration, slideFrom = 'bottom' }: ToastProps) {
  const remove = useToastStore((s) => s.remove)
  const { Icon, iconClass, accentClass, ariaLive } = VARIANT_CONFIG[variant]
  const slide = SLIDE_MAP[slideFrom]

  // Track enter/exit visibility for the CSS transition
  const [isVisible, setIsVisible] = React.useState(false)

  // Fire the enter animation on the next paint so the transition is visible
  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const dismiss = React.useCallback(() => {
    setIsVisible(false)
    // Wait for the exit transition to finish before removing from the store
    setTimeout(() => remove(id), 300)
  }, [id, remove])

  // Auto-dismiss: when duration > 0, set a timer; duration === 0 means persistent
  React.useEffect(() => {
    if (duration === 0) return
    const timer = setTimeout(dismiss, duration)
    return () => clearTimeout(timer)
  }, [dismiss, duration])

  // Keyboard: pressing Escape dismisses the toast that has focus
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        dismiss()
      }
    },
    [dismiss],
  )

  return (
    <div
      role="status"
      aria-live={ariaLive}
      aria-atomic="true"
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex items-start w-80 rounded-xl border bg-(--c-panel) border-(--c-border) shadow-xl overflow-hidden',
        'transition-all duration-300 ease-in-out will-change-transform',
        isVisible ? slide.visible : slide.hidden,
      )}
    >
      {/* Coloured left accent strip — communicates variant at a glance */}
      <div
        className={cn('absolute left-0 inset-y-0 w-1', accentClass)}
        aria-hidden="true"
      />

      {/* Inner content */}
      <div className="flex items-start gap-3 px-4 py-3.5 pl-5 w-full min-w-0">
        {/* Variant icon */}
        <div className={cn('mt-0.5 shrink-0', iconClass)} aria-hidden="true">
          <Icon className="h-5 w-5" />
        </div>

        {/* Title + message */}
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-semibold leading-tight text-(--c-text) mb-0.5">
              {title}
            </p>
          )}
          <p
            className={cn(
              'text-sm leading-snug',
              title ? 'text-(--c-text-muted)' : 'text-(--c-text)',
            )}
          >
            {message}
          </p>
        </div>

        {/* Dismiss button */}
        <button
          type="button"
          onClick={dismiss}
          className={cn(
            'shrink-0 -mt-0.5 -mr-1 rounded-md p-1.5',
            'opacity-60 transition-opacity hover:opacity-100',
            'hover:bg-(--c-surface-hover) text-(--c-text-muted)',
            'focus:outline-none focus:ring-2 focus:ring-(--c-ring)',
            'focus:ring-offset-1 focus:ring-offset-(--c-panel)',
          )}
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
