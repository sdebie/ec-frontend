import ProductCard from './components/ProductCard.tsx';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {fetchProductAndVariants} from '@/services/graphql/product/product.service.ts';
import type {ProductInformation} from '@/types/admin/ProductTypes.ts';
import {useAddToCart} from '@/pages/storefront/core/default/cart/hook/useAddToCart.ts';
import {UvhTitleHero} from '@/pages/storefront/uvh/components/UvhTitleHero.tsx';

interface UiVariant {
    id: string;
    sku: string;
    price: number;
    retailPrice?: number | null;
    retailSalesPrice?: number | null;
    wholesalePrice?: number | null;
    wholesaleSalesPrice?: number | null;
    stock_quantity: number;
    attributes: Record<string, string>;
}

interface UiProduct {
    id: string;
    name: string;
    short_description: string;
    description: string;
    variants: UiVariant[];
    productImages?: { id: string; imageUrl: string }[] | null;
}

export type ProductDetailsLayout = 'default' | 'uvh';

const uvhProductCardContainerClass =
    'w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 bg-transparent p-6 sm:p-8';

function UvhProductDetailHero({
    title,
    subtitle,
}: {
    title: string;
    subtitle?: string;
}) {
    const navigate = useNavigate();

    return (
        <UvhTitleHero
            contentWidth="wide"
            description={subtitle}
            descriptionClassName="mt-3 text-xs font-normal leading-relaxed text-white sm:text-sm"
            eyebrow="Shop"
            title={title}
            titleClassName="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl lg:text-3xl"
            topSlot={
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <button
                        className="inline-flex text-sm font-medium text-white/90 underline-offset-4 transition-colors hover:text-(--sf-accent) hover:underline"
                        onClick={() => navigate(-1)}
                        type="button"
                    >
                        ← Back
                    </button>
                    <span aria-hidden className="hidden text-white/30 sm:inline">
                        |
                    </span>
                    <Link
                        className="inline-flex text-sm font-medium text-white/90 underline-offset-4 transition-colors hover:text-(--sf-accent) hover:underline"
                        to="/products"
                    >
                        All products
                    </Link>
                </div>
            }
        />
    );
}

function ProductDetailBackNav({className}: {className?: string}) {
    const navigate = useNavigate();
    return (
        <div
            className={
                className ??
                'flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-(--sf-border) px-6 pb-4 pt-6 sm:px-8'
            }
        >
            <button
                className="text-sm font-medium text-(--sf-accent) underline-offset-4 hover:underline"
                onClick={() => navigate(-1)}
                type="button"
            >
                ← Back
            </button>
            <span aria-hidden className="text-(--sf-border)">
                |
            </span>
            <Link
                className="text-sm font-medium text-(--sf-muted-text) underline-offset-4 hover:text-(--sf-text) hover:underline"
                to="/products"
            >
                All products
            </Link>
        </div>
    );
}

export function ProductDetailsInner({layout}: {layout: ProductDetailsLayout}) {
    const {productId} = useParams();
    const [product, setProduct] = useState<UiProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {createOrder} = useAddToCart();

    useEffect(() => {
        let isCancelled = false;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const idParam = productId ? String(productId) : '';
                if (!idParam || idParam.length < 8) {
                    throw new Error('Invalid product id');
                }
                const result: ProductInformation | null = await fetchProductAndVariants(idParam);
                if (isCancelled) return;

                const baseProduct = result?.product;
                if (!baseProduct) {
                    setProduct(null);
                    setLoading(false);
                    return;
                }

                const variants = result?.variants || [];
                const variantImages = variants
                    .flatMap((v) => v.images || [])
                    .map((img) => ({id: img.id, imageUrl: img.imageUrl}));

                const uiProduct: UiProduct = {
                    id: baseProduct.id ?? idParam,
                    name: baseProduct.name ?? 'Product',
                    short_description: baseProduct.shortDescription ?? '',
                    description: baseProduct.description ?? '',
                    variants: variants.map((v) => {
                        const retailPrice = getVariantPrice(v.prices, 'RETAIL_PRICE');
                        const retailSalesPrice = getVariantPrice(v.prices, 'RETAIL_SALE_PRICE');
                        const wholesalePrice = getVariantPrice(v.prices, 'WHOLESALE_PRICE');
                        const wholesaleSalesPrice = getVariantPrice(v.prices, 'WHOLESALE_SALE_PRICE');
                        const displayPrice =
                            retailSalesPrice ??
                            retailPrice ??
                            wholesaleSalesPrice ??
                            wholesalePrice ??
                            0;

                        return {
                            id: v.id,
                            sku: v.sku ?? '',
                            price: displayPrice,
                            retailPrice,
                            retailSalesPrice,
                            wholesalePrice,
                            wholesaleSalesPrice,
                            stock_quantity: v.stockQuantity ?? 0,
                            attributes: safeParseAttributes(v.attributesJson),
                        };
                    }),
                    productImages: variantImages,
                };
                setProduct(uiProduct);
            } catch (e: unknown) {
                if (!isCancelled)
                    setError(e instanceof Error ? e.message : 'Failed to load product');
            } finally {
                if (!isCancelled) setLoading(false);
            }
        }
        void load();
        return () => {
            isCancelled = true;
        };
    }, [productId]);

    const handleAddToCart = async (variantId: string) => {
        if (!product) return;
        const variant = product.variants.find((v) => v.id === variantId);
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
        } catch (e) {
            console.error('Failed to add to cart', e);
        }
    };

    if (layout === 'uvh') {
        if (loading) {
            return (
                <main className="min-h-screen w-full bg-(--sf-bg)">
                    <UvhProductDetailHero
                        subtitle="Loading product details…"
                        title="Product"
                    />
                    <div className="mx-auto mt-6 max-w-7xl px-4 py-8 sm:mt-8 sm:px-6 sm:py-10 lg:px-8">
                        <div className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-8 text-(--sf-muted-text) shadow-sm">
                            Loading product…
                        </div>
                    </div>
                </main>
            );
        }
        if (error) {
            return (
                <main className="min-h-screen w-full bg-(--sf-bg)">
                    <UvhProductDetailHero title="Product" subtitle="We couldn’t load this item." />
                    <div className="mx-auto mt-6 max-w-7xl px-4 py-8 sm:mt-8 sm:px-6 sm:py-10 lg:px-8">
                        <div className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-8 text-(--sf-error) shadow-sm">
                            {error}
                        </div>
                    </div>
                </main>
            );
        }
        if (!product) {
            return (
                <main className="min-h-screen w-full bg-(--sf-bg)">
                    <UvhProductDetailHero title="Product not found" subtitle="This product may have been removed." />
                    <div className="mx-auto mt-6 max-w-7xl px-4 py-8 sm:mt-8 sm:px-6 sm:py-10 lg:px-8">
                        <div className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-8 text-(--sf-muted-text) shadow-sm">
                            <Link className="font-semibold text-(--sf-accent) hover:underline" to="/products">
                                Browse all products
                            </Link>
                        </div>
                    </div>
                </main>
            );
        }

        return (
            <main className="min-h-screen w-full bg-(--sf-bg)">
                <UvhProductDetailHero
                    subtitle={
                        product.short_description ||
                        'Choose options, review pricing (Ex. VAT), and add to your cart.'
                    }
                    title={product.name}
                />
                <section className="mx-auto mt-6 w-full max-w-7xl px-4 pb-10 sm:mt-8 sm:px-6 sm:pb-12 lg:px-8">
                    <div className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) shadow-sm">
                        <ProductCard
                            compactSummary
                            containerClassName={uvhProductCardContainerClass}
                            onAddToCart={handleAddToCart}
                            product={product}
                        />
                    </div>
                </section>
            </main>
        );
    }

    if (loading) {
        return <div className="min-h-screen bg-(--sf-bg) p-8">Loading product…</div>;
    }
    if (error) {
        return <div className="min-h-screen bg-(--sf-bg) p-8 text-(--sf-error)">{error}</div>;
    }
    if (!product) {
        return <div className="min-h-screen bg-(--sf-bg) p-8">Product not found.</div>;
    }

    return (
        <div className="min-h-screen bg-(--sf-bg)">
            <div className="mx-auto max-w-6xl">
                <ProductDetailBackNav className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 pb-4 pt-6" />
            </div>
            <ProductCard onAddToCart={handleAddToCart} product={product} />
        </div>
    );
}

const ProductDetailsPage = () => <ProductDetailsInner layout="default" />;

export default ProductDetailsPage;

function safeParseAttributes(json?: string | null): Record<string, string> {
    if (!json) return {};
    try {
        const parsed = JSON.parse(json);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed as Record<string, string>;
        }
    } catch {
        /* ignore */
    }
    return {};
}

function getVariantPrice(
    prices:
        | Array<{ priceType?: string | null; price?: number | null; isActive?: boolean | null }>
        | null
        | undefined,
    priceType: string,
): number | null {
    if (!prices || prices.length === 0) return null;
    const active = prices.find((p) => p.priceType === priceType && p.isActive);
    if (active?.price != null) return active.price;
    const fallback = prices.find((p) => p.priceType === priceType);
    return fallback?.price ?? null;
}
