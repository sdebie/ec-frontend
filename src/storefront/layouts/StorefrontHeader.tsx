import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, User } from 'lucide-react'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { resolveImageUrl } from '@/shared/utils/imageUrl'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { NAV_ICON_HOVER, NAV_ICON_PILL, SF_FOCUS_RING } from '@/storefront/sections/shared/focusRing'
import { SearchBar } from './SearchBar'
import { StorefrontNavLink } from './StorefrontNavLink'
import { NavDrawer } from './NavDrawer'
import { CartIcon } from '@/storefront/cart/components/CartIcon'
import { WishlistIcon } from '@/storefront/customer/account/wishlist/components/WishlistIcon'
import { CustomerLoginModal } from '@/storefront/customer/auth/components/CustomerLoginModal'
import { ForgotPasswordModal } from '@/storefront/customer/auth/components/ForgotPasswordModal'
import { CategoryMegaMenu } from './CategoryMegaMenu'

export function StorefrontHeader() {
  const config = useStorefrontConfig()
  const loginStyle = config.auth?.loginStyle ?? 'page'
  const { isSignedIn, firstName, clearSession } = useCustomerAuthStore()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isForgotOpen, setIsForgotOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  const navItems = config.nav ?? []

  function handleSignOut() {
    setDropdownOpen(false)
    clearSession()
    navigate('/', { replace: true })
  }

  useEffect(() => {
    if (!dropdownOpen) return

    function closeOnOutsidePointer(event: MouseEvent) {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setDropdownOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [dropdownOpen])

  return (
    <header
      className={`${
        config.stickyHeader ? 'sticky top-0 z-50' : 'relative'
      } w-full border-b border-(--sf-nav-border) bg-(--sf-nav-background) text-(--sf-nav-text)`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        {/* Logo / Store name */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          {config.branding?.logo ? (
            <img
              src={resolveImageUrl(config.branding.logo.src) ?? config.branding.logo.src}
              alt={config.branding.logo.alt}
              className="h-8 w-auto"
            />
          ) : (
            <span className="text-lg font-semibold">{config.branding?.name ?? config.clientName}</span>
          )}
        </Link>

        {/* Desktop nav — hidden on mobile */}
        {navItems.length > 0 && (
          <nav aria-label="Main navigation" className="hidden shrink-0 items-center gap-5 md:flex">
            {navItems.map((item) => (
              <StorefrontNavLink key={item.id} item={item} />
            ))}
          </nav>
        )}

        {/* Category mega-menu — desktop only */}
        <CategoryMegaMenu />

        {/* Search bar — centred, desktop only */}
        {navItems.length > 0 && (
          <div className="hidden flex-1 justify-center md:flex">
            <SearchBar tone="nav" className="w-full max-w-sm" />
          </div>
        )}

        {/* User area + burger button */}
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {/* Wishlist icon — visible on both desktop and mobile */}
          <WishlistIcon />

          {/* Cart icon — visible on both desktop and mobile */}
          <CartIcon />

          {/* Account / sign-in — after the cart (owner directive 2026-08-02).
              Hidden below `md`: on a phone it lives in the nav drawer, so the
              header keeps only the icons and the burger. */}
          <div className="hidden md:contents">
          {isSignedIn ? (
            <div ref={accountMenuRef} className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                aria-controls="customer-account-menu"
                aria-label={firstName ? `Account menu for ${firstName}` : 'Account menu'}
                className={`${NAV_ICON_PILL} ${SF_FOCUS_RING.nav}`}
              >
                <User className="h-5 w-5" aria-hidden="true" />
              </button>
              {dropdownOpen && (
                <div
                  id="customer-account-menu"
                  role="menu"
                  className="absolute right-0 mt-1 w-48 rounded-md border border-(--sf-border) bg-(--sf-panel) py-1 shadow-(--sf-shadow-lg)"
                >
                  <Link
                    to="/account/dashboard"
                    role="menuitem"
                    className="block px-4 py-2 text-sm text-(--sf-text) hover:bg-(--sf-surface-muted)"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    role="menuitem"
                    className="block w-full px-4 py-2 text-left text-sm text-(--sf-text) hover:bg-(--sf-surface-muted)"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : loginStyle === 'modal' ? (
            <>
              <button
                onClick={() => setIsLoginOpen(true)}
                aria-label="Sign in"
                className={`${NAV_ICON_PILL} ${SF_FOCUS_RING.nav}`}
              >
                <User className="h-5 w-5" aria-hidden="true" />
              </button>
              <CustomerLoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onForgotPassword={() => {
                  setIsLoginOpen(false)
                  setIsForgotOpen(true)
                }}
              />
              <ForgotPasswordModal
                isOpen={isForgotOpen}
                onClose={() => setIsForgotOpen(false)}
                onBackToLogin={() => {
                  setIsForgotOpen(false)
                  setIsLoginOpen(true)
                }}
              />
            </>
          ) : (
            <Link
              to="/account/login"
              aria-label="Sign in"
              className={`${NAV_ICON_PILL} ${SF_FOCUS_RING.nav}`}
            >
              <User className="h-5 w-5" aria-hidden="true" />
            </Link>
          )}


          </div>

          {/* Burger button — mobile only */}
          {navItems.length > 0 && (
            <button
              className={`md:hidden ${NAV_ICON_HOVER} rounded-md p-2 ${SF_FOCUS_RING.nav}`}
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
              aria-expanded={drawerOpen}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile search row — below main row, visible only below md */}
      {navItems.length > 0 && (
        <div className="md:hidden px-4 pb-3">
          <SearchBar tone="nav" className="w-full" />
        </div>
      )}

      {/* Mobile nav drawer */}
      {navItems.length > 0 && (
        <NavDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          items={navItems}
          isSignedIn={isSignedIn}
          accountName={firstName ?? null}
          onSignIn={() => {
            // The header owns this decision because it is the one that knows
            // `loginStyle`; the drawer just reports the intent.
            setDrawerOpen(false)
            if (loginStyle === 'modal') setIsLoginOpen(true)
            else navigate('/account/login')
          }}
          onSignOut={() => {
            setDrawerOpen(false)
            handleSignOut()
          }}
        />
      )}
    </header>
  )
}
