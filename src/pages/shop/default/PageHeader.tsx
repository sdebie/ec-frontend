import React, {useEffect, useRef, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import CartIcon from '../../../components/shared/icon/CartIcon.tsx';
import ImageUploadModal from '@/pages/shop/default/components/ImageUploadModal.tsx';
import LoginModal from '@/pages/shop/default/auth/LoginModal.tsx';
import {CustomerProfile} from '@/services/CustomerService.ts';
import {NavMenuItem, StorefrontClientConfig} from '@/types/storefront/storefrontTypes.ts';
import {CartStore} from '@/store/CartStore.ts';
import styles from './PageHeader.module.css';

const AUTH_KEY = 'checkoutIsAuthenticated';
const EMAIL_KEY = 'checkoutEmail';
const DESKTOP_QUERY = '(min-width: 1024px)'; // Tailwind lg breakpoint

interface PageHeaderProps {
    activeCategory: string;
    onSelectCategory: (category: string) => void;
    storefrontConfig: StorefrontClientConfig;
}

interface RenderNavItemOptions {
    className?: string;
    onClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({storefrontConfig}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
    const [showImageUploadModal, setShowImageUploadModal] = useState<boolean>(false);
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
    const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
    const [isDesktopViewport, setIsDesktopViewport] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(DESKTOP_QUERY).matches;
    });
    const userMenuRef = useRef<HTMLDivElement>(null);

    const menuItems = storefrontConfig.navigation.menuItems ?? [];
    const logo = storefrontConfig.branding.logo;

    function readValues() {
        try {
            const ls = typeof window !== 'undefined' ? window.localStorage : null;
            const auth = ls ? ls.getItem(AUTH_KEY) === 'true' : false;
            const adminToken = ls ? ls.getItem('admin_token') : null;
            setIsAuthenticated(auth);
            setIsAdminAuthenticated(!!adminToken);
        } catch (_) {
            setIsAuthenticated(false);
            setIsAdminAuthenticated(false);
        }
    }

    useEffect(() => {
        readValues();

        const unsubscribe = CartStore.subscribe(() => {
            readValues();
        });

        const onStorage = (e: StorageEvent) => {
            if (e.key === AUTH_KEY || e.key === 'admin_token') {
                readValues();
            }
        };
        window.addEventListener('storage', onStorage);

        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            unsubscribe();
            window.removeEventListener('storage', onStorage);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setShowMobileMenu(false);
    }, [location.pathname]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(DESKTOP_QUERY);

        const handleViewportChange = (matches: boolean) => {
            setIsDesktopViewport(matches);
            if (matches) {
                // Prevent stale open mobile menu state when moving to desktop
                setShowMobileMenu(false);
            }
        };

        handleViewportChange(mediaQuery.matches);

        const onChange = (event: MediaQueryListEvent) => {
            handleViewportChange(event.matches);
        };

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', onChange);
            return () => mediaQuery.removeEventListener('change', onChange);
        }

        // Safari legacy fallback
        mediaQuery.addListener(onChange);
        return () => mediaQuery.removeListener(onChange);
    }, []);

    const handleLogout = () => {
        try {
            window.localStorage.removeItem(AUTH_KEY);
            window.localStorage.removeItem(EMAIL_KEY);
            setIsAuthenticated(false);
            setShowUserMenu(false);
            setShowLoginModal(false);
            readValues();
            navigate('/');
        } catch (e) {
            console.error('Logout failed', e);
        }
    };

    const handleLoginSuccess = (profile: CustomerProfile) => {
        try {
            window.localStorage.setItem(AUTH_KEY, 'true');
            window.localStorage.setItem(EMAIL_KEY, profile.email);
            CartStore.emit();
        } catch (e) {
            console.error('Failed to save login state', e);
        }
        setIsAuthenticated(true);
        setShowLoginModal(false);
    };

    const renderNavItem = (item: NavMenuItem, options: RenderNavItemOptions = {}) => {
        const {className = styles.navLink, onClick} = options;

        if (item.external) {
            return (
                <a
                    key={item.id}
                    href={item.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                    onClick={onClick}
                >
                    {item.label}
                </a>
            );
        }

        return (
            <Link
                key={item.id}
                to={item.to}
                className={className}
                onClick={onClick}
            >
                {item.label}
            </Link>
        );
    };

    return (
        <header
            className={`relative z-50 w-full border-b border-(--sf-nav-border) bg-(--sf-nav-bg) ${styles.pageHeader}`}
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                    className="grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 lg:grid-cols-[auto_1fr_auto] lg:gap-6">
                    <Link to="/" className="min-w-0 inline-flex items-center flex-nowrap gap-2 no-underline">
                        {logo?.src ? (
                            <img
                                src={logo.src}
                                alt={logo.alt || `${storefrontConfig.branding.name} logo`}
                                width={logo.width}
                                height={logo.height}
                                className="shrink-0 h-8 w-auto object-contain"
                                style={{width: logo.width, height: logo.height}}
                            />
                        ) : null}
                        <span className={`${styles.brandLink} truncate text-(--sf-nav-text)`}>
                            {storefrontConfig.branding.name}
                        </span>
                    </Link>

                    <nav
                        aria-label="Primary"
                        className={`hidden lg:flex items-center justify-center gap-6 ${styles.navMenu}`}
                    >
                        {menuItems.map((item) => renderNavItem(item))}
                    </nav>

                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                        {isAdminAuthenticated && (
                            <button
                                onClick={() => setShowImageUploadModal(true)}
                                className={`${styles.iconButton} text-(--sf-nav-icon-text)`}
                                title="Upload Image (Admin)"
                            >
                                {/* icon */}
                            </button>
                        )}

                        <CartIcon
                            className={`transition-colors ${styles.iconButton} text-(--sf-nav-icon-text)`}
                            size={22}
                            onClick={() => navigate('/cart')}
                        />

                        {!isAuthenticated && (
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className={`${styles.iconButton} text-(--sf-nav-icon-text)`}
                                title="Sign In"
                            >
                                {/* icon */}
                            </button>
                        )}

                        {isAuthenticated && (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    className={`${styles.iconButton} text-(--sf-nav-icon-text)`}
                                    title="User Profile"
                                    aria-haspopup="menu"
                                    aria-expanded={showUserMenu}
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    {/* icon */}
                                </button>

                                {showUserMenu && (
                                    <div
                                        className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ring-1 ring-opacity-5 focus:outline-none z-50 bg-(--sf-nav-bg) ${styles.userMenu}`}
                                        role="menu"
                                    >
                                        <button
                                            onClick={handleLogout}
                                            className={`${styles.userMenuButton} text-(--sf-nav-text)`}
                                            role="menuitem"
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {!isDesktopViewport && (
                            <button
                                type="button"
                                className={`${styles.iconButton} text-(--sf-nav-icon-text)`}
                                aria-label={showMobileMenu ? 'Close navigation menu' : 'Open navigation menu'}
                                aria-expanded={showMobileMenu}
                                aria-controls="mobile-primary-nav"
                                onClick={() => setShowMobileMenu((prev) => !prev)}
                            >
                                {showMobileMenu ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
                                    </svg>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {!isDesktopViewport && showMobileMenu && (
                    <nav
                        id="mobile-primary-nav"
                        aria-label="Mobile primary"
                        className="border-t border-(--sf-nav-border) py-2"
                    >
                        <div className="flex flex-col">
                            {menuItems.map((item) =>
                                renderNavItem(item, {
                                    className: 'block py-2 text-sm',
                                    onClick: () => setShowMobileMenu(false),
                                })
                            )}
                        </div>
                    </nav>
                )}
            </div>

            <ImageUploadModal
                isOpen={showImageUploadModal}
                onClose={() => setShowImageUploadModal(false)}
                onImageUpload={() => setShowImageUploadModal(false)}
            />

            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLoginSuccess={handleLoginSuccess}
                showEmailField={true}
            />
        </header>
    );
};

export default PageHeader;
