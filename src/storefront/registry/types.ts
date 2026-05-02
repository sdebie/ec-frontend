import type {ComponentType, ReactNode} from 'react'
import type {RouteObject} from '@/types/routes.ts'
import type {
    NavMenuItem,
    StorefrontClientConfig,
} from '@/types/storefront/storefrontTypes.ts'
import type {
    StorefrontPageComponent,
    StorefrontPageKey,
} from '@/types/storefront/storefrontPageContracts.ts'

export type StorefrontLayoutId = 'default' | 'shop'

export interface StorefrontResolvedPage {
    pageKey: StorefrontPageKey
    component: StorefrontPageComponent
    resolvedVariant: string
    fallbackApplied: boolean
}

export interface StorefrontNavigationModel {
    items: NavMenuItem[]
    knownPaths: Set<string>
}

export interface StorefrontContextValue {
    config: StorefrontClientConfig
    navigation: StorefrontNavigationModel
    switchTenant: (tenantId: string) => void
}

export interface ResolveStorefrontConfigOptions {
    hostname?: string
    pathname?: string
    forcedClientId?: string
}

export interface StorefrontShellRenderProps {
    storefrontConfig: StorefrontClientConfig
    activeCategory: string
    onSelectCategory: (value: string) => void
    children?: ReactNode
}

export type StorefrontLayoutRegistry = Record<
    StorefrontLayoutId,
    ComponentType<StorefrontShellRenderProps>
>

export interface StorefrontRouteInput {
    route: RouteObject
    isAuthenticated: boolean
    isAdminDomain: boolean
    activeCategory: string
    setActiveCategory: (value: string) => void
    onLoginSuccess: () => void
    storefrontConfig: StorefrontClientConfig
}

