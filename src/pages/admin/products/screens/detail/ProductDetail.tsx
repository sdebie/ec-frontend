import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageContainer } from "@/components";
import { apiGetProductInformation } from "@/services/graphql/product/product.service.ts";
import type { ProductInformation } from "@/types/admin/ProductTypes.ts";
import {IMAGE_BASE_URL} from "@/constants/api.constant.ts";

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
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<ProductInformation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <PageContainer>
            <div className="flex flex-col gap-6">
                {loading && <p>Loading product details...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && !error && !product && <p>Product not found.</p>}

                {!loading && !error && product && (
                    <div className="flex flex-col gap-6">
                        <section className="rounded-lg border border-admin-border bg-admin-bg p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-semibold">{product.productInfo.name ?? "Product"}</h1>
                                    <p className="text-sm text-admin-text-muted">Full product information</p>
                                </div>
                                <div className="text-right text-sm text-admin-text-muted">
                                    <p>Variants: {product.variants?.length ?? 0}</p>
                                    <p>Images: {product.images?.length ?? 0}</p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Product ID</p>
                                    <p className="text-sm text-admin-text break-all">{renderValue(product.productInfo.id)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Slug</p>
                                    <p className="text-sm text-admin-text">{renderValue(product.productInfo.slug)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Product Type</p>
                                    <p className="text-sm text-admin-text">{renderValue(product.productInfo.product_type)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Created</p>
                                    <p className="text-sm text-admin-text">{renderValue(product.productInfo.date_created)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Category ID</p>
                                    <p className="text-sm text-admin-text break-all">{renderValue(product.productInfo.category_is)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Brand ID</p>
                                    <p className="text-sm text-admin-text break-all">{renderValue(product.productInfo.brand_id)}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Description</p>
                                    <p className="text-sm text-admin-text whitespace-pre-wrap">{renderValue(product.productInfo.description)}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Short Description</p>
                                    <p className="text-sm text-admin-text whitespace-pre-wrap">{renderValue(product.productInfo.short_description)}</p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-lg border border-admin-border bg-admin-bg p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <h2 className="text-xl font-semibold">Images</h2>
                                <span className="text-sm text-admin-text-muted">{product.images?.length ?? 0} total</span>
                            </div>

                            {product.images && product.images.length > 0 ? (
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {product.images.map((image, index) => (
                                        <article key={image.id} className="overflow-hidden rounded-lg border border-admin-border bg-admin-bg">
                                            <div className="aspect-4/3 bg-admin-bg">
                                                {image.imageUrl ? (
                                                    <img
                                                        src={resolveImageUrl(image.imageUrl)}
                                                        alt={`${product.productInfo.name ?? "Product"} image ${index + 1}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-sm text-admin-text-muted">
                                                        No image URL
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2 p-4">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Image ID</p>
                                                    <p className="text-sm text-admin-text break-all">{renderValue(image.id)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Image URL</p>
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
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Sort Order</p>
                                                        <p className="text-sm text-admin-text">{renderValue(image.sortOrder)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Featured</p>
                                                        <p className="text-sm text-admin-text">{renderValue(image.isFeatured)}</p>
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
                                <span className="text-sm text-admin-text-muted">{product.variants?.length ?? 0} total</span>
                            </div>

                            {product.variants && product.variants.length > 0 ? (
                                <div className="grid gap-4 xl:grid-cols-2">
                                    {product.variants.map((variant, index) => (
                                        <article key={variant.id} className="rounded-lg border border-admin-border bg-admin-bg p-4">
                                            <div className="mb-3 flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-medium">Variant {index + 1}</h3>
                                                    <p className="text-sm text-admin-text-muted break-all">{renderValue(variant.id)}</p>
                                                </div>
                                                <span className="rounded-full border border-admin-border bg-admin-bg px-3 py-1 text-xs font-medium text-admin-text-muted shadow-sm">
                                                    SKU: {renderValue(variant.sku)}
                                                </span>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Retail Price</p>
                                                    <p className="text-sm text-admin-text">{renderValue(variant.retailPrice)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Retail Sale Price</p>
                                                    <p className="text-sm text-admin-text">{renderValue(variant.retailSalesPrice)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Wholesale Price</p>
                                                    <p className="text-sm text-admin-text">{renderValue(variant.wholesalePrice)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Wholesale Sale Price</p>
                                                    <p className="text-sm text-admin-text">{renderValue(variant.wholesaleSalesPrice)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Stock Quantity</p>
                                                    <p className="text-sm text-admin-text">{renderValue(variant.stockQuantity)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Weight (Kg)</p>
                                                    <p className="text-sm text-admin-text">{renderValue(variant.weightKg)}</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Attributes JSON</p>
                                                    <pre className="overflow-x-auto rounded border border-admin-border bg-admin-bg p-3 text-xs text-admin-text whitespace-pre-wrap">
                                                        {renderValue(variant.attributesJson)}
                                                    </pre>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-admin-text-muted">No variants available.</p>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </PageContainer>
    );
};

export default ProductDetail;