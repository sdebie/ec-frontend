import {HardHat, UserIcon, X} from 'lucide-react';
import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {Link, useLocation, useNavigate} from 'react-router-dom';

import ImageUploadModal from '@/app/layouts/storefront/ImageUploadModal.tsx';
import CartIcon from '@/components/shared/icon/CartIcon.tsx';
import {StorefrontNavLink} from '@/components/shared/navigation';
import LoginModal from '@/features/auth/customer/components/LoginModal.tsx';
import ResetPasswordModal from '@/features/auth/customer/components/ResetPasswordModal.tsx';
import {cartStore} from '@/features/cart';
import {CustomerProfile} from '@/services/CustomerService.ts';
import {customerTypeStore, useIsWholesaler} from '@/store/customerTypeStore.ts';
import {NavMenuItem, StorefrontClientConfig} from '@/types/storefront/storefrontTypes.ts';

import styles from './PageHeader.module.css';

const AUTH_KEY = 'checkoutIsAuthenticated';
const EMAIL_KEY = 'checkoutEmail';
const DESKTOP_QUERY = '(min-width: 768px)'; // Tailwind md breakpoint

interface PageHeaderProps {
    storefrontConfig: StorefrontClientConfig;
}


const PageHeader: React.FC<PageHeaderProps> = ({storefrontConfig}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
    const [showImageUploadModal, setShowImageUploadModal] = useState<boolean>(false);
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState<boolean>(false);
    const [loginModalEmail, setLoginModalEmail] = useState<string>('');
    const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
    const [isDesktopViewport, setIsDesktopViewport] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(DESKTOP_QUERY).matches;
    });
    const isWholesaler = useIsWholesaler();
    const userMenuRef = useRef<HTMLDivElement>(null);


    const renderUserProfileIcon = () => {
        if (!isWholesaler) {
            return <UserIcon size={22}/>;
        }

        return (
            <span className="relative inline-flex h-5.5 w-5.5 items-center justify-center">
                <UserIcon size={22}/>
                <HardHat
                    size={10}
                    className="absolute -top-0.5 right-0 rounded-full bg-(--sf-nav-bg)"
                    aria-hidden="true"
                />
            </span>
        );
    };

    const menuItems = storefrontConfig.navigation.menuItems ?? [];
    const logo = storefrontConfig.branding.logo;
    const stickyHeader = Boolean(storefrontConfig.stickyHeader);

    function readValues() {
        try {
            const ls = typeof window !== 'undefined' ? window.localStorage : null;
            const auth = ls ? ls.getItem(AUTH_KEY) === 'true' : false;
            const adminToken = ls ? ls.getItem('admin_token') : null;
            setIsAuthenticated(auth);
            setIsAdminAuthenticated(!!adminToken);
        } catch {
            setIsAuthenticated(false);
            setIsAdminAuthenticated(false);
        }
    }

    useEffect(() => {
        readValues();

        const unsubscribe = cartStore.subscribe(() => {
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
            setShowResetPasswordModal(false);
            customerTypeStore.getState().resetToRetail(); // Reset customer type to retail
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
            cartStore.emit();
        } catch (e) {
            console.error('Failed to save login state', e);
        }
        setIsAuthenticated(true);
        setShowLoginModal(false);
        setShowResetPasswordModal(false);
    };

    const handleRequestPasswordReset = (email?: string) => {
        setLoginModalEmail(email ?? '');
        setShowLoginModal(false);
        setShowResetPasswordModal(true);
    };

    const handleBackToLogin = () => {
        setShowResetPasswordModal(false);
        setShowLoginModal(true);
    };


    return (
        <header
            className={`${
                stickyHeader ? 'sticky top-0 z-50' : 'relative z-40'
            } w-full border-b border-(--sf-nav-border) bg-(--sf-nav-bg) ${styles.pageHeader}`}
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 bg-(--sf-nav-bg)">
                <div
                    className="grid h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:grid-cols-[auto_1fr_auto] md:gap-8">
                    <Link to="/" className="min-w-0 inline-flex items-center flex-nowrap gap-2 no-underline">
                        {logo?.src ? (
                            <img
                                src={logo.src}
                                alt={logo.alt || `${storefrontConfig.branding.name} logo`}
                                width={logo.width}
                                height={logo.height}
                                className="shrink-0 h-7 w-auto object-contain"
                                style={{width: logo.width, height: logo.height}}
                            />
                        ) : null}
                        <span className={`${styles.brandLink} truncate text-(--sf-nav-text)`}>
                            {storefrontConfig.branding.name}
                        </span>
                    </Link>

                    <nav
                        aria-label="Primary"
                        className={`hidden md:flex items-center justify-center gap-5 ${styles.navMenu}`}
                    >
                        {menuItems.map((item) => (
                            <StorefrontNavLink
                                key={item.id}
                                to={item.to}
                                external={item.external}
                                className={styles.navLink}
                            >
                                {item.label}
                            </StorefrontNavLink>
                        ))}
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
                                <UserIcon
                                    size={22}
                                />
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
                                    {renderUserProfileIcon()}
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
                                aria-label="Open navigation menu"
                                aria-expanded={showMobileMenu}
                                aria-controls="mobile-primary-nav"
                                onClick={() => setShowMobileMenu((prev) => !prev)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {!isDesktopViewport && createPortal(
                    <>
                        {/* Backdrop */}
                        <div
                            aria-hidden="true"
                            onClick={() => setShowMobileMenu(false)}
                            className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${showMobileMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        />
                        {/* Drawer */}
                        <div
                            id="mobile-primary-nav"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Navigation menu"
                            style={{backgroundColor: 'var(--sf-nav-bg)'}}
                            className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col shadow-xl transition-transform duration-300 ease-in-out ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'}`}
                        >
                            <div
                                className="flex items-center justify-between border-b border-(--sf-nav-border) px-4 py-3">
                                <span className="text-sm font-semibold text-(--sf-nav-text)">Menu</span>
                                <button
                                    type="button"
                                    className={`${styles.iconButton} text-(--sf-nav-icon-text)`}
                                    aria-label="Close navigation menu"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    <X size={22}/>
                                </button>
                            </div>
                            <nav aria-label="Mobile primary" className="flex flex-col gap-1 overflow-y-auto p-4">
                                {menuItems.map((item) => (
                                    <StorefrontNavLink
                                        key={item.id}
                                        to={item.to}
                                        external={item.external}
                                        className={`block rounded-md px-3 py-2.5 text-sm font-medium text-(--sf-nav-text) transition-colors ${styles.drawerNavLink}`}
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        {item.label}
                                    </StorefrontNavLink>
                                ))}
                            </nav>
                        </div>
                    </>,
                    document.querySelector(`[data-storefront-client="${storefrontConfig.id}"]`) ?? document.body
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
                onRequestPasswordReset={handleRequestPasswordReset}
                email={loginModalEmail}
                showEmailField={true}
            />

            <ResetPasswordModal
                isOpen={showResetPasswordModal}
                onClose={() => setShowResetPasswordModal(false)}
                initialEmail={loginModalEmail}
                onBackToLogin={handleBackToLogin}
            />
        </header>
    );
};

export default PageHeader;