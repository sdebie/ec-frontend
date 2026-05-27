import { useState } from 'react';
import { Link } from 'react-router-dom';

import { UvhProductBreadcrumbs } from '@/tenants/uvh/pages/productdetail/components/UvhProductBreadcrumbs.tsx';
import { UvhProductGallery } from '@/tenants/uvh/pages/productdetail/components/UvhProductGallery.tsx';
import { UvhProductInfoPanel } from '@/tenants/uvh/pages/productdetail/components/UvhProductInfoPanel.tsx';
import { UvhProductRelated } from '@/tenants/uvh/pages/productdetail/components/UvhProductRelated.tsx';
import { useUvhProductDetail } from '@/tenants/uvh/pages/productdetail/useUvhProductDetail.ts';

import type { UvhDetailVariant } from '@/tenants/uvh/pages/productdetail/mapUvhProductDetail.ts';

type UvhProductDetailProps = {
    productId: string;
    onAddToCart: (variantId: string, unitPrice: number, quantity: number) => Promise<void> | void;
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
    const { product, relatedProducts, config, loading, relatedLoading, error } = useUvhProductDetail(productId);
    const [activeVariant, setActiveVariant] = useState<UvhDetailVariant | undefined>();

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

    return (
        <main className="min-h-screen w-full bg-(--sf-bg)">
            <UvhProductBreadcrumbs categoryName={product.categoryName} productName={product.name} />

            <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-5 shadow-sm sm:p-8">
                    <div className="grid gap-8 lg:items-start lg:gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                        <UvhProductGallery productName={product.name} images={product.productImages} />
                        <UvhProductInfoPanel
                            product={product}
                            activeVariant={activeVariant}
                            config={config}
                            onAddToCart={onAddToCart}
                            onActiveVariantChange={setActiveVariant}
                        />
                    </div>
                </div>

                <UvhProductRelated products={relatedProducts} loading={relatedLoading} />
            </section>
        </main>
    );
}
