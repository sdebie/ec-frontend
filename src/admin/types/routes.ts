import type {ComponentType, LazyExoticComponent} from 'react'

export interface AdminRouteMeta {
    label?: string
    section?: string
    pageBackgroundType: 'plain' | 'image'
    pageContainerType: 'contained' | 'gutterless'
    icon?: string
    menuMatch?: 'exact'
}

export interface AdminRouteConfig {
    key: string
    path: string
    component?: LazyExoticComponent<ComponentType>
    authority: string[]
    meta: AdminRouteMeta
    subMenu?: AdminRouteConfig[]
}

export type AdminRouteList = AdminRouteConfig[]
