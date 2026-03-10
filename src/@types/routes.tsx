import type { LazyExoticComponent, ComponentType, ReactNode } from 'react'

export type PageHeaderProps = {
    title?: ReactNode
    description?: ReactNode
    contained?: boolean
    extraHeader?: ReactNode
}

export interface Meta {
    pageContainerType?: 'default' | 'gutterless' | 'contained'
    pageBackgroundType?: 'default' | 'plain'
    header?: PageHeaderProps
    footer?: boolean
    label?: string
    icon?: string | ReactNode
    hideInMenu?: boolean
    showInSidebar?: boolean
    section?: string
    menuMatch?: 'exact' | 'prefix'
}

export type Route = {
    key: string
    path: string
    component: LazyExoticComponent<ComponentType<any>>
    authority: string[]
    meta: Meta
    subMenu?: Route[]
}

export type Routes = Route[]