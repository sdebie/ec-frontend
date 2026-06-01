import { FileText } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { UvhTitleHero } from '@/tenants/uvh/components/UvhTitleHero.tsx';
import { UvhProductBreadcrumbs } from '@/tenants/uvh/pages/productdetail/components/UvhProductBreadcrumbs.tsx';
import { UvhProductGallery } from '@/tenants/uvh/pages/productdetail/components/UvhProductGallery.tsx';
import { UvhProductInfoPanel } from '@/tenants/uvh/pages/productdetail/components/UvhProductInfoPanel.tsx';
import { UvhProductRelated } from '@/tenants/uvh/pages/productdetail/components/UvhProductRelated.tsx';
import { parseIdealForLines } from '@/tenants/uvh/pages/productdetail/mapUvhProductDetail.ts';
import { useUvhProductDetail } from '@/tenants/uvh/pages/productdetail/useUvhProductDetail.ts';

import type { UvhDetailVariant } from '@/tenants/uvh/pages/productdetail/mapUvhProductDetail.ts';

type UvhProductDetailProps = {
    productId: string;
    onAddToCart: (variantId: string, unitPrice: number, quantity: number, productName: string) => Promise<void> | void;
};

function UvhProductDetailSkeleton() {
    return (
        <main className="min-h-screen w-full bg-(--sf-bg)">
            <div className="border-b border-(--sf-border) bg-(--sf-surface-muted) py-3">
                <div className="mx-auto h-4 max-w-7xl animate-pulse rounded bg-(--sf-border) px-4 sm:px-6 lg:px-8" />
            </div>
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                    <div className="aspect-square animate-pulse rounded-xl bg-(--sf-border)" />
                    <div className="space-y-4">
                        <div className="h-6 w-1/3 animate-pulse rounded bg-(--sf-border)" />
                        <div className="h-10 w-2/3 animate-pulse rounded bg-(--sf-border)" />
                        <div className="h-8 w-1/4 animate-pulse rounded bg-(--sf-border)" />
                    </div>
                </div>
            </section>
        </main>
    );
}

export function UvhProductDetail({ productId, onAddToCart }: UvhProductDetailProps) {
    const { product, relatedProducts, loading, relatedLoading, error } = useUvhProductDetail(productId);
    const [activeVariant, setActiveVariant] = useState<UvhDetailVariant | undefined>();
    const navigate = useNavigate();

    if (loading) return <UvhProductDetailSkeleton />;

    if (error) {
        return (
            <main className="min-h-screen w-full bg-(--sf-bg)">
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <p className="text-(--sf-error)">{error}</p>
                    <Link className="mt-4 inline-block font-semibold text-(--sf-accent) hover:underline" to="/products">
                        Browse all products
                    </Link>
                </section>
            </main>
        );
    }

    if (!product) {
        return (
            <main className="min-h-screen w-full bg-(--sf-bg)">
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <p className="text-(--sf-muted-text)">Product not found.</p>
                    <Link className="mt-4 inline-block font-semibold text-(--sf-accent) hover:underline" to="/products">
                        Browse all products
                    </Link>
                </section>
            </main>
        );
    }

    const featureLines = parseIdealForLines(product.shortDescription, product.description);

    return (
        <main className="min-h-screen w-full bg-(--sf-bg)">
            <UvhTitleHero
                eyebrow={product.categoryName ?? 'Product'}
                title={product.name}
                contentWidth="wide"
                className="py-3 sm:py-4"
                afterDescription={<UvhProductBreadcrumbs categoryName={product.categoryName} productName={product.name} dark />}
            />

            <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Main product card */}
                <div className="rounded-2xl bg-(--sf-panel) shadow-sm ring-1 ring-(--sf-border) p-4 sm:p-6 lg:p-8">
                    <div className="grid gap-6 md:items-start md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-10">
                        {/* Left column: gallery */}
                        <UvhProductGallery productName={product.name} images={product.productImages} />

                        {/* Right column: purchase panel + accordions — sticky on desktop */}
                        <div className="md:sticky md:top-20 md:max-h-[calc(100vh-5rem)] md:overflow-y-auto">
                            <UvhProductInfoPanel
                                product={product}
                                activeVariant={activeVariant}
                                featureLines={featureLines}
                                onAddToCart={(variantId, unitPrice, quantity) =>
                                    onAddToCart(variantId, unitPrice, quantity, product.name)
                                }
                                onActiveVariantChange={setActiveVariant}
                            />
                        </div>
                    </div>
                </div>

                <UvhProductRelated products={relatedProducts} loading={relatedLoading} />
            </section>

            {/* Bulk / quote CTA banner */}
            <div className="bg-(--sf-nav-bg)">
                <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left sm:px-6 lg:px-8">
                    <p className="text-sm font-medium text-white sm:text-base">
                        Need a large quantity? Get a customised quote for bulk orders.
                    </p>
                    <button
                        type="button"
                        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                        onClick={() => {
                            const subject = encodeURIComponent(`Bulk quote request: ${product.name}`);
                            void navigate(`/contact-us?subject=${subject}`);
                        }}
                    >
                        <FileText className="h-4 w-4" />
                        Request a quote
                    </button>
                </div>
            </div>
        </main>
    );
}
