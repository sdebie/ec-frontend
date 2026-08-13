import {NavLink} from 'react-router-dom'
import {cn} from '@/shared/utils/cn'
import {SidebarItemContent} from './SidebarItemContent'
import {SidebarSubMenu} from './SidebarSubMenu'
import type {AdminRouteConfig} from '@/admin/types/routes'

interface SidebarItemProps {
    route: AdminRouteConfig
    isChild?: boolean
    isCollapsed: boolean
    setCollapsed: (collapsed: boolean) => void
    onItemClick?: () => void
    isActiveGroup?: boolean
}

export function SidebarItem({
                                route,
                                isChild,
                                isCollapsed,
                                setCollapsed,
                                onItemClick,
                                isActiveGroup,
                            }: SidebarItemProps) {
    if (route.subMenu && route.subMenu.length > 0) {
        return (
            <SidebarSubMenu
                route={route}
                isCollapsed={isCollapsed}
                setCollapsed={setCollapsed}
                onItemClick={onItemClick}
                isActiveGroup={isActiveGroup}
            />
        )
    }

    return (
        <NavLink
            to={route.path}
            end={route.meta.menuMatch === 'exact'}
            title={isCollapsed ? route.meta.label : undefined}
            onClick={onItemClick}
            className={({isActive}) =>
                cn(
                    'group flex items-center rounded-(--c-radius) w-full text-[13px]',
                    isCollapsed ? 'justify-center px-2 py-1.5' : 'px-3 py-1.5',
                    isChild && !isCollapsed && 'pl-4 relative z-10',
                    isActive
                        ? isChild
                            // Sub-items sit beside the connector line already marking the active
                            // branch, so the active one only needs to read like a permanent
                            // hover — accent text, no background — not a second highlighted box.
                            ? 'text-primary font-semibold'
                            : 'bg-primary-subtle text-primary font-semibold ring-2 ring-primary'
                        : 'text-(--c-text-muted) hover:bg-(--c-surface-hover) hover:text-(--c-text)',
                )
            }
        >
            <SidebarItemContent
                label={route.meta.label}
                icon={route.meta.icon}
                isCollapsed={isCollapsed}
            />
        </NavLink>
    )
}
