import { pickVariantPriceByType } from '@/features/catalog/utils/pricing.ts';

import type { CatalogProductInformation } from '@/features/catalog/types.ts';

export type UvhDetailVariant = {
    id: string;
    sku: string;
    stockQuantity: number;
    weightKg: string | null;
    attributes: Record<string, string>;
    retailPrice: number;
    retailSalePrice: number | null;
    wholesalePrice: number;
    wholesaleSalePrice: number | null;
};

export type UvhDetailProduct = {
    id: string;
    name: string;
    shortDescription: string;
    description: string;
    categoryName: string;
    categoryId: string | null;
    variants: UvhDetailVariant[];
    productImages: { id: string; imageUrl: string }[];
};

export function mapUvhProductDetail(product: CatalogProductInformation | null): UvhDetailProduct | null {
    if (!product?.product) return null;

    const variants = product.variants ?? [];
    const productImages = variants
        .flatMap((variant) => variant.images ?? [])
        .map((img) => ({ id: img.id, imageUrl: img.imageUrl }));

    const primaryCategory = product.product.categories?.[0];

    return {
        id: product.product.id,
        name: product.product.name ?? 'Product',
        shortDescription: product.product.shortDescription ?? '',
        description: product.product.description ?? '',
        categoryName: primaryCategory?.name ?? 'Products',
        categoryId: primaryCategory?.id ?? null,
        variants: variants.map((variant) => {
            const retailPrice = pickVariantPriceByType(variant.prices, 'RETAIL_PRICE') ?? 0;
            const retailSalePrice = pickVariantPriceByType(variant.prices, 'RETAIL_SALE_PRICE');
            const wholesalePrice = pickVariantPriceByType(variant.prices, 'WHOLESALE_PRICE') ?? 0;
            const wholesaleSalePrice = pickVariantPriceByType(variant.prices, 'WHOLESALE_SALE_PRICE');

            return {
                id: variant.id,
                sku: variant.sku ?? '',
                retailPrice,
                retailSalePrice,
                wholesalePrice,
                wholesaleSalePrice,
                stockQuantity: variant.stockQuantity ?? 0,
                weightKg: variant.weightKg ?? null,
                attributes: safeParseAttributes(variant.attributesJson),
            };
        }),
        productImages,
    };
}

export function safeParseAttributes(json?: string | null): Record<string, string> {
    if (!json) return {};
    try {
        const parsed = JSON.parse(json) as unknown;
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed as Record<string, string>;
        }
    } catch {
        return {};
    }
    return {};
}

export function buildSpecificationRows(
    variant: UvhDetailVariant | undefined,
    productName: string,
): { label: string; value: string }[] {
    if (!variant) return [];

    const rows: { label: string; value: string }[] = [
        { label: 'Product', value: productName },
        { label: 'SKU', value: variant.sku || '—' },
    ];

    if (variant.weightKg) {
        rows.push({ label: 'Weight', value: `${variant.weightKg} kg` });
    }

    Object.entries(variant.attributes).forEach(([key, value]) => {
        rows.push({ label: key, value });
    });

    return rows;
}

export function parseIdealForLines(shortDescription: string, description: string): string[] {
    const source = shortDescription.trim() || description.trim();
    if (!source) return [];

    const lines = source
        .split(/\n|•|·|–/)
        .map((line) => line.replace(/^[-*]\s*/, '').trim())
        .filter((line) => line.length > 2 && line.length < 80);

    return lines.slice(0, 6);
}
