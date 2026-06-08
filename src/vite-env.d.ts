interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string
    readonly VITE_STORE_FRONT?: string
    readonly VITE_DEFAULT_TENANT_ID?: string
    readonly VITE_API_URL?: string
    readonly CI?: string
    readonly MODE: string
    readonly DEV: boolean
    readonly PROD: boolean
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare module 'virtual:storefront-config-map' {
    import type { StorefrontClientConfig } from '@/types/storefront/storefrontTypes';
    export const storefrontConfigImports: Partial<Record<string, StorefrontClientConfig>>;
}

declare module 'virtual:storefront-page-map' {
    export const storefrontPageImports: Record<string, () => Promise<{ default: import('react').ComponentType<any> }>>;
}