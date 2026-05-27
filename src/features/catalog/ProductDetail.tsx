import {ChevronDown, ChevronUp} from 'lucide-react';
import {useMemo, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';

import ProductImage from '@/components/shared/imageupload/ProductImage.tsx';
import {useProduct} from '@/features/catalog/hooks/useProduct.ts';
import {getDisplayPriceForVariantTiers, pickVariantPriceByType,} from '@/features/catalog/utils/pricing.ts';
import {Button} from '@/primitives/button';
import {useCustomerType} from '@/store/customerTypeStore.ts';

type ProductDetailLayout = 'default' | 'uvh';

type UiVariant = {
    id: string;
    sku: string;
    stockQuantity: number;
    attributes: Record<string, string>;
    retailPrice: number;
    retailSalePrice: number | null;
    wholesalePrice: number;
    wholesaleSalePrice: number | null;
};

type UiProduct = {
    id: string;
    name: string;
    shortDescription: string;
    description: string;
    variants: UiVariant[];
    productImages: { id: string; imageUrl: string }[];
};

type ProductDetailProps = {
    productId: string;
    layout?: ProductDetailLayout;
    onAddToCart: (variantId: string, unitPrice: number) => Promise<void> | void;
};

const defaultContainerClass = 'max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-12 bg-(--sf-bg)';
const uvhContainerClass = 'w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 bg-transparent p-6 sm:p-8';

export function ProductDetail({productId, layout = 'default', onAddToCart}: ProductDetailProps) {
    const navigate = useNavigate();
    const {product, loading, error} = useProduct(productId);
    const mapped = useMemo(() => mapToUiProduct(product), [product]);

    if (layout === 'uvh') {
        return renderUvhLayout({
            loading,
            error,
            product: mapped,
            onAddToCart,
        });
    }

    if (loading) return <div className="min-h-screen bg-(--sf-bg) p-8">Loading product…</div>;
    if (error) return <div className="min-h-screen bg-(--sf-bg) p-8 text-(--sf-error)">{error}</div>;
    if (!mapped) return <div className="min-h-screen bg-(--sf-bg) p-8">Product not found.</div>;

    return (
        <div className="min-h-screen bg-(--sf-bg)">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 pb-4 pt-6">
                    <button
                        className="text-sm font-medium text-(--sf-accent) underline-offset-4 hover:underline"
                        onClick={() => navigate(-1)}
                        type="button"
                    >
                        ← Back
                    </button>
                    <span aria-hidden className="text-(--sf-border)">|</span>
                    <Link
                        className="text-sm font-medium text-(--sf-muted-text) underline-offset-4 hover:text-(--sf-text) hover:underline"
                        to="/products"
                    >
                        All products
                    </Link>
                </div>
            </div>
            <ProductDetailCard
                containerClassName={defaultContainerClass}
                onAddToCart={onAddToCart}
                product={mapped}
            />
        </div>
    );
}

function renderUvhLayout({
                             loading,
                             error,
                             product,
                             onAddToCart,
                         }: {
    loading: boolean;
    error: string | null;
    product: UiProduct | null;
    onAddToCart: (variantId: string, unitPrice: number) => Promise<void> | void;
}) {
    if (loading) {
        return (
            <main className="min-h-screen w-full bg-(--sf-bg)">
                <UvhDetailHero subtitle="Loading product details…" title="Product"/>
                <div className="mx-auto mt-6 max-w-7xl px-4 py-8 sm:mt-8 sm:px-6 sm:py-10 lg:px-8">
                    <div
                        className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-8 text-(--sf-muted-text) shadow-sm">
                        Loading product…
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen w-full bg-(--sf-bg)">
                <UvhDetailHero subtitle="We couldn’t load this item." title="Product"/>
                <div className="mx-auto mt-6 max-w-7xl px-4 py-8 sm:mt-8 sm:px-6 sm:py-10 lg:px-8">
                    <div
                        className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-8 text-(--sf-error) shadow-sm">
                        {error}
                    </div>
                </div>
            </main>
        );
    }

    if (!product) {
        return (
            <main className="min-h-screen w-full bg-(--sf-bg)">
                <UvhDetailHero subtitle="This product may have been removed." title="Product not found"/>
                <div className="mx-auto mt-6 max-w-7xl px-4 py-8 sm:mt-8 sm:px-6 sm:py-10 lg:px-8">
                    <div
                        className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-8 text-(--sf-muted-text) shadow-sm">
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
            <UvhDetailHero
                subtitle={product.shortDescription || 'Choose options, review pricing (Ex. VAT), and add to your cart.'}
                title={product.name}
            />
            <section className="mx-auto mt-6 w-full max-w-7xl px-4 pb-10 sm:mt-8 sm:px-6 sm:pb-12 lg:px-8">
                <div className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) shadow-sm">
                    <ProductDetailCard
                        compactSummary
                        containerClassName={uvhContainerClass}
                        onAddToCart={onAddToCart}
                        product={product}
                    />
                </div>
            </section>
        </main>
    );
}

function UvhDetailHero({title, subtitle}: { title: string; subtitle?: string }) {
    const navigate = useNavigate();
    return (
        <section className="bg-(--sf-text) text-(--sf-accent-text)">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <button
                        className="inline-flex text-sm font-medium text-(--sf-accent-text) underline-offset-4 transition-colors hover:text-(--sf-accent) hover:underline"
                        onClick={() => navigate(-1)}
                        type="button"
                    >
                        ← Back
                    </button>
                    <span aria-hidden className="hidden text-(--sf-accent-text)/60 sm:inline">|</span>
                    <Link
                        className="inline-flex text-sm font-medium text-(--sf-accent-text) underline-offset-4 transition-colors hover:text-(--sf-accent) hover:underline"
                        to="/products"
                    >
                        All products
                    </Link>
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-(--sf-accent)">Shop</p>
                <h1 className="mt-3 text-xl font-semibold tracking-tight text-(--sf-accent-text) sm:text-2xl lg:text-3xl">{title}</h1>
                {subtitle ? (
                    <p className="mt-3 text-xs font-normal leading-relaxed text-(--sf-accent-text)/90 sm:text-sm">
                        {subtitle}
                    </p>
                ) : null}
            </div>
        </section>
    );
}

function ProductDetailCard({
                               product,
                               onAddToCart,
                               containerClassName,
                               compactSummary = false,
                           }: {
    product: UiProduct;
    onAddToCart: (variantId: string, unitPrice: number) => Promise<void> | void;
    containerClassName: string;
    compactSummary?: boolean;
}) {
    const customerType = useCustomerType();
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [openSection, setOpenSection] = useState<string | null>('Description');
    const [selectedMainImage, setSelectedMainImage] = useState<string | undefined>(undefined);

    const options = useMemo(() => {
        const map: Record<string, Set<string>> = {};
        product.variants.forEach((variant) => {
            Object.entries(variant.attributes).forEach(([key, value]) => {
                if (!map[key]) map[key] = new Set();
                map[key].add(value);
            });
        });
        return Object.fromEntries(Object.entries(map).map(([key, value]) => [key, Array.from(value)]));
    }, [product.variants]);

    const activeVariant = useMemo(
        () => product.variants.find((variant) => Object.entries(selections).every(([k, v]) => variant.attributes[k] === v)),
        [selections, product.variants],
    );

    const pricePresentation = useMemo(() => {
        const variant = activeVariant ?? product.variants[0];
        if (!variant) return {price: 0, originalPrice: undefined as number | undefined};
        return getDisplayPriceForVariantTiers(
            {
                retailPrice: variant.retailPrice,
                retailSalePrice: variant.retailSalePrice,
                wholesalePrice: variant.wholesalePrice,
                wholesaleSalePrice: variant.wholesaleSalePrice,
            },
            customerType,
        );
    }, [activeVariant, product.variants, customerType]);

    const displayImage = selectedMainImage || product.productImages[0]?.imageUrl;
    const thumbImages = product.productImages.slice(0, 3).map((img) => img.imageUrl);

    return (
        <div className={containerClassName}>
            <div className="space-y-4">
                <div className="aspect-square overflow-hidden rounded-2xl border border-(--sf-border) bg-(--sf-bg)">
                    {displayImage ? (
                        <ProductImage fileName={displayImage} alt={product.name}
                                      className="h-full w-full object-cover rounded-md"/>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-(--sf-muted-text)">No
                            image</div>
                    )}
                </div>
                <div className="flex gap-4">
                    {thumbImages.map((thumb, index) => (
                        <button
                            key={`${thumb}-${index}`}
                            type="button"
                            onClick={() => setSelectedMainImage(thumb)}
                            className={`h-20 w-20 overflow-hidden rounded-lg ${
                                selectedMainImage === thumb || (selectedMainImage === undefined && index === 0)
                                    ? 'border-2 border-(--sf-accent)'
                                    : 'border border-(--sf-border)'
                            }`}
                        >
                            <ProductImage fileName={thumb} alt={`${product.name} thumb ${index + 1}`}
                                          className="h-full w-full object-cover rounded-md"/>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col">
                {compactSummary ? (
                    <div
                        className="flex flex-wrap items-baseline justify-between gap-4 border-b border-(--sf-border) pb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--sf-muted-text)">Price
                            (Ex. VAT)</p>
                        <div className="text-right">
                            <span
                                className="text-2xl font-bold text-(--sf-accent)">R {pricePresentation.price.toFixed(2)}</span>
                            {pricePresentation.originalPrice != null &&
                                pricePresentation.originalPrice > pricePresentation.price && (
                                    <p className="mt-1 text-sm text-(--sf-muted-text) line-through">
                                        R {pricePresentation.originalPrice.toFixed(2)}
                                    </p>
                                )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-start justify-between gap-4">
                            <h1 className="text-3xl font-bold text-(--sf-text)">{product.name}</h1>
                            <div className="text-right">
                                <span
                                    className="text-xl font-semibold text-(--sf-text)">R {pricePresentation.price.toFixed(2)}</span>
                                {pricePresentation.originalPrice != null &&
                                    pricePresentation.originalPrice > pricePresentation.price && (
                                        <p className="mt-1 text-sm text-(--sf-muted-text) line-through">
                                            R {pricePresentation.originalPrice.toFixed(2)}
                                        </p>
                                    )}
                            </div>
                        </div>
                        <p className="mt-2 text-(--sf-muted-text)">{product.shortDescription}</p>
                    </>
                )}

                {Object.entries(options).map(([key, values]) => (
                    <div key={key} className="mt-8">
                        <h4 className="text-sm font-bold uppercase tracking-wide text-(--sf-text)">
                            {key}: <span
                            className="font-normal text-(--sf-muted-text)">{selections[key] || 'Select'}</span>
                        </h4>
                        <div className="mt-3 flex flex-wrap gap-3">
                            {values.map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setSelections((prev) => ({...prev, [key]: value}))}
                                    className={`rounded-lg border-2 px-6 py-2 font-medium ${
                                        selections[key] === value
                                            ? 'border-(--sf-accent) bg-(--sf-panel) text-(--sf-accent)'
                                            : 'border-(--sf-border) text-(--sf-muted-text) hover:border-(--sf-accent)'
                                    }`}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <Button
                    disabled={!activeVariant || activeVariant.stockQuantity === 0}
                    onClick={() =>
                        activeVariant &&
                        onAddToCart(
                            activeVariant.id,
                            getDisplayPriceForVariantTiers(
                                {
                                    retailPrice: activeVariant.retailPrice,
                                    retailSalePrice: activeVariant.retailSalePrice,
                                    wholesalePrice: activeVariant.wholesalePrice,
                                    wholesaleSalePrice: activeVariant.wholesaleSalePrice,
                                },
                                customerType,
                            ).price,
                        )
                    }
                    className="mt-10 w-full py-4 text-lg"
                >
                    {activeVariant ? 'Add to cart..' : 'Select Options'}
                </Button>

                <div className="mt-10 border-t border-(--sf-border)">
                    {['Description', 'Product Details', 'Shipping & Returns'].map((section) => (
                        <div key={section} className="border-b border-(--sf-border)">
                            <button
                                type="button"
                                onClick={() => setOpenSection((current) => (current === section ? null : section))}
                                className="flex w-full items-center justify-between py-4 text-sm font-bold text-(--sf-text)"
                            >
                                {section}
                                {openSection === section ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                            </button>
                            {openSection === section ? (
                                <div className="pb-4 text-sm text-(--sf-muted-text)">
                                    {section === 'Description'
                                        ? product.description
                                        : `Information about ${section.toLowerCase()} goes here.`}
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function mapToUiProduct(product: ReturnType<typeof useProduct>['product']): UiProduct | null {
    if (!product?.product) return null;
    const variants = product.variants ?? [];
    const productImages = variants.flatMap((variant) => variant.images || []).map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl
    }));

    return {
        id: product.product.id,
        name: product.product.name ?? 'Product',
        shortDescription: product.product.shortDescription ?? '',
        description: product.product.description ?? '',
        variants: variants.map((variant) => {
            const retailPrice = pickVariantPriceByType(variant.prices, 'RETAIL_PRICE') ?? 0;
            const retailSalePrice = pickVariantPriceByType(variant.prices, 'RETAIL_SALE_PRICE');
            const wholesalePrice = pickVariantPriceByType(variant.prices, 'WHOLESALE_PRICE') ?? 0;
            const wholesaleSalePrice = pickVariantPriceByType(variant.prices, 'WHOLESALE_SALE_PRICE');
            return {
                id: variant.id,
                sku: variant.sku ?? '',
                retailPrice,
                retailSalePrice,
                wholesalePrice,
                wholesaleSalePrice,
                stockQuantity: variant.stockQuantity ?? 0,
                attributes: safeParseAttributes(variant.attributesJson),
            };
        }),
        productImages,
    };
}

function safeParseAttributes(json?: string | null): Record<string, string> {
    if (!json) return {};
    try {
        const parsed = JSON.parse(json);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed as Record<string, string>;
        }
    } catch {
        return {};
    }
    return {};
}

