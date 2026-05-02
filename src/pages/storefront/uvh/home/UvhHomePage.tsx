import {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {ProductCard} from '@/components/shared/card/default/ProductCard.tsx';
import {SfCard} from '@/components/storefront';
import {apiGetShoppingProductsList, apiGetTopBestSellers} from '@/services/graphql/product/product.service.ts';
import type {ProductShoppingListItem} from '@/types/admin/ProductTypes.ts';
import {uvhHomeContent} from '@/pages/storefront/uvh/content/uvhContent.ts';
import {UvhHoldingHero} from '@/pages/storefront/uvh/home/components/UvhHoldingHero.tsx';
import {UvhHomeCategoryShowcases} from '@/pages/storefront/uvh/home/components/UvhHomeCategoryShowcases.tsx';
import {IMAGE_BASE_URL} from "@/constants/api.constant.ts";

const pickFeaturedImage = (product: ProductShoppingListItem): string | undefined => {
    return product.images?.find((img) => img.isFeatured)?.imageUrl ?? product.images?.[0]?.imageUrl;
};

const getDisplayPrice = (product: ProductShoppingListItem): { price: number; originalPrice?: number } => {
    const retail = product.retailPrice?.price ?? 0;
    const retailSale = product.retailSalePrice?.price ?? undefined;

    if (retailSale && retailSale > 0) {
        return {price: retailSale, originalPrice: retail > retailSale ? retail : undefined};
    }
    return {price: retail};
};

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

            <div className="w-full py-8 sm:py-10">
                <UvhHomeCategoryShowcases/>
            </div>

            <section
                className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
                aria-label="Featured and best selling products"
            >
                {loading && <SfCard className="p-8 text-sm text-(--sf-muted-text)">Loading products...</SfCard>}
                {error && !loading && <SfCard className="p-8 text-sm text-(--sf-muted-text)">Error: {error}</SfCard>}
                {!loading && !error && topProducts.length === 0 && (
                    <SfCard className="p-8 text-sm text-(--sf-muted-text)">No featured products available right
                        now.</SfCard>
                )}

                {!loading && !error && topProducts.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {topProducts.map((product) => {
                            const priceInfo = getDisplayPrice(product);
                            return (
                                <ProductCard
                                    key={product.id}
                                    id={product.id}
                                    name={product.name}
                                    price={priceInfo.price}
                                    originalPrice={priceInfo.originalPrice}
                                    image={`${IMAGE_BASE_URL}${pickFeaturedImage(product)}`}
                                />
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-4">
                    <h2 className="text-2xl font-semibold text-(--sf-text)">What customers say</h2>
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                    {uvhHomeContent.testimonials.map((item) => (
                        <SfCard key={item.id} className="p-5">
                            <p className="text-sm text-(--sf-text)">"{item.quote}"</p>
                            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-(--sf-muted-text)">
                                {item.author}
                            </p>
                        </SfCard>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
                <SfCard elevation="sm"
                        className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-(--sf-text)">Buying in bulk?</h2>
                        <p className="mt-1 text-sm text-(--sf-muted-text)">
                            Open a wholesale account for business pricing, bulk ordering, and faster quoting.
                        </p>
                    </div>
                    <Link
                        to="/contact-us"
                        className="inline-flex rounded-md bg-(--sf-accent) px-5 py-2.5 text-sm font-semibold text-(--sf-accent-text)"
                    >
                        Apply for wholesale
                    </Link>
                </SfCard>
            </section>
        </div>
    );
};

export default UvhHomePage;