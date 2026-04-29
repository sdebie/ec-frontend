import { lazy } from 'react';
import type { ComponentType } from 'react';
import type {
  StorefrontPageComponent,
  StorefrontPageKey,
} from '@/types/storefront/storefrontPageContracts.ts';
import type { StorefrontClientId } from '@/types/storefront/storefrontTypes.ts';
import { storefrontPageImports } from 'virtual:storefront-page-map';
import {normalizeDiscoveredStorefrontPageKey} from '@/configs/storefront/storefrontPageKeyNormalization';

type StorefrontPageLoader = () => Promise<{ default: ComponentType<any> }>;

const conventionImports = storefrontPageImports as Record<string, StorefrontPageLoader>;
const conventionPageRegistry = Object.fromEntries(
  Object.entries(conventionImports).map(([key, loader]) => [key, lazy(loader)]),
) as Record<string, StorefrontPageComponent>;

const normalizedConventionPageRegistry = Object.entries(conventionPageRegistry).reduce(
  (registry, [key, component]) => {
    registry[key] = component

    const [tenantId, discoveredPageKey] = key.split('/')
    if (!tenantId || !discoveredPageKey) {
      return registry
    }

    const normalizedPageKey = normalizeDiscoveredStorefrontPageKey(discoveredPageKey)
    if (!normalizedPageKey) {
      return registry
    }

    registry[`${tenantId}/${normalizedPageKey}`] = component
    return registry
  },
  {} as Record<string, StorefrontPageComponent>,
)

export function resolveStorefrontConventionPage(
  tenantId: StorefrontClientId,
  pageKey: StorefrontPageKey,
): StorefrontPageComponent | undefined {
  const tenantKey = `${tenantId}/${pageKey}`;
  const defaultKey = `default/${pageKey}`;
  return normalizedConventionPageRegistry[tenantKey] ?? normalizedConventionPageRegistry[defaultKey];
}

