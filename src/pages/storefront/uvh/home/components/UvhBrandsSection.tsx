import {apiGetAllBrands} from '@/services/graphql/admin/brand/BrandService.graphql.ts';
import type {Brand} from '@/types/admin/BrandTypes.ts';
import {IMAGE_BASE_URL} from "@/constants/api.constant.ts";
import {useEffect, useState} from "react";
import {SfCard} from "@/components/storefront";

const resolveBrandLogoSrc = (logoUrl?: string | null): string | null => {
    const cleanLogoUrl = logoUrl?.trim();
    if (!cleanLogoUrl) return null;

    return `${IMAGE_BASE_URL}${cleanLogoUrl}`;
};


export function UvhBrandsSection() {

    const [brands, setBrands] = useState<Brand[]>([]);
    const [brandsLoading, setBrandsLoading] = useState<boolean>(true);
    const [brokenBrandLogos, setBrokenBrandLogos] = useState<Record<string, boolean>>({});

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                setBrandsLoading(true);
                const [allBrands] = await Promise.all([
                    apiGetAllBrands(
                        {pageIndex: 0, pageSize: 30},
                        {filters: [], filterGroups: [], sort: [{field: 'name', direction: 'ASC'}]},
                    ),
                ]);

                if (!mounted) return;

                setBrands(allBrands ?? []);
                setBrokenBrandLogos({});
            } catch (err) {
                if (!mounted) return;
                console.error('Failed to load brands for homepage', {error: err instanceof Error ? err.message : err});
                setBrands([]);
            } finally {
                if (mounted) {
                    setBrandsLoading(false);
                }
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-5">
                <h2 className="text-2xl font-semibold text-(--sf-text)">Brands</h2>
                <span className="mt-3 block h-1 w-18 rounded bg-(--sf-accent)"/>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                {brandsLoading && (
                    Array.from({length: 6}).map((_, index) => (
                        <SfCard
                            key={`brand-skeleton-${index}`}
                            className="flex min-h-24 items-center justify-center rounded-2xl border border-(--sf-border) bg-(--sf-panel) px-4 py-6"
                        >
                            <span className="h-6 w-24 animate-pulse rounded bg-(--sf-surface-muted)"/>
                        </SfCard>
                    ))
                )}

                {!brandsLoading && brands.length === 0 && (
                    <SfCard className="col-span-full p-5 text-sm text-(--sf-muted-text)">
                        Brand logos will appear here once available.
                    </SfCard>
                )}

                {!brandsLoading && brands.map((brand) => {
                    const logoSrc = resolveBrandLogoSrc(brand.logoUrl);
                    const showLogo = !!logoSrc && !brokenBrandLogos[brand.id];

                    return (
                        <SfCard
                            key={brand.id}
                            className="flex min-h-16 items-center justify-center rounded-xl border border-(--sf-border) bg-(--sf-panel) px-3 py-3"
                        >
                            {showLogo ? (
                                <img
                                    src={logoSrc}
                                    alt={brand.name}
                                    className="max-h-6 w-full object-contain"
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
                        </SfCard>
                    );
                })}
            </div>
        </section>
    );
}
