import ProductCard from "./components/ProductCard.tsx";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProductAndVariants } from "@/services/graphql/product/product.service.ts";
import type { ProductInformation } from "@/types/admin/ProductTypes.ts";
import { useAddToCart } from "@/pages/shop/default/cart/hook/useAddToCart.ts";

// Define the UI Product type expected by ProductCard to keep this page self-contained
interface UiVariant {
  id: string;
  sku: string;
  price: number;           // Calculated from first active price
  retailPrice?: number | null;
  retailSalesPrice?: number | null;
  wholesalePrice?: number | null;
  wholesaleSalesPrice?: number | null;
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
        const result: ProductInformation | null = await fetchProductAndVariants(idParam);
        if (isCancelled) return;

        if (!result) {
          setProduct(null);
          setLoading(false);
          return;
        }

        const uiProduct: UiProduct = {
          id: result.productInfo.id ?? idParam,
          name: result.productInfo.name ?? 'Product',
          short_description: result.productInfo.short_description ?? '',
          description: result.productInfo.description ?? '',
          variants: (result.variants || []).map((v) => ({
            id: v.id,
            sku: v.sku ?? '',
            price: v.retailPrice ?? 0,
            retailPrice: v.retailPrice,
            retailSalesPrice: v.retailSalesPrice,
            wholesalePrice: v.wholesalePrice,
            wholesaleSalesPrice: v.wholesaleSalesPrice,
            stock_quantity: v.stockQuantity ?? 0,
            attributes: safeParseAttributes(v.attributesJson),
          })),
          productImages: (result.images || []).map(img => ({ id: img.id, imageUrl: img.imageUrl })),
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