import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import type { NavItem } from '@/shared/types/StorefrontConfig'
import { SearchBar } from './SearchBar'
import { StorefrontNavLink } from './StorefrontNavLink'

interface NavDrawerProps {
  open: boolean
  onClose: () => void
  items: NavItem[]
}

export function NavDrawer({ open, onClose, items }: NavDrawerProps) {
  const location = useLocation()

  // Close on route change
  useEffect(() => { onClose() }, [location.pathname])

  if (!open) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        role="dialog"
        aria-label="Navigation menu"
        className="fixed top-0 right-0 h-full w-72 bg-white z-50 flex flex-col shadow-xl"
      >
        <div className="flex justify-end p-4">
          <button onClick={onClose} aria-label="Close navigation">✕</button>
        </div>
        <div className="px-4 pb-4">
          <SearchBar className="w-full" />
        </div>
        <nav aria-label="Main navigation" className="flex flex-col gap-2 px-4">
          {items.map(item => (
            <StorefrontNavLink key={item.id} item={item} />
          ))}
        </nav>
      </div>
    </>,
    document.body,
  )
}
