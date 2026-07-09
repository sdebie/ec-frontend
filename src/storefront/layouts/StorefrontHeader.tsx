import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, User } from 'lucide-react'
import { useStorefrontConfig } from '@/shared/config/storefrontConfig.context'
import { useCustomerAuthStore } from '@/shared/auth/customerAuthStore'
import { SearchBar } from './SearchBar'
import { StorefrontNavLink } from './StorefrontNavLink'
import { NavDrawer } from './NavDrawer'
import { CartIcon } from '@/storefront/cart/CartIcon'
import { CustomerLoginModal } from '@/storefront/customer/auth/components/CustomerLoginModal'
import { ForgotPasswordModal } from '@/storefront/customer/auth/components/ForgotPasswordModal'

export function StorefrontHeader() {
  const config = useStorefrontConfig()
  const loginStyle = config.auth?.loginStyle ?? 'page'
  const { isSignedIn, firstName, clearSession } = useCustomerAuthStore()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isForgotOpen, setIsForgotOpen] = useState(false)

  const navItems = config.nav ?? []

  function handleSignOut() {
    clearSession()
    navigate('/', { replace: true })
  }

  return (
    <header
      className={`${
        config.stickyHeader ? 'sticky top-0 z-50' : 'relative'
      } w-full border-b border-gray-200 bg-white`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        {/* Logo / Store name */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          {config.branding.logo ? (
            <img
              src={config.branding.logo.src}
              alt={config.branding.logo.alt}
              className="h-8 w-auto"
            />
          ) : (
            <span className="text-lg font-semibold">{config.branding.name}</span>
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

        {/* Search bar — centred, desktop only */}
        {navItems.length > 0 && (
          <div className="hidden flex-1 justify-center md:flex">
            <SearchBar className="w-full max-w-md" />
          </div>
        )}

        {/* User area + burger button */}
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {isSignedIn ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                aria-expanded={dropdownOpen}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <User className="h-5 w-5" aria-hidden="true" />
                <span>{firstName ?? 'My Account'}</span>
              </button>
              {dropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                >
                  <Link
                    to="/account/dashboard"
                    role="menuitem"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    My Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    role="menuitem"
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
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
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Sign in
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
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Sign in
            </Link>
          )}

          {/* Cart icon — visible on both desktop and mobile */}
          <CartIcon />

          {/* Burger button — mobile only */}
          {navItems.length > 0 && (
            <button
              className="md:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
              aria-expanded={drawerOpen}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav drawer */}
      {navItems.length > 0 && (
        <NavDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          items={navItems}
        />
      )}
    </header>
  )
}
