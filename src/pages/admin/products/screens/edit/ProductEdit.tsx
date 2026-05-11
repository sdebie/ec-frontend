import {useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {Button, Input, PageContainer, Select, Textarea, toast} from "@/components";
import {apiGetProductInformation, apiUpdateProductInformation} from "@/services/graphql/product/product.service.ts";
import type {ProductInformation, ProductVariant, VariantPrice} from "@/types/admin/ProductTypes.ts";
import {ProductTypeOptions} from "@/constants/enums/ProductType.ts";

type EditableProduct = {
	product: NonNullable<ProductInformation["product"]>;
	variants: NonNullable<ProductInformation["variants"]>;
};

const PRICE_TYPES = [
	{value: "RETAIL_PRICE", label: "Retail Price"},
	{value: "RETAIL_SALE_PRICE", label: "Retail Sale Price"},
	{value: "WHOLESALE_PRICE", label: "Wholesale Price"},
	{value: "WHOLESALE_SALE_PRICE", label: "Wholesale Sale Price"},
] as const;

const normalizePrices = (prices?: VariantPrice[] | null): VariantPrice[] =>
	PRICE_TYPES.map(({value}) => {
		const existing = prices?.find((price) => price.priceType === value);
		return existing ?? {
			id: "",
			priceType: value,
			price: null,
			priceStartDate: null,
			priceEndDate: null,
			isActive: null,
			saleDaysRemaining: null,
		};
	});

const normalizeProduct = (product: ProductInformation | null): EditableProduct | null => {
	if (!product?.product) return null;

	return {
		product: {
			...product.product,
			categories: product.product.categories ?? [],
			brand: product.product.brand ?? null,
		},
		variants: (product.variants ?? []).map((variant) => ({
			...variant,
			sku: variant.sku ?? "",
			stockQuantity: variant.stockQuantity ?? 0,
			weightKg: variant.weightKg ?? "",
			attributesJson: variant.attributesJson ?? "",
			prices: normalizePrices(variant.prices),
			images: variant.images ?? [],
		})),
	};
};

const ProductEdit = () => {
	const {id} = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [product, setProduct] = useState<EditableProduct | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const productTypeOptions = useMemo(() => ProductTypeOptions.map((option) => ({
		label: option.label,
		value: option.value,
	})), []);

	useEffect(() => {
		let cancelled = false;

		const loadProduct = async () => {
			setLoading(true);
			setError(null);

			try {
				if (!id) {
					if (!cancelled) setError("Missing product id");
					return;
				}

				const result = await apiGetProductInformation(id);
				if (!cancelled) {
					const normalized = normalizeProduct(result);
					setProduct(normalized);
					if (!normalized) {
						setError("Product not found.");
					}
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

		void loadProduct();

		return () => {
			cancelled = true;
		};
	}, [id]);

	const updateProductField = <K extends keyof EditableProduct["product"]>(field: K, value: EditableProduct["product"][K]) => {
		setProduct((current) => {
			if (!current) return current;
			return {
				...current,
				product: {
					...current.product,
					[field]: value,
				},
			};
		});
	};

	const updateVariantField = <K extends keyof ProductVariant>(variantIndex: number, field: K, value: ProductVariant[K]) => {
		setProduct((current) => {
			if (!current) return current;
			return {
				...current,
				variants: current.variants.map((variant, index) =>
					index === variantIndex ? {...variant, [field]: value} : variant
				),
			};
		});
	};

	const updateVariantPrice = (variantIndex: number, priceType: VariantPrice["priceType"], value: string) => {
		setProduct((current) => {
			if (!current) return current;
			return {
				...current,
				variants: current.variants.map((variant, index) => {
					if (index !== variantIndex) return variant;

					return {
						...variant,
						prices: (variant.prices ?? []).map((price) =>
							price.priceType === priceType
								? {...price, price: value === "" ? null : Number(value)}
								: price
						),
					};
				}),
			};
		});
	};

	const handleClose = () => {
		if (id) {
			navigate(`/admin/product/detail/${id}`);
			return;
		}
		navigate(-1);
	};

	const handleSave = async () => {
		if (!id || !product) return;

		setSaving(true);
		setError(null);

		try {
			await apiUpdateProductInformation(id, {
				product: {
					...product.product,
					categories: product.product.categories ?? [],
					brand: product.product.brand ?? null,
				},
				variants: product.variants.map((variant) => ({
					...variant,
					sku: variant.sku ?? "",
					prices: (variant.prices ?? []).filter((price) => price.priceType && price.price !== null),
				})),
			} as ProductInformation);

			toast.success("Product updated successfully!");
			navigate(`/admin/product/detail/${id}`);
		} catch (e: any) {
			setError(e?.message ?? "Failed to update product");
		} finally {
			setSaving(false);
		}
	};

	return (
		<PageContainer>
			<div className="flex flex-col gap-6">
				<div className="flex items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-semibold">Edit Product</h1>
						<p className="text-sm text-admin-text-muted">Update product details and variant pricing. SKU is read-only.</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="ghost" onClick={handleClose} disabled={loading || saving}>Cancel</Button>
						<Button variant="solid" onClick={handleSave} disabled={loading || saving || !product}>Save Changes</Button>
					</div>
				</div>

				{loading && <p>Loading product details...</p>}
				{error && <p className="text-red-500">{error}</p>}
				{!loading && !error && !product && <p>Product not found.</p>}

				{!loading && !error && product && (
					<div className="flex flex-col gap-6">
						<section className="rounded-lg border border-admin-border bg-admin-bg p-6 shadow-sm">
							<div className="grid gap-4 md:grid-cols-2">
								<Input
									label="Product Name"
									value={product.product.name ?? ""}
									onChange={(e) => updateProductField("name", e.target.value)}
									placeholder="Product name"
								/>
								<Input
									label="Slug"
									value={product.product.slug ?? ""}
									onChange={(e) => updateProductField("slug", e.target.value)}
									placeholder="product-slug"
								/>
								<Select
									label="Product Type"
									options={productTypeOptions}
									value={product.product.productType ?? ""}
									onChange={(value) => updateProductField("productType", value)}
									placeholder="Select product type"
								/>
								<div />
								<div className="md:col-span-2">
									<Textarea
										label="Short Description"
										value={product.product.shortDescription ?? ""}
										onChange={(e) => updateProductField("shortDescription", e.target.value)}
										placeholder="Short description"
									/>
								</div>
								<div className="md:col-span-2">
									<Textarea
										label="Description"
										value={product.product.description ?? ""}
										onChange={(e) => updateProductField("description", e.target.value)}
										placeholder="Description"
									/>
								</div>
							</div>
						</section>

						<section className="rounded-lg border border-admin-border bg-admin-bg p-6 shadow-sm">
							<div className="mb-4 flex items-center justify-between gap-4">
								<h2 className="text-xl font-semibold">Product Variants</h2>
								<span className="text-sm text-admin-text-muted">SKU is locked; pricing is editable</span>
							</div>

							{product.variants.length > 0 ? (
								<div className="grid gap-4 xl:grid-cols-2">
									{product.variants.map((variant, variantIndex) => (
										<article key={variant.id ?? `${variantIndex}`} className="rounded-lg border border-admin-border bg-admin-bg p-4">
											<div className="mb-4 grid gap-4 md:grid-cols-2">
												<Input
													label="SKU"
													value={variant.sku ?? ""}
													disabled
													placeholder="SKU cannot be changed"
												/>
												<Input
													label="Stock Quantity"
													type="number"
													value={variant.stockQuantity ?? ""}
													onChange={(e) => updateVariantField(variantIndex, "stockQuantity", e.target.value === "" ? null : Number(e.target.value))}
													placeholder="0"
												/>
												<Input
													label="Weight (Kg)"
													value={variant.weightKg ?? ""}
													onChange={(e) => updateVariantField(variantIndex, "weightKg", e.target.value)}
													placeholder="0.00"
												/>
												<div />
												<div className="md:col-span-2">
													<Textarea
														label="Attributes JSON"
														value={variant.attributesJson ?? ""}
														onChange={(e) => updateVariantField(variantIndex, "attributesJson", e.target.value)}
														placeholder='{"color":"Red","size":"XL"}'
													/>
												</div>
											</div>

											<div>
												<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Pricing</p>
												<div className="overflow-x-auto rounded border border-admin-border">
													<table className="min-w-full text-left text-sm">
														<thead className="bg-admin-bg border-b border-admin-border">
														<tr>
															<th className="px-3 py-2 font-semibold text-admin-text-muted">Type</th>
															<th className="px-3 py-2 font-semibold text-admin-text-muted">Price</th>
															<th className="px-3 py-2 font-semibold text-admin-text-muted">Active</th>
															<th className="px-3 py-2 font-semibold text-admin-text-muted">Range</th>
														</tr>
														</thead>
														<tbody>
														{(variant.prices ?? []).map((price) => (
															<tr key={`${variant.id ?? variantIndex}-${price.priceType}`} className="border-b border-admin-border last:border-b-0">
																<td className="px-3 py-2 text-admin-text">{price.priceType}</td>
																<td className="px-3 py-2 text-admin-text">
																	<Input
																		type="number"
																		step="0.01"
																		value={price.price ?? ""}
																		onChange={(e) => updateVariantPrice(variantIndex, price.priceType, e.target.value)}
																		placeholder="0.00"
																	/>
																</td>
																<td className="px-3 py-2 text-admin-text">{price.isActive ? "Yes" : "No"}</td>
																<td className="px-3 py-2 text-xs text-admin-text-muted">
																	{price.priceStartDate ?? "—"} → {price.priceEndDate ?? "—"}
																</td>
															</tr>
														))}
														</tbody>
													</table>
												</div>
											</div>
										</article>
									))}
								</div>
							) : (
								<p className="text-sm text-admin-text-muted">No variants available.</p>
							)}
						</section>

						<section className="rounded-lg border border-admin-border bg-admin-bg p-6 shadow-sm">
							<div className="mb-4 flex items-center justify-between gap-4">
								<div>
									<h2 className="text-xl font-semibold">Categories & Brand</h2>
									<p className="text-sm text-admin-text-muted">Read-only in this screen, preserved on save.</p>
								</div>
							</div>

							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted">Brand</p>
									<p className="text-sm text-admin-text">{product.product.brand ? `${product.product.brand.name ?? ""}${product.product.brand.slug ? ` (${product.product.brand.slug})` : ""}` : "N/A"}</p>
								</div>
								<div className="md:col-span-2">
									<p className="text-xs font-semibold uppercase tracking-wide text-admin-text-muted mb-2">Categories</p>
									{(product.product.categories ?? []).length > 0 ? (
										<div className="flex flex-wrap gap-2">
											{(product.product.categories ?? []).map((category) => (
												<span key={category.id} className="rounded-full border border-admin-border px-3 py-1 text-sm text-admin-text">
													{category.name ?? category.slug ?? category.id}
												</span>
											))}
										</div>
									) : (
										<p className="text-sm text-admin-text-muted">No categories assigned.</p>
									)}
								</div>
							</div>
						</section>
					</div>
				)}
			</div>
		</PageContainer>
	);
};

export default ProductEdit