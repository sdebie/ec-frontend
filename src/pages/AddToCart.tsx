import React, { useMemo, useState } from 'react';
import { useAddToCart } from './hook/useAddToCart';
import { OrderData } from './types';

// A simple page that creates a very basic order and adds it to the cart
// Checkout is now initiated from the CartIcon click, not from here
const AddToCart: React.FC = () => {
  const { createOrder, createLoading, createError } = useAddToCart();
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Build a super-basic order payload; in a real flow this would come from cart/context
  const basicOrder = useMemo(() => {
    return {
      items: [
        {
          unitPrice: 100.0,
          quantity: 1,
        },
      ],
    };
  }, []);

  const handleAddToCart = async () => {
    try {
      const created: OrderData = await createOrder(basicOrder as unknown as OrderData);
      const id = created?.id;
      setLastOrderId(id ?? null);
      // No navigation here; checkout happens when the CartIcon is clicked
    } catch (e) {
      // Error state is displayed below; nothing else to do here
      console.error('Failed to add to cart', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100 p-8 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Order</h1>
          <p className="text-gray-600">
            This page creates a very basic order and adds it to your cart. Proceed to checkout by clicking the cart icon.
          </p>

          {lastOrderId && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg p-3">
              Added to cart. Temporary Order ID: <b>{lastOrderId}</b>
            </div>
          )}

          {createError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
              {createError.message}
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={createLoading}
            className={`w-full py-3 rounded-xl font-semibold text-white shadow ${
              createLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {createLoading ? 'Adding...' : 'Add to basket'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCart;
