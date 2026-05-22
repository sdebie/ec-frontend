import {ArrowLeft} from "lucide-react";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";

import {PageLayout} from '@/components';
import {IMAGE_BASE_URL} from "@/constants/api.constant.ts";
import {useFormatAmount} from "@/hooks/useFormatAmount.ts";
import {apiGetStoreSettings} from "@/services/graphql/admin/settings/SettingsService.graphql.ts";
import {apiGetProductInformation} from "@/services/graphql/product/product.service.ts";
import {calculateVatFromExclusive, parseVatRate} from "@/utils/vat.ts";

import type {ProductInformation} from "@/types/admin/ProductTypes.ts";

const renderValue = (value?: string | number | boolean | null) => {
    if (value === null || value === undefined || value === "") {
        return "N/A";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    return String(value);
};

const resolveImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) {
        return "";
    }

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        return imageUrl;
    }

    return `${IMAGE_BASE_URL}${imageUrl}`;
};

const ProductDetail = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {format: formatAmount} = useFormatAmount();
    const [product, setProduct] = useState<ProductInformation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [vatRatePercent, setVatRatePercent] = useState(15);

    useEffect(() => {
        let cancelled = false;

        const loadProduct = async () => {
            setLoading(true);
            setError(null);

            try {
                if (!id) {
                    if (!cancelled) {
                        setProduct(null);
                        setError("Missing product id");
                    }
                    return;
                }

                const result = await apiGetProductInformation(id);
                if (!cancelled) {
                    setProduct(result);
                }
            } catch (e: any) {
                if (!cancelled) {
                    setError(e?.message ?? "Failed to load product details");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadProduct();

        return () => {
            cancelled = true;
        };
    }, [id]);

    useEffect(() => {
        let cancelled = false;

        const loadVatSetting = async () => {
            try {
                const settings = await apiGetStoreSettings();
                const vatSetting = settings.find((setting) => setting.key === "vat_rate_percent");
                const parsedVatRate = parseVatRate(vatSetting?.value);
                if (!cancelled) {
                    setVatRatePercent(parsedVatRate);
                }
            } catch {
                // Keep default VAT if settings fail to load.
            }
        };

        loadVatSetting();

        return () => {
            cancelled = true;
        };
    }, []);

    const variantImages = (product?.variants ?? []).flatMap(variant => variant.images ?? []);

    return (
        <PageLayout
            title="Product Detail"
            action={(
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-sm text-admin-text-muted hover:text-admin-text"
                >
                    <ArrowLeft size={16}/> Back
                </button>
            )}
        >
            <div className="flex flex-col gap-6">
                {loading && <p>Loading product details...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && !product && <p>Product not found.</p>}

                {!loading && !error && product && (
                    <div className="flex flex-col gap-6">
                        <section className="rounded-lg border border-admin-border bg-admin-bg p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-semibold">{product.product?.name ?? "Product"}</h2>
                                    <p className="text-sm text-admin-text-muted">Full product information</p>
                                </div>
                                <div className="text-right text-sm text-admin-text-muted">
                                    <p>Variants: {product.variants?.length ?? 0}</p>
                                    <p>Images: {variantImages.length}</p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Product ID
                                    </p>
                                    <p className="text-sm text-admin-text break-all">{
                                        renderValue(product.product?.id)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">
                                        Slug
                                    </p>
                                    <p className="text-sm text-admin-text">
                                        {renderValue(product.product?.slug)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">
                                        Product Type
                                    </p>
                                    <p className="text-sm text-admin-text">
                                        {renderValue(product.product?.productType)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">
                                        Created
                                    </p>
                                    <p className="text-sm text-admin-text">
                                        {renderValue(product.product?.createdAt)}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted mb-2">Categories</p>
                                    {product.product?.categories && product.product.categories.length > 0 ? (
                                        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                                            {product.product.categories.map((category) => (
                                                <div key={category.id} className="rounded border border-admin-border bg-admin-bg p-3">
                                                    <p className="text-sm font-medium text-admin-text">
                                                        {renderValue(category.name)}
                                                    </p>
                                                    <p className="text-xs text-admin-text-muted break-all">
                                                        {renderValue(category.slug)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-admin-text-muted">No categories assigned.</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Brand</p>
                                    <p className="text-sm text-admin-text break-all">
                                        {product.product?.brand
                                            ? `${product.product.brand.name ?? ""}${product.product.brand.slug ? ` (${product.product.brand.slug})` : ""}`
                                            : "N/A"}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">
                                        Description
                                    </p>
                                    <p className="text-sm text-admin-text whitespace-pre-wrap">
                                        {renderValue(product.product?.description)}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">
                                        Short Description
                                    </p>
                                    <p className="text-sm text-admin-text whitespace-pre-wrap">
                                        {renderValue(product.product?.shortDescription)}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-lg border border-admin-border bg-admin-bg p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <h2 className="text-xl font-semibold">Images</h2>
                                <span className="text-sm text-admin-text-muted">{variantImages.length} total</span>
                            </div>

                            {variantImages.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {variantImages.map((image, index) => (
                                        <article key={image.id ?? `${image.imageUrl}-${index}`}
                                                 className="overflow-hidden rounded-lg border border-admin-border bg-admin-bg">
                                            <div className="aspect-4/3 bg-admin-bg">
                                                {image.imageUrl ? (
                                                    <img
                                                        src={resolveImageUrl(image.imageUrl)}
                                                        alt={`${product.product?.name ?? "Product"} image ${index + 1}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div
                                                        className="flex h-full items-center justify-center text-sm text-admin-text-muted">
                                                        No image URL
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2 p-4">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">
                                                        Image ID
                                                    </p>
                                                    <p className="text-sm text-admin-text break-all">{renderValue(image.id)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">
                                                        Image URL
                                                    </p>
                                                    <a
                                                        href={resolveImageUrl(image.imageUrl)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="break-all text-sm text-primary hover:underline"
                                                    >
                                                        {renderValue(image.imageUrl)}
                                                    </a>
                                                </div>
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">
                                                            Sort Order
                                                        </p>
                                                        <p className="text-sm text-admin-text">
                                                            {renderValue(image.sortOrder)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">
                                                            Featured
                                                        </p>
                                                        <p className="text-sm text-admin-text">
                                                            {renderValue(image.isFeatured)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-admin-text-muted">No images available.</p>
                            )}
                        </section>

                        <section className="rounded-lg border border-admin-border bg-admin-bg p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <h2 className="text-xl font-semibold">Variants</h2>
                                <span
                                    className="text-sm text-admin-text-muted">{product.variants?.length ?? 0} total</span>
                            </div>

                            {product.variants && product.variants.length > 0 ? (
                                <div className="grid gap-4 xl:grid-cols-2">
                                    {product.variants.map((variant, index) => {
                                        return (
                                            <article key={variant.id}
                                                     className="rounded-lg border border-admin-border bg-admin-bg p-4">
                                                <div className="mb-3 flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="text-lg font-medium">Variant {index + 1}</h3>
                                                        <p className="text-sm text-admin-text-muted break-all">
                                                            {renderValue(variant.id)}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className="rounded-full border border-admin-border bg-admin-bg px-3 py-1 text-xs font-medium text-admin-text-muted shadow-sm">
                                                    SKU: {renderValue(variant.sku)}
                                                </span>
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">
                                                            Stock Quantity
                                                        </p>
                                                        <p className="text-sm text-admin-text">
                                                            {renderValue(variant.stockQuantity)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">
                                                            Weight (Kg)
                                                        </p>
                                                        <p className="text-sm text-admin-text">
                                                            {renderValue(variant.weightKg)}
                                                        </p>
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-admin-text-muted">
                                                            Pricing
                                                        </p>
                                                        {variant.prices && variant.prices.length > 0 ? (
                                                            <div
                                                                className="overflow-x-auto rounded border border-admin-border">
                                                                <table className="min-w-full text-left text-sm">
                                                                    <thead
                                                                        className="bg-admin-bg border-b border-admin-border">
                                                                    <tr>
                                                                        <th className="px-3 py-2 font-semibold text-admin-text-muted">Type</th>
                                                                        <th className="px-3 py-2 font-semibold text-admin-text-muted">Price</th>
                                                                        <th className="px-3 py-2 font-semibold text-admin-text-muted">Active</th>
                                                                        <th className="px-3 py-2 font-semibold text-admin-text-muted">Sale
                                                                            Days Left
                                                                        </th>
                                                                        <th className="px-3 py-2 font-semibold text-admin-text-muted">Start</th>
                                                                        <th className="px-3 py-2 font-semibold text-admin-text-muted">End</th>
                                                                    </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                    {variant.prices.map((price) => (
                                                                        <tr key={price.id} className="border-b border-admin-border last:border-b-0">
                                                                            <td className="px-3 py-2 text-admin-text">
                                                                                {renderValue(price.priceType)}
                                                                            </td>
                                                                            <td className="px-3 py-2 text-admin-text">
                                                                                {typeof price.price === "number" ? (
                                                                                    <div>
                                                                                        <p>{formatAmount(price.price)} <span className="text-xs text-admin-text-muted">ex VAT</span></p>
                                                                                        <p className="text-xs text-admin-text-muted">
                                                                                            {formatAmount(calculateVatFromExclusive(price.price, vatRatePercent).totalIncludingVat)} inc VAT ({vatRatePercent}%)
                                                                                        </p>
                                                                                    </div>
                                                                                ) : renderValue(price.price)}
                                                                            </td>
                                                                            <td className="px-3 py-2 text-admin-text">
                                                                                {renderValue(price.isActive)}
                                                                            </td>
                                                                            <td className="px-3 py-2 text-admin-text">
                                                                                {renderValue(price.saleDaysRemaining)}
                                                                            </td>
                                                                            <td className="px-3 py-2 text-admin-text">
                                                                                {renderValue(price.priceStartDate)}
                                                                            </td>
                                                                            <td className="px-3 py-2 text-admin-text">
                                                                                {renderValue(price.priceEndDate)}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-admin-text-muted">
                                                                No pricing available.
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">
                                                            Attributes JSON
                                                        </p>
                                                        <pre
                                                            className="overflow-x-auto rounded border border-admin-border bg-admin-bg p-3 text-xs text-admin-text whitespace-pre-wrap">
                                                        {renderValue(variant.attributesJson)}
                                                    </pre>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-admin-text-muted">No variants available.</p>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </PageLayout>
    );
};

export default ProductDetail;

