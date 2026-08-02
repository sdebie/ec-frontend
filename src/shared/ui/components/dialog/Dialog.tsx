import { X } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/shared/utils/cn'

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
}

export function Dialog({ open, onClose, children, size = 'md', className }: DialogProps) {
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
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
      {/* Overlay.
          `m-0!` is load-bearing, not decoration: this dialog renders INLINE in the
          caller's tree, so a page-level spacing utility on an ancestor leaks into
          it. Tailwind's `space-y-*` emits `> :not(:last-child) { margin-block-end }`,
          which applied a 24px bottom margin here — and because the overlay is
          `fixed` with `top:0; bottom:0`, that margin is subtracted from its used
          height (viewport 720 → 696), leaving an unblurred strip along the bottom
          edge. Neutralising the margin pins it to the full viewport regardless of
          what the host page does. (The deeper fix is to portal the dialog out of
          the page tree; see the note in the component's docs.) */}
      <div
        className="fixed inset-0 z-100 m-0! bg-[#00000080] backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Container — same margin immunity, so the panel stays centred on the
          true viewport rather than a margin-shrunk box. */}
      <div className="fixed inset-0 z-100 m-0! flex items-center justify-center p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
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
