import {useState, useEffect, useRef} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {useStorefrontTheme} from '@/components/layout/store/default/theme'

interface StorefrontHeaderProps {
    onCartClick?: () => void
    onLoginClick?: () => void
    isAuthenticated?: boolean
    onLogout?: () => void
}

/**
 * StorefrontHeader
 * Main header component for storefront pages
 * Includes logo, navigation, cart, and user menu
 * Theme-aware styling using CSS variables
 */
export function StorefrontHeader({
                                     onCartClick,
                                     onLoginClick,
                                     isAuthenticated = false,
                                     onLogout,
                                 }: StorefrontHeaderProps) {
    const {config} = useStorefrontTheme()
    const navigate = useNavigate()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const userMenuRef = useRef<HTMLDivElement>(null)

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setShowUserMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <header
            className="w-full border-b"
            style={{
                backgroundColor: 'var(--storefront-color-surface)',
                borderColor: 'var(--storefront-color-border)',
                position: 'relative',
                zIndex: 50,
            }}
        >
            <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo and Brand */}
                <div className="flex items-center gap-8">
                    <Link
                        to="/"
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        {config.logo.url && (
                            <img
                                src={config.logo.url}
                                alt={config.logo.alt}
                                width={config.logo.width || 40}
                                height={config.logo.height || 40}
                            />
                        )}
                        <span
                            className="font-semibold text-lg"
                            style={{color: 'var(--storefront-color-text-primary)'}}
                        >
              {config.siteName}
            </span>
                    </Link>

                    {/* Primary Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            to="/"
                            className="text-sm font-medium transition-colors hover:opacity-75"
                            style={{color: 'var(--storefront-color-text-secondary)'}}
                        >
                            Home
                        </Link>
                        <Link
                            to="/products"
                            className="text-sm font-medium transition-colors hover:opacity-75"
                            style={{color: 'var(--storefront-color-text-secondary)'}}
                        >
                            Shop
                        </Link>
                    </nav>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {/* Cart Button */}
                    {onCartClick && (
                        <button
                            onClick={onCartClick}
                            className="p-2 rounded-lg transition-colors hover:bg-opacity-10"
                            style={{
                                color: 'var(--storefront-color-text-secondary)',
                            }}
                            title="Shopping Cart"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.821 4.915h15.412c.51 0 .954.344 1.086.835l1.07 6.414c.12.72-.066 1.446-.616 1.89l-1.755 1.316c-.433.327-.861.649-1.285.971-.424.322-.84.645-1.250.966-.41.322-.811.645-1.206.968-.395.323-.78.646-1.157.969-.378.323-.744.646-1.102.968l-.707.531-.707-.531c-.358-.322-.724-.645-1.102-.968-.378-.323-.763-.646-1.157-.969-.395-.323-.796-.646-1.206-.968-.41-.321-.826-.644-1.25-.966-.424-.322-.852-.644-1.285-.971l-1.755-1.316c-.55-.444-.736-1.17-.616-1.89l1.07-6.414c.132-.491.577-.835 1.087-.835h15.412l-.821-4.915c-.132-.492-.577-.835-1.087-.835H3.636Z"
                                />
                            </svg>
                        </button>
                    )}

                    {/* Authentication */}
                    {!isAuthenticated ? (
                        <button
                            onClick={onLoginClick}
                            className="p-2 rounded-lg transition-colors"
                            style={{
                                color: 'var(--storefront-color-text-secondary)',
                            }}
                            title="Sign In"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                />
                            </svg>
                        </button>
                    ) : (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="p-2 rounded-lg transition-colors"
                                style={{
                                    color: 'var(--storefront-color-text-secondary)',
                                }}
                                title="User Profile"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                    />
                                </svg>
                            </button>

                            {showUserMenu && (
                                <div
                                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                                    style={{
                                        backgroundColor: 'var(--storefront-color-surface)',
                                        borderColor: 'var(--storefront-color-border)',
                                    }}
                                >
                                    <button
                                        onClick={() => {
                                            onLogout?.()
                                            setShowUserMenu(false)
                                            navigate('/')
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm transition-colors hover:bg-opacity-50"
                                        style={{
                                            color: 'var(--storefront-color-text-primary)',
                                            backgroundColor: 'transparent',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--storefront-color-background)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent'
                                        }}
                                    >
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default StorefrontHeader




