import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import type { NavItem } from '@/shared/types/StorefrontConfig'
import { SearchBar } from './SearchBar'
import { StorefrontNavLink } from './StorefrontNavLink'

/** Shared geometry for the drawer's account row. */
const ACCOUNT_ROW =
  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-(--sf-text) transition-colors hover:bg-(--sf-surface-muted)'

interface NavDrawerProps {
  open: boolean
  onClose: () => void
  items: NavItem[]
  /**
   * Account state and intents, passed individually rather than as an auth
   * object — the drawer only needs to know whether someone is signed in and
   * what to call; it never touches the session itself. The header owns the
   * sign-in route/modal decision because it is the one that knows `loginStyle`.
   */
  isSignedIn: boolean
  accountName: string | null
  onSignIn: () => void
  onSignOut: () => void
}

export function NavDrawer({ open, onClose, items, isSignedIn, accountName, onSignIn, onSignOut }: NavDrawerProps) {
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
        {/* Scroll container. The category tree was removed from here (owner
            directive 2026-08-02, to be revisited post-launch): ~20 root
            categories buried the account action and made the drawer a wall of
            links. Categories remain reachable from the header's mega menu. */}
        <div className="flex-1 overflow-y-auto pb-4">
          <nav aria-label="Main navigation" className="flex flex-col gap-2 px-4">
            {items.map(item => (
              <StorefrontNavLink key={item.id} item={item} variant="drawer" />
            ))}
          </nav>

          {/* Account — directly under the nav with a rule above it, rather than
              pinned to the drawer's foot: with the category tree gone the list
              is short, and an action stranded at the bottom of an empty drawer
              read as disconnected from the menu it belongs to. */}
          <div className="mt-4 border-t border-(--sf-border) px-4 pt-4">
            {isSignedIn ? (
              <>
                <Link to="/account/dashboard" onClick={onClose} className={ACCOUNT_ROW}>
                  <User className="h-5 w-5" aria-hidden="true" />
                  {accountName ?? 'My Account'}
                </Link>
                <button type="button" onClick={onSignOut} className={ACCOUNT_ROW}>
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  Sign out
                </button>
              </>
            ) : (
              <button type="button" onClick={onSignIn} className={ACCOUNT_ROW}>
                <User className="h-5 w-5" aria-hidden="true" />
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
