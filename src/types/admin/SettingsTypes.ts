
export type StoreSetting = {
    key: string;
    value: string;
    description?: string | null;
};

export type ShippingMethod = {
    id?: string | null;
    name?: string | null;
    active?: boolean | null;
    baseFee?: number | null;
    estimatedDays?: string | null;
};

export type Settings = {
    storeSettings?: StoreSetting[]
    shippingMethods?: ShippingMethod[]
};