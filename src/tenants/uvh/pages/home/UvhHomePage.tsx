import { useMemo } from 'react';

import { useProducts, useTopBestSellers } from '@/features/catalog';
import {uvhHomeContent} from '@/tenants/uvh/content/uvhContent.ts';
import {
    FROSTED_CARD,
    UvhGradientTrustBand,
} from '@/tenants/uvh/components/UvhGradientTrustBand.tsx';
import {UvhAccreditorsSection} from "@/tenants/uvh/pages/home/components/UvhAccreditorsSection.tsx";
import {UvhBrandsSection} from '@/tenants/uvh/pages/home/components/UvhBrandsSection.tsx';
import {UvhCustomerReviewsSection} from "@/tenants/uvh/pages/home/components/UvhCustomerReviewsSection.tsx";
import {UvhFeaturedBestSellers} from '@/tenants/uvh/pages/home/components/UvhFeaturedBestSellers.tsx';
import {UvhGetQuoteCta} from '@/tenants/uvh/pages/home/components/UvhGetQuoteCta.tsx';
import {UvhHoldingHero} from '@/tenants/uvh/pages/home/components/UvhHoldingHero.tsx';
import {UvhHomeCategoryShowcases} from '@/tenants/uvh/pages/home/components/UvhHomeCategoryShowcases.tsx';
import {UvhWholesaleCta} from "@/tenants/uvh/pages/home/components/UvhWholesaleCta.tsx";

const UvhHomePage = () => {
    const { products: bestSellers, loading: bestSellerLoading, error: bestSellerError } = useTopBestSellers();
    const { products: featuredProducts, loading: featuredLoading, error: featuredError } = useProducts({
        pageIndex: 0,
        pageSize: 24,
        sortBy: 'name',
    });

    const topProducts = useMemo(() => {
        const source = bestSellers.length > 0 ? bestSellers : featuredProducts;
        return source.slice(0, 8);
    }, [bestSellers, featuredProducts]);

    const loading = bestSellerLoading || featuredLoading;
    const error = bestSellerError || featuredError;

    return (
        <div className="w-full bg-(--sf-bg)">
            <UvhHoldingHero/>

            <UvhGradientTrustBand
                eyebrow="Trust & Reassurance"
                intro="Clear communication, secure checkout, and support when you need it."
                title="Trust & Reassurance"
            >
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {uvhHomeContent.trustPoints.map((point) => (
                        <div key={point.id} className={FROSTED_CARD}>
                            <h3 className="text-sm font-semibold text-white">{point.title}</h3>
                            <p className="mt-1 text-xs leading-relaxed text-white/85">{point.description}</p>
                        </div>
                    ))}
                </div>
            </UvhGradientTrustBand>

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