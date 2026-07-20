import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { cn } from '@/shared/utils/cn'

export interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
}

export function DropdownMenu({ trigger, children, align = 'right' }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({})
  const [dropdownTheme, setDropdownTheme] = React.useState<{ surface?: string; theme?: string }>({})
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const menuRef = React.useRef<HTMLDivElement | null>(null)

  // Calculate dropdown position and propagate data-surface/data-theme from nearest themed ancestor
  React.useLayoutEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const themed = triggerRef.current.closest<HTMLElement>('[data-surface]')

      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: align === 'right' ? rect.right : rect.left,
        zIndex: 9999,
      })
      setDropdownTheme({
        surface: themed?.getAttribute('data-surface') ?? undefined,
        theme: themed?.getAttribute('data-theme') ?? undefined,
      })
    }
  }, [open, align])

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
    <div className="relative inline-block" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring) rounded-lg"
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
            'min-w-[12rem] rounded-xl border border-(--c-border) bg-(--c-panel) shadow-lg p-1',
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
