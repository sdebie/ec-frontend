import type { ShippingMethod, CountrySetting } from '@/types/shared/SettingsTypes.ts';
export type { ShippingMethod, CountrySetting };

export type StoreSetting = {
    key: string;
    value: string;
    description?: string | null;
};

export type Settings = {
    storeSettings?: StoreSetting[];
    shippingMethods?: ShippingMethod[];
    countrySettings?: CountrySetting[];
};