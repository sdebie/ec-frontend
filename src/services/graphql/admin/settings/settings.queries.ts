import {gql} from "graphql-request";

export const SETTINGS = gql`
    query Settings {
        settings {
            storeSettings {
                key
                value
                description
            }
            shippingMethods {
                id
                name
                active
                baseFee
                estimatedDays
            }
            countrySettings {
                countryCode
                countryName
                currencyCode
                locale
                decimalPlaces
                isDefault
                isActive
            }
        }
    }
`;

export const STORE_SETTINGS = gql`
    query AllSettings {
        storeSettings {
            key
            value
            description
        }
    }
`;

export const SAVE_STORE_SETTINGS = gql`
    mutation SaveStoreSettings($storeSettingsDto: [StoreSettingsDtoInput!]!) {
        saveStoreSettings(storeSettingsDto: $storeSettingsDto) {
            key
            value
            description
        }
    }
`;

export const SHIPPING_METHODS = gql`
    query ShippingMethods {
        shippingMethods {
            id
            name
            active
            baseFee
            estimatedDays
        }
    }
`;

export const COUNTRY_SETTINGS = gql`
    query CountrySettings {
        countrySettings {
            countryCode
            countryName
            currencyCode
            locale
            decimalPlaces
            isDefault
            isActive
        }
    }
`;

export const UPDATE_SETTING = gql`
    mutation UpdateSetting($key: String!, $value: String!) {
        updateSetting(key: $key, value: $value) {
            key
            value
            description
        }
    }
`;

export const SAVE_SHIPPING_METHOD = gql`
    mutation SaveShippingMethod($methodDto: ShippingMethodDtoInput!) {
        saveShippingMethod(methodDto: $methodDto) {
            id
            name
            active
            baseFee
            estimatedDays
        }
    }
`;

