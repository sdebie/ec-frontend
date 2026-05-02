const getEnvString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeStorefrontTenant = (value: unknown): string | undefined => {
  const tenant = getEnvString(value)?.toLowerCase();
  if (!tenant || tenant === 'all') return undefined;
  return tenant;
};

export const env = {
  storefrontTenant: normalizeStorefrontTenant(import.meta.env.VITE_STORE_FRONT),
  storefrontDefaultTenant: normalizeStorefrontTenant(import.meta.env.VITE_DEFAULT_TENANT_ID),
  storefrontBuildTarget: getEnvString(import.meta.env.VITE_STORE_FRONT)?.toLowerCase() ?? 'all',
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  isCi: getEnvString(import.meta.env.CI)?.toLowerCase() === 'true',
} as const;

