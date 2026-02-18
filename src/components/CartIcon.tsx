import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { CartStore } from '../state/CartStore';

export type CartIconProps = {
  className?: string;
  onClick?: () => void;
  size?: number; // icon size in px
  showZero?: boolean; // whether to show badge when count is 0
};

const CartIcon: React.FC<CartIconProps> = ({ className = '', onClick, size = 24, showZero = false }) => {
  const [count, setCount] = useState<number>(() => CartStore.getItemCount());

  useEffect(() => {
    // Subscribe to global cart changes
    const unsub = CartStore.subscribe(() => setCount(CartStore.getItemCount()));
    // Ensure initial count is in sync if something changed before mount
    setCount(CartStore.getItemCount());
    return () => unsub();
  }, []);

  const shouldShowBadge = showZero ? count >= 0 : count > 0;

  return (
    <button
      type="button"
      aria-label={`Cart${count ? ` with ${count} items` : ''}`}
      className={`relative inline-flex items-center justify-center ${className}`}
      onClick={onClick}
    >
      <ShoppingCart width={size} height={size} />
      {shouldShowBadge && (
        <span
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[11px] leading-[18px] text-center shadow"
          aria-label="Items in cart"
        >
          {count}
        </span>
      )}
    </button>
  );
};

export default CartIcon;
