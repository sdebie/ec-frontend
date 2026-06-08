import {storefrontConfigImports} from 'virtual:storefront-config-map';
import {storefrontConfig} from '@/tenants/default/config';
import type {StorefrontClientConfig} from '@/types/storefront/storefrontTypes';

type StorefrontRegistryRecord = Record<string, StorefrontClientConfig>

const fallbackStorefrontRegistry: StorefrontRegistryRecord = {
    default: storefrontConfig,
};

const virtualRegistry = storefrontConfigImports as Partial<StorefrontRegistryRecord>;
const sanitizedVirtualRegistry = Object.fromEntries(
    Object.entries(virtualRegistry).filter(
        (entry): entry is [string, StorefrontClientConfig] => Boolean(entry[1]),
    ),
) as StorefrontRegistryRecord;
const storefrontRegistry: StorefrontRegistryRecord = {
    ...fallbackStorefrontRegistry,
    ...sanitizedVirtualRegistry,
};

const normalizeHostname = (hostname?: string): string => (hostname || '').trim().toLowerCase();

const getClientByHostname = (hostname: string): StorefrontClientConfig | undefined => {
    const normalized = normalizeHostname(hostname);
    if (!normalized) return undefined;

    return Object.values(storefrontRegistry).find((config) =>
        config.hostnames.map(normalizeHostname).includes(normalized),
    );
};

const getClientById = (clientId?: string): StorefrontClientConfig | undefined => {
    if (!clientId) return undefined;
    return storefrontRegistry[clientId];
}

export const resolveStorefrontClientByHostname = (
    hostname: string,
): StorefrontClientConfig | undefined => {
    return getClientByHostname(hostname);
}

export const resolveStorefrontClient = (
    hostname: string,
    forcedClientId?: string,
): StorefrontClientConfig => {
    const forcedClient = getClientById(forcedClientId);
    if (forcedClient) {
        return forcedClient;
    }

    return getClientByHostname(hostname) || storefrontRegistry.default;
};

export const resolveStorefrontClientById = (
    clientId?: string,
): StorefrontClientConfig | undefined => getClientById(clientId)

export const getStorefrontRegistry = (): StorefrontRegistryRecord =>
    storefrontRegistry;

