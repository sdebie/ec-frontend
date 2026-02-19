import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartIcon from './CartIcon';
import { CartStore } from '../state/CartStore';

// Keys duplicated here intentionally to avoid coupling to non-exported constants
const LS_KEY = 'ec_cart_order_items';
const CART_SESSION_KEY = 'cart_session_id';

const PageHeader: React.FC = () => {
  const navigate = useNavigate();

  const [lsItemsRaw, setLsItemsRaw] = useState<string | null>(null);
  const [cartSessionId, setCartSessionId] = useState<string | null>(null);

  function readValues() {
    try {
      const ls = typeof window !== 'undefined' ? window.localStorage : null;
      const items = ls ? ls.getItem(LS_KEY) : null;
      const sid = ls ? ls.getItem(CART_SESSION_KEY) : null;
      setLsItemsRaw(items);
      setCartSessionId(sid);
    } catch (_) {
      setLsItemsRaw(null);
      setCartSessionId(null);
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
      if (e.key === LS_KEY || e.key === CART_SESSION_KEY) {
        readValues();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const truncate = (val: string | null | undefined, max = 48) => {
    if (!val) return '';
    return val.length > max ? `${val.slice(0, max)}…` : val;
  };

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-lg font-bold text-gray-900 hover:text-blue-600">
            E-Comm Demo
          </Link>
          <Link to="/products" className="text-sm text-gray-700 hover:text-blue-600">Products</Link>
        </div>
        <div className="flex items-center gap-10">
          {/* Debug/visibility of localStorage keys as requested */}
          <div className="hidden sm:flex flex-col text-xs text-gray-500 max-w-[22rem]">
            <div><span className="font-medium text-gray-700">{LS_KEY}:</span> <span className="font-mono">{truncate(lsItemsRaw)}</span></div>
            <div><span className="font-medium text-gray-700">{CART_SESSION_KEY}:</span> <span className="font-mono">{truncate(cartSessionId)}</span></div>
          </div>
          <CartIcon
            className="hover:text-blue-600"
            size={22}
            onClick={() => navigate('/checkout')}
          />
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
