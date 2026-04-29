interface ImportMetaEnv {
    readonly VITE_STORE_FRONT?: string
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