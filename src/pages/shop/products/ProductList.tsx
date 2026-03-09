import React, { useEffect, useState } from 'react';
import { fetchProducts, ProductListItem } from '@/services/ProductService.ts';
import { useAddToCart } from '@/pages/shop/cart/hook/useAddToCart.ts';
import { Link } from "react-router-dom";
import ProductImage from "@/components/shared/imageupload/ProductImage.tsx";

const currency = (val?: number | null) =>
  typeof val === 'number' ? `R ${val.toFixed(2)}` : '—';

interface ProductListProps {
  activeCategory: string;
}

const ProductList: React.FC<ProductListProps> = ({ activeCategory }) => {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { createOrder } = useAddToCart();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await fetchProducts(activeCategory);
        setItems(list);
      } catch (e: any) {
        console.error('Failed to load products', e);
        setError(e?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
  }, [activeCategory]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((p) => {
          // Get the first image for the list view
          const mainImage = p.productImages && p.productImages.length > 0 ? p.productImages[0] : null;

          return (
            <div key={p.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
              <div className="w-full h-40 bg-gray-100 overflow-hidden flex items-center justify-center">
                {mainImage ? (
                  <ProductImage
                    fileName={mainImage.imageUrl}
                    alt={p.name}
                    className="w-45 h-full object-cover rounded-md"
                  />
                ) : (
                  <img
                    src="/img/default-product.png"
                    alt={p.name}
                    className="w-full h-40 object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <div className="font-semibold text-gray-900 mb-1">{p.name}</div>
                <div className="text-sm text-gray-600 mb-3 line-clamp-3">{p.description}</div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    {p.retailSalesPrice && p.retailSalesPrice < (p.retailPrice || 0) ? (
                      <>
                        <div className="text-lg font-bold text-green-600">{currency(p.retailSalesPrice)}</div>
                        <div className="text-sm text-gray-500 line-through">
                          {currency(p.retailPrice)}
                        </div>
                      </>
                    ) : (
                      <div className="text-lg font-bold">{currency(p.retailPrice)}</div>
                    )}
                  </div>
                  <div>
                    {p.wholesaleSalesPrice && p.wholesaleSalesPrice < (p.wholesalePrice || 0) ? (
                        <>
                          <div className="text-lg font-bold text-green-600">{currency(p.wholesaleSalesPrice)}</div>
                          <div className="text-sm text-gray-500 line-through">
                            {currency(p.wholesalePrice)}
                          </div>
                        </>
                    ) : (
                        <div className="text-lg font-bold">{currency(p.wholesalePrice)}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                      onClick={() => {
                        createOrder({
                          items: [
                            {
                              quantity: 1,
                              unitPrice: (p.retailSalesPrice && p.retailPrice < (p.retailPrice || 0)) ? p.retailSalesPrice : p.retailPrice || 0,
                            },
                          ],
                        });
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm whitespace-nowrap"
                  >
                    Add to Cart
                  </button>
                  <Link to={`/product/${p.id}`} className="px-3 py-1.5 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 text-sm whitespace-nowrap">
                    View
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;
