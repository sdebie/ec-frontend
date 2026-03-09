import ProductCard from "./components/ProductCard.tsx";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProductWithVariants, ProductWithVariants, VariantPrice } from "../../../services/ProductService.ts";
import { useAddToCart } from "@/pages/shop/cart/hook/useAddToCart.ts";

// Define the UI Product type expected by ProductCard to keep this page self-contained
interface UiVariant {
  id: string;
  sku: string;
  price: number;           // Calculated from first active price
  prices?: VariantPrice[]; // All prices with types
  stock_quantity: number;
  attributes: Record<string, string>;
}

interface UiProduct {
  id: string; // UUID string
  name: string;
  short_description: string;
  description: string;
  variants: UiVariant[];
  productImages?: { id: string; imageUrl: string }[] | null;
}

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState<UiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { createOrder } = useAddToCart();

  /**
   * Get the first active retail price from a list of prices
   * Fallback to first price if no retail price found
   */
  const getDisplayPrice = (prices?: VariantPrice[] | null): number => {
    if (!prices || prices.length === 0) return 0;

    // Try to find a standard price (non-sale)
    const standardPrice = prices.find(p =>
      p.priceType === 'PRICE' &&
      p.isActive
    );
    if (standardPrice) return Number(standardPrice.price);

    // Fallback to any active price
    const activePrice = prices.find(p => p.isActive);
    if (activePrice) return Number(activePrice.price);

    // Fallback to first price
    return Number(prices[0]?.price ?? 0);
  };

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const idParam = productId ? String(productId) : '';
        if (!idParam || idParam.length < 8) {
          throw new Error("Invalid product id");
        }
        const result: ProductWithVariants | null = await fetchProductWithVariants(idParam);
        if (isCancelled) return;

        if (!result) {
          setProduct(null);
          setLoading(false);
          return;
        }

        const uiProduct: UiProduct = {
          id: result.productId ?? idParam,
          name: result.productName ?? 'Product',
          short_description: '',
          description: result.productDescription ?? '',
          variants: (result.variants || []).map((v) => ({
            id: v.id,
            sku: v.sku ?? '',
            price: getDisplayPrice(v.prices),
            prices: v.prices,
            stock_quantity: v.stockQuantity ?? 0,
            attributes: safeParseAttributes(v.attributesJson),
          })),
          productImages: (result.productImages || []).map(img => ({ id: img.id, imageUrl: img.imageUrl })),
        };
        setProduct(uiProduct);
      } catch (e: any) {
        if (!isCancelled) setError(e?.message || "Failed to load product");
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    load();
    return () => {
      isCancelled = true;
    };
  }, [productId]);

  const handleAddToCart = async (variantId: string) => {
    if (!product) return;
    const variant = product.variants.find(v => v.id === variantId);
    if (!variant) return;

    try {
      await createOrder({
        items: [
          {
            quantity: 1,
            unitPrice: variant.price,
            variant: variantId,
          },
        ],
      });
      // Optional: Show success message
    } catch (e) {
      console.error("Failed to add to cart", e);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-white p-8">Loading product…</div>;
  }
  if (error) {
    return <div className="min-h-screen bg-white p-8 text-red-600">{error}</div>;
  }
  if (!product) {
    return <div className="min-h-screen bg-white p-8">Product not found.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <ProductCard product={product} onAddToCart={handleAddToCart} />
    </div>
  );
};

function safeParseAttributes(json?: string | null): Record<string, string> {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch (_) {}
  return {};
}

export default ProductDetailsPage;