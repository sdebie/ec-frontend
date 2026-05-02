import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/shared/card/default/ProductCard.tsx';
import { SfCard } from '@/components/storefront';
import { apiGetShoppingProductsList, apiGetTopBestSellers } from '@/services/graphql/product/product.service.ts';
import type { ProductShoppingListItem } from '@/types/admin/ProductTypes.ts';
import { uvhHomeContent } from '@/pages/storefront/uvh/content/uvhContent.ts';
import { UvhHomeCategoryShowcases } from '@/pages/storefront/uvh/home/UvhHomeCategoryShowcases.tsx';
import {IMAGE_BASE_URL} from "@/constants/api.constant.ts";

const pickFeaturedImage = (product: ProductShoppingListItem): string | undefined => {
  return product.images?.find((img) => img.isFeatured)?.imageUrl ?? product.images?.[0]?.imageUrl;
};

const getDisplayPrice = (product: ProductShoppingListItem): { price: number; originalPrice?: number } => {
  const retail = product.retailPrice?.price ?? 0;
  const retailSale = product.retailSalePrice?.price ?? undefined;

  if (retailSale && retailSale > 0) {
    return { price: retailSale, originalPrice: retail > retailSale ? retail : undefined };
  }
  return { price: retail };
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
      <section className="border-b border-(--sf-border) bg-gradient-to-b from-(--sf-panel) to-(--sf-surface-muted)">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.35fr_1fr] lg:px-8 lg:py-14">
          <div className="flex flex-col gap-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--sf-accent)">
            Wholesale & Retail Supplier
          </p>
          <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-(--sf-text) sm:text-4xl">
            {uvhHomeContent.hero.title}
          </h1>
          <p className="max-w-4xl text-base text-(--sf-muted-text) sm:text-lg">
            {uvhHomeContent.hero.subtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to={uvhHomeContent.hero.primaryCta.to}
              className="rounded-md bg-(--sf-accent) px-5 py-2.5 text-sm font-semibold text-(--sf-accent-text)"
            >
              {uvhHomeContent.hero.primaryCta.label}
            </Link>
            <Link
              to={uvhHomeContent.hero.secondaryCta.to}
              className="rounded-md border border-(--sf-border) bg-(--sf-bg) px-5 py-2.5 text-sm font-semibold text-(--sf-text)"
            >
              {uvhHomeContent.hero.secondaryCta.label}
            </Link>
          </div>
          </div>
          <SfCard elevation="sm" className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--sf-accent)">Why teams choose UVH</p>
            <div className="mt-4 space-y-4">
              {uvhHomeContent.highlights.map((item) => (
                <div key={item.id} className="rounded-xl border border-(--sf-border) bg-(--sf-surface-muted) p-4">
                  <h2 className="text-base font-semibold text-(--sf-text)">{item.title}</h2>
                  <p className="mt-1 text-sm text-(--sf-muted-text)">{item.description}</p>
                </div>
              ))}
            </div>
          </SfCard>
        </div>
      </section>

      <div className="w-full py-8 sm:py-10">
        <UvhHomeCategoryShowcases />
      </div>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-semibold text-(--sf-text)">Featured / Best Sellers</h2>
          <Link to="/products" className="text-sm font-semibold text-(--sf-accent)">
            Browse catalog
          </Link>
        </div>

        {loading && <SfCard className="p-8 text-sm text-(--sf-muted-text)">Loading products...</SfCard>}
        {error && !loading && <SfCard className="p-8 text-sm text-(--sf-muted-text)">Error: {error}</SfCard>}
        {!loading && !error && topProducts.length === 0 && (
          <SfCard className="p-8 text-sm text-(--sf-muted-text)">No featured products available right now.</SfCard>
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

      <section className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-(--sf-text)">Trust & Support</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {uvhHomeContent.trustPoints.map((point) => (
            <SfCard key={point.id} className="p-5">
              <h3 className="text-base font-semibold text-(--sf-text)">{point.title}</h3>
              <p className="mt-2 text-sm text-(--sf-muted-text)">{point.description}</p>
            </SfCard>
          ))}
        </div>
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
        <SfCard elevation="sm" className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
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