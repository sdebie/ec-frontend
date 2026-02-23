import React, { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { CartStore } from '../state/CartStore';
import { useNavigate } from 'react-router-dom';

export type CartIconProps = {
  className?: string;
  onClick?: () => void;
  size?: number; // icon size in px
  showZero?: boolean; // whether to show badge when count is 0
};

const CartIcon: React.FC<CartIconProps> = ({ className = '', onClick, size = 24, showZero = false }) => {
  const [count, setCount] = useState<number>(() => CartStore.getItemCount());
  const [sessionId, setOrderId] = useState<string | null>(() => CartStore.getOrderSessionId());
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe to global cart changes
    const unsub = CartStore.subscribe(() => {
      setCount(CartStore.getItemCount());
      setOrderId(CartStore.getOrderSessionId());
    });
    // Ensure initial state is in sync if something changed before mount
    setCount(CartStore.getItemCount());
    setOrderId(CartStore.getOrderSessionId());
    return () => unsub();
  }, []);

  const shouldShowBadge = showZero ? count >= 0 : count > 0;

  const handleDefaultClick = () => {
    if (typeof onClick === 'function') {
      onClick();
      return;
    }
    // Default behavior: if cart has items and we know the order session id, navigate to checkout
    if (count > 0 && sessionId) {
      navigate(`/checkout?sessionId=${encodeURIComponent(sessionId)}`);
    }
  };

  return (
    <button
      type="button"
      aria-label={`Cart${count ? ` with ${count} items` : ''}`}
      className={`relative inline-flex items-center justify-center ${className}`}
      onClick={handleDefaultClick}
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
