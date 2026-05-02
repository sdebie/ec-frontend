import type {LazyExoticComponent, ComponentType} from 'react'
import type {StorefrontPageKey} from '@/types/storefront/storefrontPageKeys'
import type {PageMeta, PageRoute, Route, RouteMeta} from '@/types/routes'
import {storeMenuRoutes} from '@/configs/routes/store/storeMenuRoutes.config'
import {storeRoutingRoutes} from '@/configs/routes/store/storePageRoutes.config'

type StorefrontRouteComponent = LazyExoticComponent<ComponentType<any>>

export interface StorefrontRouteContract {
    key: StorefrontPageKey
    path: string
    component: StorefrontRouteComponent
    menu: boolean
    meta: PageMeta
}

const menuRouteKeySet = new Set(storeMenuRoutes.map((route) => route.key))

const storefrontRouteContracts: ReadonlyArray<StorefrontRouteContract> = storeRoutingRoutes.map((route) => ({
    key: route.key as StorefrontPageKey,
    path: route.path,
    component: route.component as StorefrontRouteComponent,
    menu: menuRouteKeySet.has(route.key),
    meta: route.meta as PageMeta,
}))

function toRoute(contract: StorefrontRouteContract): Route {
    return {
        key: contract.key,
        path: contract.path,
        component: contract.component,
        authority: [],
        meta: contract.meta as RouteMeta,
    }
}

function toPageRoute(contract: StorefrontRouteContract): PageRoute {
    return {
        key: contract.key,
        path: contract.path,
        component: contract.component,
        authority: [],
        meta: contract.meta as RouteMeta,
    }
}

export function listStorefrontRouteContracts(): StorefrontRouteContract[] {
    return storefrontRouteContracts.map((contract) => ({...contract}))
}

export function listStorefrontMenuRoutes(): Route[] {
    return storefrontRouteContracts.filter((route) => route.menu).map(toRoute)
}

export function listStorefrontPageRoutes(): PageRoute[] {
    return storefrontRouteContracts.map(toPageRoute)
}

