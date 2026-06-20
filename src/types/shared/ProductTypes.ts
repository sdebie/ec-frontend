export type ProductImage = {
    id: string;
    imageUrl: string;
    sortOrder?: number | null;
    isFeatured?: boolean | null;
};

export type ProductListItem = {
    id: string;
    name: string;
    description?: string | null;
    imageName?: string | null;
    variantIds?: string[] | null;
    categoryNames?: string[] | null;
    brandName?: string | null;
    status?: string | null;
};

export type ProductShoppingListItem = {
     id: string;
     name: string;
     shortDescription?: string | null;
     productType?: string | null;
     variantCount?: number | null;
     variantId?: string | null;
     images?: ProductImage[] | null;
     retailPrice?: VariantPrice | null;
     wholesalePrice?: VariantPrice | null;
     retailSalePrice?: VariantPrice | null;
     wholesaleSalePrice?: VariantPrice | null;
     status?: string | null;
};

export type VariantPrice = {
    id: string;
    priceType?: string | null;
    price?: number | null;
    priceStartDate?: string | null;
    priceEndDate?: string | null;
    isActive?: boolean | null;
    saleDaysRemaining?: number | null;
};

export type VariantItem = {
    id: string;
    sku?: string | null;
    retailPrice?: number | null;
    retailSalesPrice?: number | null;
    wholesalePrice?: number | null;
    wholesaleSalesPrice?: number | null;
    stockQuantity?: number | null;
    weightKg?: string | null;
    attributesJson?: string | null;
    images?: ProductImage[] | null;
    product?: { name?: string | null } | null;
};

export type ProductVariant = {
    id: string;
    sku?: string | null;
    stockQuantity?: number | null;
    attributesJson?: string | null;
    weightKg?: string | null;
    prices?: VariantPrice[] | null;
    images?: ProductImage[] | null;
};

export type ProductInformation = {
    product?: {
        id: string;
        slug?: string | null;
        name?: string | null;
        description?: string | null;
        shortDescription?: string | null;
        productType?: string | null;
        createdAt?: string | null;
        categories?: { id: string; name?: string | null; slug?: string | null }[] | null;
        brand?: { id: string; name?: string | null; slug?: string | null } | null;
    } | null;
    variants?: ProductVariant[] | null;
};
