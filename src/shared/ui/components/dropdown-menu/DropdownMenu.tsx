import * as React from 'react'
import { cn } from '@/shared/utils/cn'

export interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
}

export function DropdownMenu({ trigger, children, align = 'right' }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring) rounded-lg"
      >
        {trigger}
      </button>

      {open && (
        <div
          className={cn(
            'absolute mt-2 min-w-[12rem] rounded-xl border border-(--c-border) bg-(--c-panel) shadow-lg p-1 z-50',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
        >
          {children}
        </div>
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
