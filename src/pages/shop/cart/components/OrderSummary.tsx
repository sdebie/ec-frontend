import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { OrderData } from '../types.ts';
import { ShippingMethod } from '../../../../services/StoreSettings.ts';

interface Props {
  order: OrderData | null;
  loading: boolean;
  error: string | null;
  itemsTotal: number;
  selectedShipping: ShippingMethod | null;
  shippingFee: number;
  grandTotal: number;
}

const OrderSummary: React.FC<Props> = ({
  order,
  loading,
  error,
  itemsTotal,
  selectedShipping,
  shippingFee,
  grandTotal,
}) => {
  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <ShoppingBag className="text-blue-600" /> Order Summary
        <span className="ml-auto text-sm text-gray-500">#{order?.id ?? '—'}</span>
      </h3>

      {loading ? (
        <div className="text-sm text-gray-600">Loading order details...</div>
      ) : error ? (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div>
      ) : (
        <>
          <div className="space-y-3">
            {(order?.items ?? []).map((item, idx) => {
              const qty = Number(item.quantity || 0);
              const price = Number(item.unitPrice || 0);
              const lineTotal = qty * price;
              return (
                <div key={idx} className="flex items-start justify-between text-sm">
                  <div className="max-w-[65%]">
                    <p className="font-medium text-gray-800 truncate">{item?.variant?.product?.name ?? 'Product'}</p>
                    {item?.variant?.attributesJson ? (
                      <p className="text-xs text-gray-500 truncate">{item.variant.attributesJson}</p>
                    ) : null}
                    <p className="text-xs text-gray-500">Qty: {qty} × R{price.toFixed(2)}</p>
                  </div>
                  <div className="text-right font-semibold">R{lineTotal.toFixed(2)}</div>
                </div>
              );
            })}
          </div>

          <div className="border-t mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">R{itemsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping{selectedShipping?.name ? ` (${selectedShipping.name})` : ''}</span>
              <span className="font-medium">R{shippingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-3">
              <span>Total</span>
              <span className="text-blue-600">R{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default OrderSummary;
