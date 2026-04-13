// Order response types (read from API)
export type OrderData = {
    id?: string;
    sessionId?: string;
    createdAt?: string;
    updatedAt?: string;
    totalAmount?: number;
    status?: string;
    items?: OrderItemData[];
};

export type OrderItemData = {
    id?: string;
    unitPrice?: number;
    quantity?: number;
    /** Pre-enrichment: variant ID string. Post-enrichment: populated VariantData object. */
    variant?: VariantData | string;
};

export type VariantData = {
    id?: string;
    stockQuantity?: number;
    weightKg?: number;
    attributesJson?: string;
    images?: ProductImageData[];
    product?: ProductData;
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

