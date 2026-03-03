import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartIcon from '../../components/shared/icon/CartIcon.tsx';
import { CartStore } from '../../state/CartStore.ts';

// Keys duplicated here intentionally to avoid coupling to non-exported constants
const LS_KEY = 'ec_cart_order_items';
const CART_SESSION_KEY = 'cart_session_id';
const AUTH_KEY = 'checkoutIsAuthenticated';
const EMAIL_KEY = 'checkoutEmail';

const PageHeader: React.FC = () => {
  const navigate = useNavigate();

  const [lsItemsRaw, setLsItemsRaw] = useState<string | null>(null);
  const [cartSessionId, setCartSessionId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  function readValues() {
    try {
      const ls = typeof window !== 'undefined' ? window.localStorage : null;
      const items = ls ? ls.getItem(LS_KEY) : null;
      const sid = ls ? ls.getItem(CART_SESSION_KEY) : null;
      const auth = ls ? ls.getItem(AUTH_KEY) === 'true' : false;
      setLsItemsRaw(items);
      setCartSessionId(sid);
      setIsAuthenticated(auth);
    } catch (_) {
      setLsItemsRaw(null);
      setCartSessionId(null);
      setIsAuthenticated(false);
    }
  }

  useEffect(() => {
    // Initial read
    readValues();

    // Subscribe to our in-app cart store for same-tab updates
    const unsubscribe = CartStore.subscribe(() => {
      readValues();
    });

    // Listen to storage changes from other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY || e.key === CART_SESSION_KEY || e.key === AUTH_KEY) {
        readValues();
      }
    };
    window.addEventListener('storage', onStorage);

    // Close user menu when clicking outside
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

  const handleLogout = () => {
    try {
      window.localStorage.removeItem(AUTH_KEY);
      window.localStorage.removeItem(EMAIL_KEY);
      setIsAuthenticated(false);
      setShowUserMenu(false);
      // Force a re-read to update UI immediately
      readValues();
      // Optionally navigate to home or refresh
      navigate('/');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  const truncate = (val: string | null | undefined, max = 48) => {
    if (!val) return '';
    return val.length > max ? `${val.slice(0, max)}…` : val;
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 relative z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-lg font-bold text-gray-900 hover:text-blue-600">
            E-Comm Demo
          </Link>
          <Link to="/products" className="text-sm text-gray-700 hover:text-blue-600">Products</Link>
        </div>
        <div className="flex items-center gap-4">
          {/* Debug/visibility of localStorage keys as requested */}
          <div className="hidden sm:flex flex-col text-xs text-gray-500 max-w-[22rem]">
            <div><span className="font-medium text-gray-700">{LS_KEY}:</span> <span className="font-mono">{truncate(lsItemsRaw)}</span></div>
            <div><span className="font-medium text-gray-700">{CART_SESSION_KEY}:</span> <span className="font-mono">{truncate(cartSessionId)}</span></div>
          </div>
          
          <CartIcon
            className="hover:text-blue-600"
            size={22}
            onClick={() => navigate('/cart')}
          />

          {isAuthenticated && (
            <div className="relative" ref={userMenuRef}>
              <div 
                className="text-gray-600 hover:text-blue-600 cursor-pointer p-1" 
                title="User Profile"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
  );
};

export default PageHeader;
