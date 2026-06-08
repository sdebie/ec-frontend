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
