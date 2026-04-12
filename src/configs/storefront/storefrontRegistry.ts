import {defaultStorefrontConfig} from '@/configs/storefront/clients/defaultStorefrontConfig';
import type {StorefrontClientConfig, StorefrontClientId} from '@/types/storefront/storefrontTypes';
import {clientUvhStorefrontConfig} from "@/configs/storefront/clients/clientUvhStorefrontConfig.ts";

const storefrontRegistry: Record<StorefrontClientId, StorefrontClientConfig> = {
    default: defaultStorefrontConfig,
    uvh: clientUvhStorefrontConfig,
};

const normalizeHostname = (hostname?: string): string => (hostname || '').trim().toLowerCase();

const getClientByHostname = (hostname: string): StorefrontClientConfig | undefined => {
    const normalized = normalizeHostname(hostname);
    if (!normalized) return undefined;

    return Object.values(storefrontRegistry).find((config) =>
        config.hostnames.map(normalizeHostname).includes(normalized),
    );
};

export const resolveStorefrontClient = (
    hostname: string,
    forcedClientId?: string,
): StorefrontClientConfig => {
    if (forcedClientId && forcedClientId in storefrontRegistry) {
        return storefrontRegistry[forcedClientId as StorefrontClientId];
    }

    return getClientByHostname(hostname) || storefrontRegistry.default;
};

export const getStorefrontRegistry = (): Record<StorefrontClientId, StorefrontClientConfig> =>
    storefrontRegistry;

