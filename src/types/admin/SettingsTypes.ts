
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

export type CountrySetting = {
    countryCode: string;
    countryName: string;
    currencyCode: string;
    locale: string;
    decimalPlaces: number;
    isDefault: boolean;
    isActive: boolean;
};

export type Settings = {
    storeSettings?: StoreSetting[]
    shippingMethods?: ShippingMethod[]
    countrySettings?: CountrySetting[]
};