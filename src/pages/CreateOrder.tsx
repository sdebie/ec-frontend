import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateOrder } from './hook/useCreateOrder';
import { OrderData } from './types';

// A simple page that creates a very basic order and then takes the user to checkout
// This uses the existing useCreateOrder hook and minimal order payload
const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const { createOrder, createLoading, createError } = useCreateOrder();
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Build a super-basic order payload; in a real flow this would come from cart/context
  const basicOrder = useMemo(() => {
    return {
      total_amount: 100.0,
      items: [
        {
          unit_price: 100.0,
          quantity: 1,
        },
      ],
    };
  }, []);

  const handleCreateThenCheckout = async () => {
    try {
      const created: OrderData = await createOrder(basicOrder as unknown as OrderData);
      const id = created?.id;
      setLastOrderId(id ?? null);

      // After successful creation, send user to the checkout page
      // Navigate to the dedicated checkout route
      navigate('/checkout', { replace: true });
    } catch (e) {
      // Error state is displayed below; nothing else to do here
      console.error('Failed to create order', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-100 p-8 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Order</h1>
          <p className="text-gray-600">
            This page creates a very basic order and then redirects you to the checkout flow.
          </p>

          {lastOrderId && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg p-3">
              Order created successfully. Temporary ID: <b>{lastOrderId}</b>
            </div>
          )}

          {createError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">
              {createError.message}
            </div>
          )}

          <button
            onClick={handleCreateThenCheckout}
            disabled={createLoading}
            className={`w-full py-3 rounded-xl font-semibold text-white shadow ${
              createLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {createLoading ? 'Creating Order...' : 'Create Order & Go to Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
