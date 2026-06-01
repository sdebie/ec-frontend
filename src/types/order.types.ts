// Order response types (read from API)
export type OrderData = {
    id?: string;
    sessionId?: string;
    createDate?: string;
    createdAt?: string;
    updatedAt?: string;
    totalAmount?: number;
    itemCount?: number;
    status?: string;
    customer?: CustomerInformation;
    items?: OrderItemData[];
};

export type OrderItemData = {
    id?: string;
    unitPrice?: number;
    quantity?: number;
    /** Pre-enrichment: variant ID string. Post-enrichment: populated VariantData object. */
    variant?: VariantData | string;
    /** Product name captured at add-to-cart time — used as display fallback in CartItemRow. */
    productName?: string;
};

export type VariantData = {
    id?: string;
    stockQuantity?: number;
    weightKg?: number;
    attributesJson?: string;
    images?: ProductImageData[];
    product?: ProductData;
    /** Enriched from `variantsByIds` — used for tier-aware cart display. */
    prices?: Array<{
        priceType?: string | null;
        price?: number | null;
        isActive?: boolean | null;
        active?: boolean | null;
    }> | null;
};

export type ProductImageData = {
    id?: string;
    imageUrl?: string;
    sortOrder?: number | null;
    isFeatured?: boolean | null;
};

export type ProductData = {
    name: string;
};

export type OrderStatusHistoryData = {
    id?: string;
    status?: string;
    comment?: string;
    changedBy?: string;
    createdAt?: string;
};

export type OrderDetailData = {
    id?: string;
    sessionId?: string;
    totalAmount?: number;
    status?: string;
    createdAt?: string;
    shippingPhone?: string;
    shippingAddressLine1?: string;
    shippingAddressLine2?: string;
    shippingCity?: string;
    shippingProvince?: string;
    shippingPostalCode?: string;
    customerEntity?: CustomerInformation;
    items?: OrderItemData[];
    statusHistory?: OrderStatusHistoryData[];
};

/** Narrows a `VariantData | string | undefined` to `VariantData | undefined`. */
export function asVariant(v: VariantData | string | undefined): VariantData | undefined {
    return typeof v === 'object' && v !== null ? v : undefined;
}

export type CustomerInformation = {
    email?: string;
};

// Order input type (write to API)
export type OrderInput = {
    orderId?: number | null;
    sessionId?: string;
    items?: OrderItemInput[];
};

export type OrderItemInput = {
    unitPrice?: number;
    quantity?: number;
    variant?: string;
    name?: string;
};
