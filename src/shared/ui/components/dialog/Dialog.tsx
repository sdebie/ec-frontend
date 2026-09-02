import { X } from 'lucide-react'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/utils/cn'

/**
 * Theming attributes the dialog must carry across the portal boundary.
 *
 * `--c-*` tokens are scoped by these attributes on a LAYOUT element
 * (`[data-surface='admin']`, `[data-density='compact']`, …), not on <html>.
 * Rendering into document.body leaves that subtree, so without copying them the
 * cascade never reaches the dialog: colours fall back to the wrong palette and
 * `--c-control-h-*` — defined only under `[data-density]` — becomes undefined,
 * which renders any shared form control inside a dialog at height 0.
 *
 * Admin's ThemeApplier mirrors surface/theme/preset onto <body> for portalled
 * components, but NOT density, and the storefront mirrors nothing — so the
 * dialog resolves all four itself rather than depending on either.
 */
const THEME_ATTRS = ['data-surface', 'data-theme', 'data-preset', 'data-density'] as const

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  )
}

interface DialogContextValue {
  onClose: () => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialog() {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error('Dialog components must be used within a Dialog')
  return context
}

export interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
  /**
   * Focus moves here when the dialog closes. Falls back to whatever element
   * had focus at the moment the dialog opened (the WAI-ARIA APG default for
   * the Dialog (Modal) pattern) when omitted — a click that never actually
   * focused its trigger (Safari's own buttons) still restores correctly
   * because it's tracked explicitly, not inferred after the fact.
   */
  restoreFocusRef?: React.RefObject<HTMLElement | null>
  'aria-label'?: string
  'aria-labelledby'?: string
}

export function Dialog({
  open,
  onClose,
  children,
  size = 'md',
  className,
  restoreFocusRef,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: DialogProps) {
  // An anchor rendered at the dialog's ORIGINAL position in the caller's tree.
  // The portalled content cannot see that tree, so the anchor is what tells us
  // which surface/density the dialog was opened from — a global lookup would
  // guess wrong for one of the two portals (admin vs storefront).
  const anchorRef = React.useRef<HTMLSpanElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const previousActiveElementRef = React.useRef<HTMLElement | null>(null)
  const [themeAttrs, setThemeAttrs] = React.useState<Record<string, string>>({})

  // useLayoutEffect, not useEffect: this runs before paint, so the portal is
  // re-rendered with its theming attributes in the same frame and there is no
  // flash of an unthemed dialog.
  React.useLayoutEffect(() => {
    if (!open) return
    const node = anchorRef.current
    if (!node) return

    const resolved: Record<string, string> = {}
    for (const attr of THEME_ATTRS) {
      const value = node.closest(`[${attr}]`)?.getAttribute(attr)
      if (value) resolved[attr] = value
    }
    setThemeAttrs(resolved)
  }, [open])

  // Initial focus + restore-on-close, the other half of a modal's a11y
  // contract. Layout, not passive: runs before paint, same as the theme-attr
  // resolution above, so there's no flash of focus landing somewhere wrong.
  React.useLayoutEffect(() => {
    if (!open) return

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const focusable = panelRef.current ? getFocusableElements(panelRef.current) : []
    focusable[0]?.focus()

    // Captured now, not read from the ref inside the cleanup: what to restore
    // to is decided by who triggered the dialog OPEN, not by whatever the ref
    // happens to point at whenever it eventually closes.
    const explicitRestoreTarget = restoreFocusRef?.current
    return () => {
      const restoreTo = explicitRestoreTarget ?? previousActiveElementRef.current
      restoreTo?.focus()
    }
  }, [open, restoreFocusRef])

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key === 'Tab' && panelRef.current) {
        const focusable = getFocusableElements(panelRef.current)
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown)

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'

      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`
      }
    } else {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes: Record<NonNullable<DialogProps['size']>, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[calc(100vw-10rem)] h-[calc(100vh-10rem)]',
  }

  return (
    <DialogContext.Provider value={{ onClose }}>
      {/* Zero-size anchor marking where the dialog was opened from. It carries the
          `hidden` attribute deliberately: that already removes it from the
          accessibility tree (so no `aria-hidden` is needed), and Tailwind's
          `space-y-*` targets `> :not([hidden]) ~ :not([hidden])`, so a hidden
          anchor cannot disturb the host page's spacing rhythm either. */}
      <span ref={anchorRef} hidden />

      {createPortal(
        /* Portalled to document.body so no ancestor of the call site can impose
           layout on the modal — an ancestor `space-y-*` rule, for instance, would
           apply a bottom margin to the fixed overlay, shrinking it below the
           viewport and leaving an unblurred strip. Escaping the tree also
           immunises the dialog against ancestor transforms (which would re-root
           `position: fixed`), `overflow: hidden` clipping, and stacking contexts
           that could trap its z-index. The cost is the cascade, which `themeAttrs`
           restores. */
        <div {...themeAttrs}>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-100 bg-[#00000080] backdrop-blur-sm transition-opacity"
            aria-hidden="true"
            onClick={onClose}
          />

          {/* Container */}
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 pointer-events-none">
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              className={cn(
                'flex flex-col w-full bg-(--c-panel) border border-(--c-border) rounded-xl shadow-2xl pointer-events-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[calc(100vh-6rem)]',
                sizes[size],
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          </div>
        </div>,
        document.body
      )}
    </DialogContext.Provider>
  )
}

export function DialogHeader({
  title,
  description,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  className?: string
}) {
  const { onClose } = useDialog()

  return (
    <div className={cn('flex flex-col space-y-1.5 p-6 border-b border-(--c-border) relative', className)}>
      <div className="text-lg font-semibold leading-none tracking-tight text-(--c-text) pr-8">
        {title}
      </div>
      {description && (
        <div className="text-sm text-(--c-text-muted)">
          {description}
        </div>
      )}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-md p-2 opacity-70 transition-opacity hover:opacity-100 hover:bg-(--c-surface-hover) text-(--c-text) focus:outline-none focus:ring-2 focus:ring-(--c-ring) focus:ring-offset-1 focus:ring-offset-(--c-panel)"
      >
        <span className="sr-only">Close</span>
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('p-6 overflow-y-auto flex-1 min-h-0 overscroll-contain', className)}>
      {children}
    </div>
  )
}

export function DialogFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn('flex items-center justify-end space-x-2 p-6 border-t border-(--c-border) bg-(--c-panel)', className)}
    >
      {children}
    </div>
  )
}
