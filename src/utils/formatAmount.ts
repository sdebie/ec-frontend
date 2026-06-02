import type {CountrySetting} from '@/types/shared/SettingsTypes.ts';
import {getSystemSettings} from '../settings'; // Import getSystemSettings

export type MoneyFormatOptions = {
    currencyCode?: string;
    locale?: string;
    decimalPlaces?: number;
    fallback?: string;
};

const DEFAULT_LOCALE = "en-ZA";
const DEFAULT_CURRENCY = "ZAR";
const DEFAULT_DECIMALS = 2;

export function formatAmount(amount?: number | null, options: MoneyFormatOptions = {}): string {
    if (typeof amount !== "number" || Number.isNaN(amount)) {
        return options.fallback ?? "-";
    }

    const systemSettings = getSystemSettings();
    const defaultLocale = systemSettings?.countrySetting?.locale;
    const defaultCurrencyCode = systemSettings?.countrySetting?.currencyCode;
    const defaultDecimalPlaces = systemSettings?.countrySetting?.decimalPlaces;

    const locale = options.locale || defaultLocale || DEFAULT_LOCALE;
    const currencyCode = (options.currencyCode || defaultCurrencyCode || DEFAULT_CURRENCY).toUpperCase();
    const decimalPlaces = Number.isInteger(options.decimalPlaces)
        ? Math.max(0, options.decimalPlaces as number)
        : (defaultDecimalPlaces !== undefined ? defaultDecimalPlaces : DEFAULT_DECIMALS);

    try {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: currencyCode,
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
        }).format(amount);
    } catch {
        return `${currencyCode} ${amount.toFixed(decimalPlaces)}`;
    }
}

export function createCountryMoneyFormatter(countrySetting?: CountrySetting | null) {
    return (amount?: number | null, fallback?: string) =>
        formatAmount(amount, {
            currencyCode: countrySetting?.currencyCode,
            locale: countrySetting?.locale,
            decimalPlaces: countrySetting?.decimalPlaces,
            fallback,
        });
}

export function getDefaultCountrySetting(countrySettings: CountrySetting[]): CountrySetting | null {
    if (!Array.isArray(countrySettings) || countrySettings.length === 0) {
        return null;
    }

    return countrySettings.find((item) => item.isDefault && item.isActive)
        ?? countrySettings.find((item) => item.isActive)
        ?? countrySettings[0];
}

export default formatAmount;