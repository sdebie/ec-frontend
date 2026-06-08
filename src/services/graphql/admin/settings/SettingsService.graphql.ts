import getServiceEndpoint from "@/utils/HostnameResolver.ts";
import {CountrySetting, Settings, ShippingMethod, StoreSetting} from "@/types/admin/SettingsTypes";
import {GraphQLService} from "@/services/graphql/GraphQLService.ts";
import {
    SETTINGS,
    STORE_SETTINGS,
    SAVE_STORE_SETTINGS,
    SHIPPING_METHODS,
    COUNTRY_SETTINGS,
    UPDATE_SETTING,
    SAVE_SHIPPING_METHOD,
} from "@/services/graphql/admin/settings/settings.queries.ts";

const graphQLEndpoint = getServiceEndpoint(8080) + '/api/graphql';

export async function apiGetSettings(): Promise<Settings | null> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

    const result = await client.request<{ settings: Settings }>(SETTINGS, {});

    return result.settings ?? null;
}

export async function apiGetStoreSettings(): Promise<StoreSetting[]> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

    const result = await client.request<{ storeSettings: StoreSetting[] }>(STORE_SETTINGS);

    return result.storeSettings ?? [];
}

export async function apiSaveStoreSettings(settings: StoreSetting[]): Promise<StoreSetting[]> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

    const result = await client.request<{ saveStoreSettings: StoreSetting[] }>(SAVE_STORE_SETTINGS, {
        storeSettingsDto: settings
    });

    return result.saveStoreSettings ?? [];
}

export async function apiGetShippingMethods(): Promise<ShippingMethod[]> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

    const result = await client.request<{ shippingMethods: ShippingMethod[] }>(SHIPPING_METHODS);

    return result.shippingMethods ?? [];
}

export async function apiGetCountrySettings(): Promise<CountrySetting[]> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

    const result = await client.request<{ countrySettings: CountrySetting[] }>(COUNTRY_SETTINGS);

    return result.countrySettings ?? [];
}

export async function apiUpdateSetting(key: string, value: string): Promise<StoreSetting> {
    if (!key) throw new Error("Setting key is required");
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

    const result = await client.request<{ updateSetting: StoreSetting }>(UPDATE_SETTING, {key, value});

    return result.updateSetting;
}

export async function apiSaveShippingMethod(method: ShippingMethod): Promise<ShippingMethod> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);

    const methodDto = {
        id: method.id,
        name: method.name,
        isActive: method.active,
        baseFee: method.baseFee,
        estimatedDays: method.estimatedDays,
    };

    const result = await client.request<{ saveShippingMethod: ShippingMethod }>(SAVE_SHIPPING_METHOD, {
        methodDto
    });

    return result.saveShippingMethod;
}

