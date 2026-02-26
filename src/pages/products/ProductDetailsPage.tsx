import ProductCard from "./components/ProductCard";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProductWithVariants, ProductVariantWithProduct } from "../../services/ProductService";
import Products from "./Products";

// Define the UI Product type expected by ProductCard to keep this page self-contained
interface UiVariant {
  id: number;
  sku: string;
  price: number;
  stock_quantity: number;
  attributes: Record<string, string>;
}

interface UiProduct {
  id: number;
  name: string;
  short_description: string;
  description: string;
  variants: UiVariant[];
}

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState<UiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const idNum = productId ? Number(productId) : NaN;
        if (!idNum || Number.isNaN(idNum)) {
          throw new Error("Invalid product id");
        }
        const variants: ProductVariantWithProduct[] = await fetchProductWithVariants(idNum);
        if (isCancelled) return;

        if (!variants || variants.length === 0) {
          setProduct(null);
          setLoading(false);
          return;
        }

        const base = variants[0]?.product;
        const uiProduct: UiProduct = {
          id: base?.id ?? idNum,
          name: base?.name ?? "Product",
          short_description: "",
          description: base?.description ?? "",
          variants: variants.map((v) => ({
            id: v.id,
            sku: v.sku ?? "",
            price: v.price ?? 0,
            stock_quantity: v.stockQuantity ?? 0,
            attributes: safeParseAttributes(v.attributesJson),
          })),
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

  const handleAddToCart = (variantId: number) => {
    // This is where you call your shopping cart state/store
    console.log(`Adding variant ${variantId} to the global cart state`);
    // You could also trigger a "Added to Cart!" toast notification here
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