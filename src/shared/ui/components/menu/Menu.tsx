import * as React from 'react'
import { cn } from '@/shared/utils/cn'

interface MenuContextValue {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggle: () => void
}

const MenuContext = React.createContext<MenuContextValue | null>(null)

function useMenu() {
  const context = React.useContext(MenuContext)
  if (!context) throw new Error('Menu components must be used within a Menu')
  return context
}

export interface MenuProps {
  children: React.ReactNode
}

export function Menu({ children }: MenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), [])

  return (
    <MenuContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      <div className="relative inline-block text-left">{children}</div>
    </MenuContext.Provider>
  )
}

export interface MenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

export function MenuTrigger({ children, asChild, className }: MenuTriggerProps) {
  const { toggle, isOpen } = useMenu()

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{
      onClick?: (e: React.MouseEvent) => void
      className?: string
    }>

    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        toggle()
        child.props.onClick?.(e)
      },
      className: cn(child.props.className, className),
      'aria-expanded': isOpen,
      'aria-haspopup': 'menu',
    } as React.HTMLAttributes<HTMLElement>)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn('inline-flex items-center', className)}
      aria-expanded={isOpen}
      aria-haspopup="menu"
    >
      {children}
    </button>
  )
}

export interface MenuListProps {
  children: React.ReactNode
  className?: string
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
}

export function MenuList({ children, className, position = 'bottom-right' }: MenuListProps) {
  const { isOpen, setIsOpen } = useMenu()
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, setIsOpen])

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, setIsOpen])

  if (!isOpen) return null

  const positionClasses = {
    'bottom-right': 'top-full right-0 mt-2',
    'bottom-left': 'top-full left-0 mt-2',
    'top-right': 'bottom-full right-0 mb-2',
    'top-left': 'bottom-full left-0 mb-2',
  }

  return (
    <div
      ref={ref}
      role="menu"
      className={cn(
        'absolute z-50 w-56 min-w-48 rounded-md shadow-lg bg-(--c-panel) border border-(--c-border) py-1 ring-1 ring-black/5 outline-none',
        positionClasses[position],
        className
      )}
    >
      {children}
    </div>
  )
}

export interface MenuItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export function MenuItem({ children, className, onClick, disabled }: MenuItemProps) {
  const { setIsOpen } = useMenu()

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        onClick?.()
        setIsOpen(false)
      }}
      className={cn(
        'w-full text-left px-4 py-2 text-sm text-(--c-text) transition-colors flex items-center',
        !disabled && 'hover:bg-(--c-surface-hover) focus:bg-(--c-surface-hover) outline-none',
        disabled && 'opacity-50 cursor-not-allowed text-(--c-text-muted)',
        className
      )}
    >
      {children}
    </button>
  )
}

export function MenuSeparator() {
  return <div className="h-px w-full bg-(--c-border) my-1" role="none" />
}

export interface MenuLabelProps {
  children: React.ReactNode
  className?: string
}

export function MenuLabel({ children, className }: MenuLabelProps) {
  return (
    <div
      className={cn(
        'px-4 py-1.5 text-xs font-semibold text-(--c-text-muted) uppercase tracking-wider',
        className
      )}
      role="none"
    >
      {children}
    </div>
  )
}

export interface MenuSectionProps {
  children: React.ReactNode
  label?: React.ReactNode
}

export function MenuSection({ children, label }: MenuSectionProps) {
  return (
    <div className="py-1">
      {label && <MenuLabel>{label}</MenuLabel>}
      {children}
    </div>
  )
}
