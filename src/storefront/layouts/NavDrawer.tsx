import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import type { NavItem } from '@/shared/types/StorefrontConfig'
import { SearchBar } from './SearchBar'
import { StorefrontNavLink } from './StorefrontNavLink'
import { CategoryDrawerSection } from './CategoryDrawerSection'

interface NavDrawerProps {
  open: boolean
  onClose: () => void
  items: NavItem[]
}

export function NavDrawer({ open, onClose, items }: NavDrawerProps) {
  const location = useLocation()
  const onCloseRef = useRef(onClose)
  const previousPathname = useRef(location.pathname)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Ignore the initial effect run: opening the drawer must not close it. Only
  // close it once navigation actually changes the pathname.
  useEffect(() => {
    if (previousPathname.current !== location.pathname) {
      previousPathname.current = location.pathname
      onCloseRef.current()
    }
  }, [location.pathname])

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
        className="fixed top-0 right-0 h-full w-72 bg-(--sf-panel) text-(--sf-text) z-50 flex flex-col shadow-xl"
      >
        <div className="flex justify-end p-4">
          <button onClick={onClose} aria-label="Close navigation">✕</button>
        </div>
        <div className="px-4 pb-4">
          <SearchBar className="w-full" />
        </div>
        {/* Scroll container: a deep category tree must not clip against the
            fixed-height drawer. */}
        <div className="flex-1 overflow-y-auto pb-4">
          <nav aria-label="Main navigation" className="flex flex-col gap-2 px-4">
            {items.map(item => (
              <StorefrontNavLink key={item.id} item={item} />
            ))}
          </nav>
          <div className="px-4">
            <CategoryDrawerSection onClose={onClose} />
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
