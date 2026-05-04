import {useEffect, useMemo, useState} from 'react';
import {apiGetShoppingProductsList, apiGetTopBestSellers} from '@/services/graphql/product/product.service.ts';
import type {ProductShoppingListItem} from '@/types/admin/ProductTypes.ts';
import {uvhHomeContent} from '@/pages/storefront/uvh/content/uvhContent.ts';
import {UvhFeaturedBestSellers} from '@/pages/storefront/uvh/home/components/UvhFeaturedBestSellers.tsx';
import {UvhBrandsSection} from '@/pages/storefront/uvh/home/components/UvhBrandsSection.tsx';
import {UvhGetQuoteCta} from '@/pages/storefront/uvh/home/components/UvhGetQuoteCta.tsx';
import {UvhHoldingHero} from '@/pages/storefront/uvh/home/components/UvhHoldingHero.tsx';
import {UvhHomeCategoryShowcases} from '@/pages/storefront/uvh/home/components/UvhHomeCategoryShowcases.tsx';
import {UvhWholesaleCta} from "@/pages/storefront/uvh/home/components/UvhWholesaleCta.tsx";
import {UvhAccreditorsSection} from "@/pages/storefront/uvh/home/components/UvhAccreditorsSection.tsx";
import {UvhCustomerReviewsSection} from "@/pages/storefront/uvh/home/components/UvhCustomerReviewsSection.tsx";

const UvhHomePage = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [bestSellers, setBestSellers] = useState<ProductShoppingListItem[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<ProductShoppingListItem[]>([]);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                const [bestSellerResult, shoppingResult] = await Promise.all([
                    apiGetTopBestSellers(),
                    apiGetShoppingProductsList(),
                ]);

                if (!mounted) return;

                setBestSellers(bestSellerResult ?? []);
                setFeaturedProducts(shoppingResult ?? []);
            } catch (err) {
                if (!mounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load homepage data.');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => {
            mounted = false;
        };
    }, []);

    const topProducts = useMemo(() => {
        const source = bestSellers.length > 0 ? bestSellers : featuredProducts;
        return source.slice(0, 8);
    }, [bestSellers, featuredProducts]);

    return (
        <div className="w-full bg-(--sf-bg)">
            <UvhHoldingHero/>

            <section className="w-full bg-[linear-gradient(115deg,#04070d_0%,#080b12_52%,#2a0010_100%)] py-8 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
                            <span className="mr-2 inline-block h-px w-5 align-middle bg-(--sf-accent)"/>
                            Trust & Reassurance
                        </p>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Trust & Reassurance</h2>
                        <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
                            Clear communication, secure checkout, and support when you need it.
                        </p>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {uvhHomeContent.trustPoints.map((point) => (
                            <div
                                key={point.id}
                                className="rounded-xl border border-white/12 bg-white/6 p-4 shadow-[0_12px_28px_rgba(0,0,0,0.25)] backdrop-blur-[1px]"
                            >
                                <h3 className="text-base font-semibold text-white">{point.title}</h3>
                                <p className="mt-1 text-sm leading-relaxed text-white/85">{point.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <UvhFeaturedBestSellers products={topProducts} loading={loading} error={error}/>

            <UvhGetQuoteCta/>

            <UvhBrandsSection/>

            <UvhHomeCategoryShowcases/>

            <UvhWholesaleCta/>

            <UvhAccreditorsSection/>

            <UvhCustomerReviewsSection/>
        </div>
    );
};

export default UvhHomePage;