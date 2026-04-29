import type {ComponentType, LazyExoticComponent, ReactNode} from 'react'

export type PageHeaderProps = {
    title?: ReactNode
    description?: ReactNode
    contained?: boolean
    extraHeader?: ReactNode
}

export interface PageMeta {
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    pageBackgroundType?: 'default' | 'plain'
    layout?: 'default' | 'plain' | 'full' | 'shop'
    header?: PageHeaderProps
    footer?: boolean
}

export interface RouteMeta extends PageMeta {
    headerTitle?: string;
    label?: string
    icon?: string | ReactNode
    hideInMenu?: boolean
    showInSidebar?: boolean
    section?: string
    menuMatch?: 'exact' | 'prefix'

    [key: string]: unknown;
}

// Generic route interface
export interface RouteObject {
    key: string
    path: string
    component: ComponentType<any>
    authority?: string[]
    meta?: RouteMeta
    subMenu?: RouteObject[]
}

// Page and menu routes with lazy-loaded components
export type PageRoute = {
    key: string
    path: string
    component: LazyExoticComponent<ComponentType<any>>
    authority: string[]
    meta: RouteMeta
    subMenu?: PageRoute[]
}

export type Route = {
    key: string
    path: string
    component: LazyExoticComponent<ComponentType<any>>
    authority: string[]
    meta: RouteMeta
    subMenu?: Route[]
}

export type PageRoutes = PageRoute[]
export type Routes = Route[]
