import React, { useEffect, useState } from 'react';
import { fetchProducts, ProductListItem } from '../../services/ProductService';
import {useAddToCart} from '../cart/hook/useAddToCart';

const currency = (val?: number | null) =>
  typeof val === 'number' ? `R ${val.toFixed(2)}` : '—';

const Products: React.FC = () => {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { createOrder } = useAddToCart();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await fetchProducts();
        setItems(list);
      } catch (e: any) {
        console.error('Failed to load products', e);
        setError(e?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => (
          <div key={p.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <img
              src ={'/default-product.png'}
              alt={p.name}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <div className="font-semibold text-gray-900 mb-1">{p.name}</div>
              <div className="text-sm text-gray-600 mb-3 line-clamp-3">{p.description}</div>
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold">{currency(p.price)}</div>
                <button
                  onClick={() => {
                    // Add a simple line item with quantity=1 and unitPrice set to min price
                    createOrder({
                      items: [
                        {
                          quantity: 1,
                          unitPrice: p.price || 0,
                          variant: (p.variantIds && p.variantIds.length > 0) ? p.variantIds[0] : undefined,
                        },
                      ],
                    });
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
