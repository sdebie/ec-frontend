import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { cn } from '@/shared/utils/cn'

export interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
  /** Applied to the root wrapper — e.g. `w-full` so the trigger can stretch to fill its container. */
  className?: string
  /** Size the floating menu to the trigger's rendered width instead of the default min-width. */
  matchTriggerWidth?: boolean
  /** Gap in px between the trigger's bottom edge and the menu. Default 8. */
  offset?: number
}

export function DropdownMenu({
  trigger,
  children,
  align = 'right',
  className,
  matchTriggerWidth = false,
  offset = 8,
}: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({})
  const [dropdownTheme, setDropdownTheme] = React.useState<{ surface?: string; theme?: string }>({})
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const menuRef = React.useRef<HTMLDivElement | null>(null)

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const themed = triggerRef.current.closest<HTMLElement>('[data-surface]')

    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + offset,
      left: align === 'right' ? rect.right : rect.left,
      zIndex: 9999,
      width: matchTriggerWidth ? rect.width : undefined,
    })
    setDropdownTheme({
      surface: themed?.getAttribute('data-surface') ?? undefined,
      theme: themed?.getAttribute('data-theme') ?? undefined,
    })
  }, [align, matchTriggerWidth, offset])

  // Calculate dropdown position and propagate data-surface/data-theme from nearest themed ancestor
  React.useLayoutEffect(() => {
    if (open) updatePosition()
  }, [open, updatePosition])

  // `position: fixed` does not move with the page on its own — without this, the menu stays
  // at the viewport position it opened at while the trigger scrolls away underneath it,
  // visually detaching from the trigger the moment the page (or a nested scrollable
  // ancestor) scrolls. `scroll` is captured (not just bubbled) so a scroll inside any
  // nested scrollable container is caught too, not only window-level scrolling.
  React.useEffect(() => {
    if (!open) return

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, updatePosition])

  // Click outside to close — checks both trigger container and portaled menu
  React.useEffect(() => {
    if (!open) return

    function onDocClick(e: MouseEvent) {
      const target = e.target as Node
      if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  // Escape key to close
  React.useEffect(() => {
    if (!open) return

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className={cn('relative inline-block', className)} ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring) rounded-lg"
      >
        {trigger}
      </button>

      {open && ReactDOM.createPortal(
        <div
          ref={menuRef}
          style={dropdownStyle}
          data-surface={dropdownTheme.surface}
          data-theme={dropdownTheme.theme}
          className={cn(
            'rounded-xl border border-(--c-border) bg-(--c-panel) shadow-lg p-1',
            !matchTriggerWidth && 'min-w-[12rem]',
            align === 'right' ? 'translate-x-[-100%]' : ''
          )}
          role="menu"
        >
          {children}
        </div>,
        document.body
      )}
    </div>
  )
}

export interface DropdownItemProps {
  children: React.ReactNode
  onClick?: () => void
  destructive?: boolean
}

export function DropdownItem({ children, onClick, destructive }: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2 text-sm rounded-lg transition',
        destructive
          ? 'text-(--c-error) hover:bg-(--c-error)/10'
          : 'text-(--c-text) hover:bg-(--c-surface-hover)'
      )}
    >
      {children}
    </button>
  )
}
