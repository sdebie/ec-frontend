import {useState} from "react";

import {IMAGE_BASE_URL} from "@/constants/api.constant.ts";
import { useBrands } from '@/features/catalog';
import {Card} from '@/primitives/card';

const resolveBrandLogoSrc = (logoUrl?: string | null): string | null => {
    const cleanLogoUrl = logoUrl?.trim();
    if (!cleanLogoUrl) return null;

    return `${IMAGE_BASE_URL}${cleanLogoUrl}`;
};


export function UvhBrandsSection() {
    const { brands, loading: brandsLoading } = useBrands(30);
    const [brokenBrandLogos, setBrokenBrandLogos] = useState<Record<string, boolean>>({});

    return (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-5">
                <h2 className="text-2xl font-semibold text-(--sf-text)">Brands</h2>
                <span className="mt-3 block h-1 w-18 rounded bg-(--sf-accent)"/>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                {brandsLoading && (
                    Array.from({length: 6}).map((_, index) => (
                        <Card
                            key={`brand-skeleton-${index}`}
                            elevation="none"
                            padded={false}
                            className="flex min-h-24 items-center justify-center rounded-2xl border border-(--sf-border) bg-(--sf-panel) px-4 py-6"
                        >
                            <span className="h-6 w-24 animate-pulse rounded bg-(--sf-surface-muted)"/>
                        </Card>
                    ))
                )}

                {!brandsLoading && brands.length === 0 && (
                    <Card elevation="none" padded={false} className="col-span-full p-5 text-sm text-(--sf-muted-text)">
                        Brand logos will appear here once available.
                    </Card>
                )}

                {!brandsLoading && brands.map((brand) => {
                    const logoSrc = resolveBrandLogoSrc(brand.logoUrl);
                    const showLogo = !!logoSrc && !brokenBrandLogos[brand.id];

                    return (
                        <Card
                            key={brand.id}
                            elevation="none"
                            padded={false}
                            className="flex min-h-16 items-center justify-center rounded-xl border border-(--sf-border) bg-(--sf-panel) px-3 py-3"
                        >
                            {showLogo ? (
                                <img
                                    src={logoSrc}
                                    alt={brand.name}
                                    className="max-h-10 w-full object-contain"
                                    loading="lazy"
                                    onError={() => {
                                        setBrokenBrandLogos((prev) => ({...prev, [brand.id]: true}));
                                    }}
                                />
                            ) : (
                                <p className="text-center text-xs font-semibold uppercase tracking-wide text-(--sf-text)">
                                    {brand.name}
                                </p>
                            )}
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}
